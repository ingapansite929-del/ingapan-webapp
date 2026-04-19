"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductCategory } from "@/types";
import ProductCard from "./ProductCard";
import ScrollReveal from "./ScrollReveal";

interface ProductCarouselProps {
  products: ProductCategory[];
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const hasMultipleSlides = products.length > 1;

  return (
    <section id="produtos" className="bg-brand-light py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-12 text-center md:mb-16">
            <h2 className="font-[var(--font-heading)] text-3xl font-bold text-brand-dark md:text-4xl">
              Nossos Produtos
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-brand-yellow" />
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 md:text-lg">
              Oferecemos uma ampla variedade de produtos alimentícios para
              atender às necessidades do seu negócio.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="relative">
            {/* Carousel */}
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="min-w-0 flex-[0_0_100%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {hasMultipleSlides ? (
              <>
                <button
                  onClick={scrollPrev}
                  className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-brand-red p-2.5 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-brand-red/90 md:-left-5 md:p-3"
                  aria-label="Produto anterior"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={scrollNext}
                  className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-brand-red p-2.5 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-brand-red/90 md:-right-5 md:p-3"
                  aria-label="Próximo produto"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            ) : null}
          </div>

          {/* Dot Indicators */}
          {hasMultipleSlides ? (
            <div className="mt-8 flex justify-center gap-2">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === selectedIndex
                      ? "w-8 bg-brand-red"
                      : "w-2.5 bg-brand-dark/20 hover:bg-brand-dark/40"
                  }`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </ScrollReveal>
      </div>
    </section>
  );
}
