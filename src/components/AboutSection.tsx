"use client";

import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import { CheckCircle, Truck, Users, Award } from "lucide-react";

export default function AboutSection() {
  const features = [
    {
      icon: <Truck className="h-6 w-6 text-brand-red" />,
      title: "Logística Eficiente",
      description: "Frota própria e roteirização inteligente para entregas pontuais.",
    },
    {
      icon: <Award className="h-6 w-6 text-brand-red" />,
      title: "Produtos de Qualidade",
      description: "Parceria com as melhores marcas do mercado alimentício.",
    },
    {
      icon: <Users className="h-6 w-6 text-brand-red" />,
      title: "Atendimento Personalizado",
      description: "Equipe de vendas dedicada para entender seu negócio.",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-brand-red" />,
      title: "Confiança e Tradição",
      description: "Anos de experiência no setor de distribuição.",
    },
  ];

  return (
    <section id="sobre" className="relative overflow-hidden py-20 md:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <ScrollReveal>
              <p className="text-sm font-medium tracking-[0.16em] text-brand-red uppercase">
                Sobre a Ingapan
              </p>
              <h2 className="mt-3 font-[var(--font-heading)] text-3xl leading-[1.03] font-bold tracking-[-0.02em] text-brand-dark md:text-4xl lg:text-5xl">
                Levando qualidade para o seu negócio
              </h2>
              <div className="mt-5 h-1 w-20 rounded-full bg-brand-yellow" />
              
              <p className="mt-7 max-w-[64ch] text-lg leading-relaxed text-gray-700">
                A Ingapan é referência na distribuição de alimentos, conectando grandes marcas a estabelecimentos que prezam pela excelência. Nossa missão é garantir que produtos frescos e de alta qualidade cheguem à sua prateleira com agilidade e segurança.
              </p>
              
              <p className="mt-5 max-w-[64ch] text-lg leading-relaxed text-gray-700">
                Com uma infraestrutura moderna e uma equipe apaixonada pelo que faz, atendemos padarias, mercados, restaurantes e comércios em geral, oferecendo um mix variado que atende todas as necessidades do dia a dia.
              </p>

              <div className="mt-11 grid gap-4 sm:grid-cols-2">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-2xl bg-white/80 p-4 shadow-[0_16px_30px_-28px_rgba(34,34,34,0.7)] ring-1 ring-brand-dark/5 backdrop-blur-sm"
                  >
                    <div className="flex-shrink-0 rounded-xl bg-brand-light p-3">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-dark">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Image Content */}
          <div className="order-1 lg:order-2 relative">
            <ScrollReveal delay={200}>
              <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
                {/* Main Image */}
                <div className="absolute inset-0 z-10 overflow-hidden rounded-[1.75rem] bg-gray-100 shadow-[0_34px_70px_-40px_rgba(34,34,34,0.75)]">
                   <Image
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
                    alt="Centro de distribuição de alimentos"
                    fill
                    className="object-cover object-center transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -bottom-7 -right-7 -z-10 h-full w-full rounded-[1.75rem] bg-brand-yellow/20" />
                <div className="absolute -top-7 -left-7 -z-10 h-full w-full rounded-[1.75rem] bg-brand-red/5" />
                
                {/* Floating Badge (optional, visually appealing) */}
                <div className="absolute bottom-9 -left-8 z-20 hidden md:block">
                  <div className="rounded-2xl border-l-4 border-brand-yellow bg-white/95 p-4 shadow-[0_20px_34px_-26px_rgba(34,34,34,0.85)] backdrop-blur-sm">
                    <p className="font-[var(--font-heading)] text-2xl font-bold text-brand-dark">+1000</p>
                    <p className="text-sm font-medium text-gray-600">Clientes atendidos</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
