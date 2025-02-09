"use client";

import { useState, useRef, TouchEvent } from "react";
import { ARScene } from "@/components/ARScene";
import { PRODUCTS } from "@/constants/products";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const SWIPE_THRESHOLD = 50; // Mínima distância para considerar como swipe

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % PRODUCTS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + PRODUCTS.length) % PRODUCTS.length);
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        // Swipe para esquerda
        handleNext();
      } else {
        // Swipe para direita
        handlePrev();
      }
    }
  };

  const currentProduct = PRODUCTS[currentIndex];

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between p-24"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ARScene currentIndex={currentIndex} />

      <div className="telaQuadrados">
        <div className="quadrado quadrado1"></div>
        <div className="quadrado quadrado2"></div>
        <div className="quadrado quadrado3"></div>

        <div className="quadradoProduto">
          <div className="nomeProduto">{currentProduct.name}</div>
          <div className="descricaoProduto">{currentProduct.description}</div>
          <div className="precoProduto">Hoje por {currentProduct.price}!</div>
          <div className="bolaFundo1"></div>
          <div className="bolaFundo2"></div>
        </div>
      </div>

      <div className="telaBotoes w-full fixed bottom-0 left-0 z-[101] flex justify-between items-center">
        <button className="btnCtrl btnRetornar" onClick={handlePrev}>
          {"<"}
        </button>
        <button className="btnCtrl btnAvancar" onClick={handleNext}>
          {">"}
        </button>
      </div>
    </main>
  );
}
