#!/usr/bin/env python3
"""
Limpa e normaliza a planilha legada de produtos e gera os artefatos de importacao
em massa para o Supabase.

Entrada:
  Um .xls (formato Excel 97-2003) com as colunas:
    COD | Descricao | Grupo | Sub-grupo | Url

Saidas (em scripts/import/):
  - products_clean.csv          -> revisao humana (cabecalhos = colunas do DB)
  - 013_bulk_products_import.sql -> insercao em massa idempotente (categorias,
                                    subcategorias e produtos com FKs resolvidas por JOIN)

Transformacoes:
  - Grupo/Sub-grupo    -> trim + Title Case (pt-BR) + mapa de normalizacao/merge.
  - Descricao          -> products.nome (trim).
  - COD                -> products.codigo.
  - Url                -> products.image_url, com:
      * links google.com/search e paginas de produto Amazon (/dp/) -> NULL (quebrados);
      * links do Google Drive (/file/d/<ID>/view) -> https://drive.google.com/thumbnail?id=<ID>&sz=w1000,
        VALIDADOS ao vivo por Content-Type (os que nao retornam image/* viram NULL);
      * demais URLs mantidas como estao.

Uso:
  python scripts/import/clean_products.py [caminho_do_xls]
  python scripts/import/clean_products.py [caminho_do_xls] --validate-all
"""

from __future__ import annotations

import csv
import os
import re
import sys
import time
import urllib.request
from collections import Counter
from urllib.parse import urlparse

import xlrd  # pip install xlrd (le .xls legado)

# ---------------------------------------------------------------------------
# Configuracao
# ---------------------------------------------------------------------------

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_INPUT = os.path.join(
    os.path.expanduser("~"), "Downloads", "Sem título (1).xls"
)
OUT_CSV = os.path.join(HERE, "products_clean.csv")
OUT_SQL = os.path.join(HERE, "013_bulk_products_import.sql")

# Mapa de normalizacao/merge de subcategorias (aplicado APOS o Title Case).
# A chave (valor "sujo") e mapeada para o valor canonico. Serve para:
#   - corrigir typos;
#   - colapsar subcategorias semelhantes num unico valor (evita repeticao).
# Para mesclar os pares ambiguos, basta descomentar as linhas indicadas.
SUBCATEGORY_MAP: dict[str, str] = {
    "Emusificantes": "Emulsificantes",   # typo -> merge com "Emulsificantes"
    "Adptador Bicos": "Adaptador Bicos",  # typo (mantido separado de "Bicos")
    # --- Candidatos a merge (revisar): descomente para colapsar ---
    # "Canetas/Corantes": "Corantes",
    # "Creme Confeiteiro/Pancreme": "Creme",
}

IMG_EXT = (".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg", ".jfif")
DRIVE_RE = re.compile(r"drive\.google\.com/file/d/([^/]+)/")

# Cache de validacao do Drive: fileid -> url_final | None
_drive_cache: dict[str, str | None] = {}


# ---------------------------------------------------------------------------
# Helpers de transformacao
# ---------------------------------------------------------------------------

def title_case_ptbr(s: str) -> str:
    """Title Case preservando '/' e espacos; nao adiciona acentos."""
    s = s.strip().lower()
    return re.sub(r"[0-9a-zà-ÿ]+", lambda m: m.group(0).capitalize(), s)


def normalize_subcategory(raw: str) -> str:
    tc = title_case_ptbr(raw)
    return SUBCATEGORY_MAP.get(tc, tc)


def validate_drive(fileid: str) -> str | None:
    """
    Retorna a URL thumbnail se o arquivo do Drive servir uma imagem publica,
    senao None. Faz backoff para distinguir rate-limit transitorio de arquivo
    privado/cota (que retorna HTML).
    """
    if fileid in _drive_cache:
        return _drive_cache[fileid]

    url = f"https://drive.google.com/thumbnail?id={fileid}&sz=w1000"
    result: str | None = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                url, headers={"User-Agent": "Mozilla/5.0"}
            )
            with urllib.request.urlopen(req, timeout=25) as resp:
                ctype = (resp.headers.get("Content-Type") or "").lower()
            if ctype.startswith("image/"):
                result = url
                break
            # HTML/erro -> pode ser rate-limit; espera mais e tenta de novo
        except Exception:
            pass
        time.sleep(3 + attempt * 3)
    _drive_cache[fileid] = result
    return result


