"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dispara uma única vez quando o elemento entra na tela.
 * Use com a classe .ant-entrada: adicione .ant-visivel quando `visivel` for true.
 */
export function useEntrada<T extends Element>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visivel) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisivel(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisivel(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, visivel]);

  return { ref, visivel };
}

/** true quando o usuário pediu movimento reduzido no sistema. */
export function useMovimentoReduzido() {
  const [reduzido, setReduzido] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const atualizar = () => setReduzido(mq.matches);
    atualizar();
    mq.addEventListener("change", atualizar);
    return () => mq.removeEventListener("change", atualizar);
  }, []);
  return reduzido;
}
