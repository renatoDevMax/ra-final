"use client";

import { useEffect, useRef } from "react";
import { PRODUCTS } from "@/constants/products";

interface ARSceneProps {
  currentIndex: number;
}

export function ARScene({ currentIndex }: ARSceneProps) {
  const modelsRef = useRef<any[]>([]);
  const sceneInitializedRef = useRef(false);

  // Efeito para inicialização da cena - roda apenas uma vez
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    // Função para solicitar o wake lock
    const requestWakeLock = async () => {
      try {
        wakeLock = await navigator.wakeLock.request("screen");
        console.log("Wake Lock ativado");
      } catch (err) {
        console.log("Wake Lock não suportado", err);
      }
    };

    // Função para reativar o wake lock quando o documento ficar visível novamente
    const handleVisibilityChange = async () => {
      if (wakeLock !== null && document.visibilityState === "visible") {
        await requestWakeLock();
      }
    };

    // Carrega os scripts necessários
    const initializeScene = async () => {
      if (sceneInitializedRef.current) return;

      await requestWakeLock();
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Carrega A-Frame
      const aframe = document.createElement("script");
      aframe.src = "https://aframe.io/releases/1.4.0/aframe.min.js";
      aframe.crossOrigin = "anonymous";
      document.head.appendChild(aframe);

      await new Promise((resolve) => (aframe.onload = resolve));

      // Carrega AR.js
      const arjs = document.createElement("script");
      arjs.src =
        "https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js";
      arjs.crossOrigin = "anonymous";
      document.head.appendChild(arjs);

      await new Promise((resolve) => (arjs.onload = resolve));

      // Cria a cena AR
      const scene = document.createElement("a-scene");
      scene.setAttribute("embedded", "");
      scene.setAttribute(
        "arjs",
        "sourceType: webcam; debugUIEnabled: false; trackingMethod: best;"
      );
      scene.setAttribute("renderer", "antialias: true; alpha: true;");
      scene.setAttribute("vr-mode-ui", "enabled: false");

      // Cria o marcador
      const marker = document.createElement("a-marker");
      marker.setAttribute("preset", "hiro");
      marker.setAttribute("type", "pattern");

      // Cria os três modelos
      PRODUCTS.forEach((product, index) => {
        const model = document.createElement("a-entity");
        model.setAttribute("gltf-model", product.model);
        model.setAttribute("scale", product.modelConfig.scale);
        model.setAttribute("rotation", product.modelConfig.rotation);
        model.setAttribute("position", product.modelConfig.initialPosition);

        marker.appendChild(model);
        modelsRef.current[index] = model;
      });

      // Monta a hierarquia
      scene.appendChild(marker);

      // Cria a câmera
      const camera = document.createElement("a-entity");
      camera.setAttribute("camera", "");
      camera.setAttribute("look-controls", "enabled: false");

      // Monta a hierarquia
      scene.appendChild(marker);
      scene.appendChild(camera);

      // Adiciona a cena ao body
      document.body.appendChild(scene);

      sceneInitializedRef.current = true;
    };

    initializeScene();

    // Cleanup - executado apenas quando o componente é desmontado
    return () => {
      // Remove o wake lock
      if (wakeLock) {
        wakeLock.release().then(() => {
          console.log("Wake Lock liberado");
        });
      }

      // Remove o listener de visibilidade
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Remove os scripts
      const scripts = document.querySelectorAll("script");
      scripts.forEach((script) => {
        if (
          script.src.includes("aframe.min.js") ||
          script.src.includes("aframe-ar.js")
        ) {
          script.remove();
        }
      });

      const scene = document.querySelector("a-scene");
      if (scene) {
        scene.remove();
      }
    };
  }, []); // Dependências vazias - roda apenas uma vez

  // Efeito separado para atualizar posições
  useEffect(() => {
    if (sceneInitializedRef.current) {
      modelsRef.current.forEach((model, index) => {
        if (model) {
          const newPosition = index === currentIndex ? "0 0 0" : "-8 0 0";

          model.setAttribute("animation__position", {
            property: "position",
            to: newPosition,
            dur: 1000,
            easing: "easeInOutQuad",
          });
        }
      });
    }
  }, [currentIndex]);

  return null;
}
