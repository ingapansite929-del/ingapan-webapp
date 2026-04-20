import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";
import { CONTACT, SOCIAL_LINKS } from "@/lib/constants";
import ScrollReveal from "./ScrollReveal";
import Image from "next/image";

const socialIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram size={20} />,
  facebook: <Facebook size={20} />,
  whatsapp: <MessageCircle size={20} />,
};

export default function Footer() {
  return (
    <footer id="contato" className="bg-brand-dark pt-20 pb-10 text-white">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <ScrollReveal>
            <div className="flex flex-col items-center text-center">
              <Image
                src="/images/LOGO.png"
                alt="IngaPan"
                width={200}
                height={133}
                className="h-auto w-48"
              />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-300">
                Distribuidora de produtos alimentícios. Qualidade, variedade
                e confiança para abastecer seu negócio com os melhores
                produtos do mercado.
              </p>
            </div>
          </ScrollReveal>

          {/* Contact */}
          <ScrollReveal delay={150}>
            <div>
              <h3 className="font-[var(--font-heading)] text-lg font-semibold">
                Contato
              </h3>
              <div className="mt-4 space-y-3">
                <a
                  href={`tel:${CONTACT.phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-3 text-sm text-gray-300 transition-colors hover:text-brand-yellow"
                >
                  <Phone size={18} className="shrink-0 text-brand-yellow" />
                  {CONTACT.phone}
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-3 text-sm text-gray-300 transition-colors hover:text-brand-yellow"
                >
                  <Mail size={18} className="shrink-0 text-brand-yellow" />
                  {CONTACT.email}
                </a>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <MapPin size={18} className="shrink-0 text-brand-yellow" />
                  {CONTACT.address}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Social */}
          <ScrollReveal delay={300}>
            <div>
              <h3 className="font-[var(--font-heading)] text-lg font-semibold">
                Siga-nos
              </h3>
              <div className="mt-4 flex gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.name}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-gray-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-yellow hover:bg-brand-yellow hover:text-brand-dark active:translate-y-px"
                  >
                    {socialIcons[link.icon]}
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-700 pt-6 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Ingapan. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
