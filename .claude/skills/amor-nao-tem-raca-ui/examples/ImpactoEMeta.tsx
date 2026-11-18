"use client";

import { useEntrada } from "./useEntrada";
import { useContador } from "./useContador";

/** Número de impacto que conta ao entrar na tela. `valor` vem da API. */
export function NumeroImpacto({ valor, sufixo = "", rotulo }: { valor: number; sufixo?: string; rotulo: string }) {
  const { ref, visivel } = useEntrada<HTMLDivElement>();
  const n = useContador(valor, visivel);
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        aria-hidden="true"
        style={{ fontFamily: "var(--ant-fonte-titulo)", fontWeight: 800, fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
      >
        {n.toLocaleString("pt-BR")}{sufixo}
      </span>
      <span className="sr-only">{valor.toLocaleString("pt-BR")}{sufixo} {rotulo}</span>
      <span aria-hidden="true" style={{ fontWeight: 600 }}>{rotulo}</span>
    </div>
  );
}

const real = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Barra de meta de campanha. Valores vêm da API. */
export function BarraMeta({ arrecadado, meta, escuro = false }: { arrecadado: number; meta: number; escuro?: boolean }) {
  const { ref, visivel } = useEntrada<HTMLDivElement>();
  const pct = meta > 0 ? Math.min(100, Math.round((arrecadado / meta) * 100)) : 0;
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`${pct}% da meta`}
        style={{ height: 22, borderRadius: 999, overflow: "hidden", background: escuro ? "rgba(255,255,255,0.18)" : "var(--ant-esqueleto)" }}
      >
        <div
          className="ant-barra-preenchimento"
          style={{ width: visivel ? `${pct}%` : "0%", height: "100%", borderRadius: 999, background: escuro ? "var(--ant-sol)" : "var(--ant-acao)" }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", fontWeight: 800, fontSize: "var(--ant-texto-sm)" }}>
        <span>{real(arrecadado)} de {real(meta)}</span>
        <span>{pct}% da meta</span>
      </div>
    </div>
  );
}
