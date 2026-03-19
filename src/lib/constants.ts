import type { ProductCategory, ContactInfo } from "@/types";

export const IMAGES = {
  hero: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80",
  bread:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
  dairy:
    "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&q=80",
  deli: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80",
  beverages:
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80",
  canned:
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80",
  grains:
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
  sweets:
    "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80",
  produce:
    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80",
};

export const PRODUCTS: ProductCategory[] = [
  {
    id: "paes",
    name: "Pães e Padaria",
    description: "Variedade de pães frescos e produtos de panificação.",
    image: IMAGES.bread,
  },
  {
    id: "laticinios",
    name: "Laticínios",
    description: "Leites, queijos, manteigas e derivados de qualidade.",
    image: IMAGES.dairy,
  },
  {
    id: "frios",
    name: "Frios e Embutidos",
    description: "Presuntos, salames e frios selecionados.",
    image: IMAGES.deli,
  },
  {
    id: "bebidas",
    name: "Bebidas",
    description: "Sucos, refrigerantes, águas e bebidas diversas.",
    image: IMAGES.beverages,
  },
  {
    id: "conservas",
    name: "Conservas e Enlatados",
    description: "Produtos em conserva e enlatados práticos.",
    image: IMAGES.canned,
  },
  {
    id: "cereais",
    name: "Cereais e Grãos",
    description: "Arroz, feijão, farinhas e cereais variados.",
    image: IMAGES.grains,
  },
  {
    id: "doces",
    name: "Doces e Confeitaria",
    description: "Chocolates, biscoitos e produtos de confeitaria.",
    image: IMAGES.sweets,
  },
  {
    id: "hortifruti",
    name: "Hortifruti",
    description: "Frutas e verduras frescas e selecionadas.",
    image: IMAGES.produce,
  },
];

export const CONTACT: ContactInfo = {
  phone: "(44) 3028-7898",
  email: "contato@ingapan.com.br",
  address: "Maringá, Paraná",
};

export const SOCIAL_LINKS = [
  { name: "Instagram", url: "https://instagram.com/ingapan_maringa", icon: "instagram" },
  { name: "Facebook", url: "https://facebook.com/ingapan", icon: "facebook" },
  { name: "WhatsApp", url: "https://wa.me/5513991035545", icon: "whatsapp" },
];
