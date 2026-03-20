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
    <section id="sobre" className="relative overflow-hidden py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 lg:items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <ScrollReveal>
              <h2 className="font-[var(--font-heading)] text-3xl font-bold leading-tight text-brand-dark md:text-4xl lg:text-5xl">
                Levando qualidade para o seu negócio
              </h2>
              <div className="mt-4 h-1 w-20 rounded-full bg-brand-yellow" />
              
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                A Ingapan é referência na distribuição de alimentos, conectando grandes marcas a estabelecimentos que prezam pela excelência. Nossa missão é garantir que produtos frescos e de alta qualidade cheguem à sua prateleira com agilidade e segurança.
              </p>
              
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                Com uma infraestrutura moderna e uma equipe apaixonada pelo que faz, atendemos padarias, mercados, restaurantes e comércios em geral, oferecendo um mix variado que atende todas as necessidades do dia a dia.
              </p>

              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 rounded-lg bg-brand-light p-3 shadow-sm">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-dark">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
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
              <div className="relative aspect-square w-full max-w-md mx-auto lg:max-w-none">
                {/* Main Image */}
                <div className="absolute inset-0 z-10 overflow-hidden rounded-2xl bg-gray-100 shadow-2xl">
                   <Image
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
                    alt="Centro de distribuição de alimentos"
                    fill
                    className="object-cover object-center transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -bottom-6 -right-6 -z-10 h-full w-full rounded-2xl bg-brand-yellow/20" />
                <div className="absolute -top-6 -left-6 -z-10 h-full w-full rounded-2xl bg-brand-red/5" />
                
                {/* Floating Badge (optional, visually appealing) */}
                <div className="absolute bottom-8 -left-8 z-20 hidden md:block">
                  <div className="rounded-lg bg-white p-4 shadow-xl border-l-4 border-brand-yellow">
                    <p className="font-bold text-2xl text-brand-dark">+1000</p>
                    <p className="text-sm font-medium text-gray-600">Clientes Atendidos</p>
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
