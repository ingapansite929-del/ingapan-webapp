"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import type { HomepageCarouselState } from "@/features/products/featured";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import ProductCard from "./ProductCard";
import ScrollReveal from "./ScrollReveal";

interface ProductCarouselProps {
  state: HomepageCarouselState;
}

export default function ProductCarousel({ state }: ProductCarouselProps) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
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
  const products = state.status === "ready" ? state.products : [];

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

  const retry = () => {
    startRefresh(() => router.refresh());
  };

  return (
    <section id="produtos" className="bg-brand-light py-20 md:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <ScrollReveal>
          <div className="mb-12 text-center md:mb-16">
            <p className="text-sm font-medium tracking-[0.16em] text-brand-red uppercase">
              Catálogo em destaque
            </p>
            <h2 className="mt-3 font-[var(--font-heading)] text-3xl font-bold tracking-[-0.02em] text-brand-dark md:text-4xl">
              Nossos Produtos
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-brand-yellow" />
            <p className="mx-auto mt-4 max-w-[63ch] text-base leading-relaxed text-gray-600 md:text-lg">
              Oferecemos uma ampla variedade de produtos alimentícios para
              atender às necessidades do seu negócio.
            </p>
          </div>
        </ScrollReveal>

        {state.status === "error" ? (
          <ScrollReveal delay={200}>
            <Alert
              variant="destructive"
              aria-label="Não foi possível carregar os destaques"
              aria-live="polite"
              className="mx-auto max-w-2xl bg-white shadow-[var(--shadow-raised)]"
            >
              <AlertTriangle aria-hidden="true" />
              <AlertTitle>Não foi possível carregar os destaques</AlertTitle>
              <AlertDescription>
                <p>
                  O catálogo continua disponível. Tente carregar esta seção
                  novamente em alguns instantes.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 min-w-44"
                  onClick={retry}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <>
                      <Spinner aria-label="Atualizando destaques" />
                      Atualizando...
                    </>
                  ) : (
                    "Tentar novamente"
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          </ScrollReveal>
        ) : (
          <ScrollReveal delay={200}>
            <div className="relative">
              {/* Carousel */}
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      className="min-w-0 flex-[0_0_100%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]"
                    >
                      <ProductCard product={product} priority={index === 0} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {hasMultipleSlides ? (
                <>
                  <button
                    onClick={scrollPrev}
                    className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-brand-red p-3 text-white shadow-[0_16px_24px_-16px_rgba(186,37,30,0.85)] transition-all duration-200 hover:scale-110 hover:bg-brand-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light active:scale-[0.97] md:-left-5"
                    aria-label="Produto anterior"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-brand-red p-3 text-white shadow-[0_16px_24px_-16px_rgba(186,37,30,0.85)] transition-all duration-200 hover:scale-110 hover:bg-brand-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light active:scale-[0.97] md:-right-5"
                    aria-label="Próximo produto"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              ) : null}
            </div>

            {/* Dot Indicators */}
            {hasMultipleSlides ? (
              <div className="mt-6 flex flex-wrap justify-center">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className="group flex size-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light"
                    aria-label={`Ir para slide ${index + 1}`}
                    aria-current={index === selectedIndex ? "true" : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        index === selectedIndex
                          ? "w-8 bg-brand-red"
                          : "w-2.5 bg-brand-dark/20 group-hover:bg-brand-dark/40"
                      }`}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
