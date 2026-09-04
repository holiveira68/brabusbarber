'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type Slide =
  | { type: 'image'; src: string; alt: string }
  | { type: 'video'; src: string; poster?: string };

const slides: Slide[] = [
  { type: 'image', src: '/carousel/foto1.avif', alt: 'Corte e Estilo' },
  { type: 'image', src: '/carousel/foto2.avif', alt: 'Ambiente da Barbearia' },
  { type: 'image', src: '/carousel/foto3.avif', alt: 'Barba e Acabamento' },
  { type: 'video', src: '/carousel/video1.mp4', poster: '/carousel/thumb.jpg' },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const activeSlide = slides[currentIndex];

  // Alterna automaticamente a cada 4 segundos (apenas para fotos e se o mouse não estiver por cima)
  useEffect(() => {
    if (isPaused || activeSlide.type === 'video') return;

    const timer = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, activeSlide.type]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full max-w-lg overflow-hidden rounded-sm border border-brass/30 bg-ink-surface p-2 shadow-[0_0_50px_-15px_rgba(201,162,75,0.2)]"
    >
      {/* Área da Mídia */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-black/40">
        {activeSlide.type === 'image' ? (
          <Image
            src={activeSlide.src}
            alt={activeSlide.alt}
            fill
            className="object-cover transition-opacity duration-500"
            priority
          />
        ) : (
          <video
            src={activeSlide.src}
            poster={activeSlide.poster}
            autoPlay
            muted
            playsInline
            controls
            onEnded={nextSlide}
            className="h-full w-full object-cover"
          />
        )}

        {/* Badge indicando o tipo/slide */}
        <span className="ticket-number absolute left-3 top-3 bg-ink/80 px-2 py-1 backdrop-blur-sm">
          {currentIndex + 1} / {slides.length} — {activeSlide.type === 'video' ? 'VÍDEO' : 'FOTO'}
        </span>
      </div>

      {/* Controles de Navegação */}
      <div className="mt-3 flex items-center justify-between px-2 pb-1">
        {/* Botão Anterior */}
        <button
          onClick={prevSlide}
          className="btn-outline px-3 py-1 text-xs hover:border-brass hover:text-brass"
          aria-label="Slide anterior"
        >
          ← Anterior
        </button>

        {/* Indicadores (Dots) */}
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? 'w-6 bg-brass' : 'w-2 bg-bone/30'
              }`}
              aria-label={`Ir para o slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Botão Próximo */}
        <button
          onClick={nextSlide}
          className="btn-outline px-3 py-1 text-xs hover:border-brass hover:text-brass"
          aria-label="Próximo slide"
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}

