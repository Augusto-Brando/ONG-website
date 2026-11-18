'use client'

import { useEffect, useState } from 'react'
import { useMovimentoReduzido } from './useEntrada'

/** Ease-in-out cúbica: a mesma curva da marca, para o contador. */
const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)

/**
 * Conta de 0 até `alvo` (1,6 s) quando `iniciar` vira true.
 * Com movimento reduzido, devolve o valor final direto.
 */
export function useContador(alvo: number, iniciar: boolean, duracaoMs = 1600) {
  const reduzido = useMovimentoReduzido()
  const [valor, setValor] = useState(0)

  useEffect(() => {
    if (!iniciar) return
    if (reduzido) {
      setValor(alvo)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const passo = (agora: number) => {
      const p = Math.min(1, (agora - t0) / duracaoMs)
      setValor(Math.round(alvo * easeInOutCubic(p)))
      if (p < 1) raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
  }, [alvo, iniciar, reduzido, duracaoMs])

  return valor
}