def validate_generic(url: str) -> str | None:
    """Usado apenas com --validate-all: mantem a URL se retornar image/*."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            ctype = (resp.headers.get("Content-Type") or "").lower()
        return url if ctype.startswith("image/") else None
    except Exception:
        return None


def transform_url(raw: str, validate_all: bool, log: dict) -> str | None:
    u = (raw or "").strip()
    if not u:
        log["empty"] += 1
        return None

    p = urlparse(u)
    host = p.netloc.lower()
    path = p.path.lower()

    # Quebrados sem transformacao confiavel -> NULL
    if "google." in host and "/search" in path:
        log["google_search"] += 1
        return None
    if "amazon." in host and "/dp/" in path:
        log["amazon_page"] += 1
        return None

    # Google Drive -> transforma e valida ao vivo
    m = DRIVE_RE.search(u)
    if m:
        fileid = m.group(1)
        fixed = validate_drive(fileid)
        if fixed:
            log["drive_ok"] += 1
            return fixed
        log["drive_null"] += 1
        log["drive_null_ids"].append(fileid)
        return None

    # Demais URLs: mantem (opcionalmente valida)
    if validate_all:
        ok = validate_generic(u)
        if ok is None:
            log["generic_null"] += 1
            return None
    log["kept"] += 1
    return u


def sql_str(v: str | None) -> str:
    if v is None or v == "":
        return "NULL"
    return "'" + v.replace("'", "''") + "'"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    args = [a for a in sys.argv[1:]]
    validate_all = "--validate-all" in args
    args = [a for a in args if a != "--validate-all"]
    input_path = args[0] if args else DEFAULT_INPUT

    if not os.path.exists(input_path):
        print(f"ERRO: arquivo nao encontrado: {input_path}", file=sys.stderr)
        return 1

    print(f"Lendo: {input_path}")
    wb = xlrd.open_workbook(input_path)
    sh = wb.sheet_by_index(0)

    log = Counter()
    log["drive_null_ids"] = []  # type: ignore[assignment]

    rows: list[dict] = []
    categorias: set[str] = set()
    subcategorias: set[str] = set()
    missing_cat = missing_sub = 0

    for r in range(1, sh.nrows):
        codigo = str(sh.cell_value(r, 0)).strip()
        nome = str(sh.cell_value(r, 1)).strip()
        grupo_raw = str(sh.cell_value(r, 2)).strip()
        sub_raw = str(sh.cell_value(r, 3)).strip()
        url_raw = str(sh.cell_value(r, 4)).strip()

        categoria = title_case_ptbr(grupo_raw) if grupo_raw else None
        subcategoria = normalize_subcategory(sub_raw) if sub_raw else None
        image_url = transform_url(url_raw, validate_all, log)

        if categoria:
            categorias.add(categoria)
        else:
            missing_cat += 1
        if subcategoria:
            subcategorias.add(subcategoria)
        else:
            missing_sub += 1

        rows.append(
            {
                "codigo": codigo,
                "nome": nome,
                "categoria": categoria,
                "subcategoria": subcategoria,
                "image_url": image_url,
            }
        )

    # ---- CSV (revisao humana) ----
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["codigo", "nome", "categoria", "subcategoria", "image_url"])
        for row in rows:
            w.writerow(
                [
                    row["codigo"],
                    row["nome"],
                    row["categoria"] or "",
                    row["subcategoria"] or "",
                    row["image_url"] or "",
                ]
            )

    # ---- SQL (import idempotente) ----
    cat_sorted = sorted(categorias)
    sub_sorted = sorted(subcategorias)
    write_sql(rows, cat_sorted, sub_sorted, input_path)

    # ---- Relatorio ----
    print("\n=== RESUMO ===")
    print(f"Produtos:          {len(rows)}")
    print(f"Categorias:        {len(cat_sorted)} -> {cat_sorted}")
    print(f"Subcategorias:     {len(sub_sorted)} (apos merge)")
    print(f"Linhas sem categoria:    {missing_cat}")
    print(f"Linhas sem subcategoria: {missing_sub}")
    null_imgs = sum(1 for row in rows if not row["image_url"])
    print(f"\nimage_url NULL (total):  {null_imgs}")
    print(f"  google/search:  {log['google_search']}")
    print(f"  amazon /dp/:    {log['amazon_page']}")
    print(f"  vazio:          {log['empty']}")
    print(f"  drive privado/cota (NULL): {log['drive_null']}")
    if validate_all:
        print(f"  generico invalido: {log['generic_null']}")
    print(f"\nGoogle Drive validados como imagem: {log['drive_ok']}")
    if log["drive_null_ids"]:
        print("  IDs do Drive que NAO serviram imagem (revisar compartilhamento):")
        for fid in log["drive_null_ids"]:
            print(f"    - {fid}")
    print(f"\nGerado:\n  {OUT_CSV}\n  {OUT_SQL}")
    return 0


def write_sql(rows, cat_sorted, sub_sorted, input_path):
    lines: list[str] = []
    a = lines.append
    a("-- ============================================================================")
    a("-- Importacao em massa de produtos (gerado por scripts/import/clean_products.py)")
    a(f"-- Origem: {os.path.basename(input_path)}")
    a("--")
    a("-- Pre-requisito: rodar antes 'scripts/012_products_add_codigo.sql'.")
    a("-- Idempotente: ON CONFLICT DO NOTHING em todas as tabelas. Re-executavel.")
    a("-- Rodar como admin / service_role (RLS restringe escrita a is_admin_ingapan).")
    a("-- ============================================================================")
    a("")
    a("BEGIN;")
    a("")
    a("-- 1) Categorias -------------------------------------------------------------")
    a("INSERT INTO public.product_categoria (category) VALUES")
    a(",\n".join(f"  ({sql_str(c)})" for c in cat_sorted))
    a("ON CONFLICT (category) DO NOTHING;")
    a("")
    a("-- 2) Subcategorias ----------------------------------------------------------")
    a("INSERT INTO public.product_subcategory (subcategoria) VALUES")
    a(",\n".join(f"  ({sql_str(s)})" for s in sub_sorted))
    a("ON CONFLICT (subcategoria) DO NOTHING;")
    a("")
    a("-- 3) Produtos ---------------------------------------------------------------")
    a("-- FKs resolvidas por JOIN de nome (sem IDs fixos). 'categoria' (varchar legado)")
    a("-- recebe o nome da categoria por compatibilidade. 'descricao' fica NULL.")
    a("INSERT INTO public.products")
    a("  (codigo, nome, categoria, descricao, image_url, id_categoria, id_subcategoria)")
    a("SELECT v.codigo, v.nome, v.categoria, NULL, v.image_url, c.id, s.id")
    a("FROM (VALUES")
    value_rows = []
    for row in rows:
        value_rows.append(
            "  ("
            + ", ".join(
                [
                    sql_str(row["codigo"]),
                    sql_str(row["nome"]),
                    sql_str(row["categoria"]),
                    sql_str(row["subcategoria"]),
                    sql_str(row["image_url"]),
                ]
            )
            + ")"
        )
    a(",\n".join(value_rows))
    a(") AS v(codigo, nome, categoria, subcategoria, image_url)")
    a("LEFT JOIN public.product_categoria   c ON c.category     = v.categoria")
    a("LEFT JOIN public.product_subcategory s ON s.subcategoria = v.subcategoria")
    a("ON CONFLICT (codigo) DO NOTHING;")
    a("")
    a("COMMIT;")
    a("")
    a("-- ============================================================================")
    a("-- Verificacao rapida (rodar apos o COMMIT):")
    a("--   SELECT count(*) FROM public.products;")
    a("--   SELECT count(*) FROM public.products")
    a("--     WHERE id_categoria IS NULL OR id_subcategoria IS NULL;  -- esperado: 0")
    a("--   SELECT count(*) FROM public.products WHERE image_url IS NULL;")
    a("-- ============================================================================")

    with open(OUT_SQL, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


if __name__ == "__main__":
    raise SystemExit(main())
