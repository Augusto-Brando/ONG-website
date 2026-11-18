"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export type Animal = {
  slug: string;
  nome: string;
  especie: "Cão" | "Gato";
  raca?: string;
  idade: string;          // "3 anos", "6 meses"
  personalidade?: string; // "ama passeios"
  castrado: boolean;
  vacinado: boolean;
  foto?: { url: string; focoX?: number; focoY?: number }; // foco em %, padrão 50/35 (rosto)
};

const TONS = ["var(--ant-foto-1)", "var(--ant-foto-2)", "var(--ant-foto-3)", "var(--ant-foto-4)"];
const INCLINACOES = ["-1.5deg", "1deg", "-1deg", "1.5deg"];

function Pata({ cor = "var(--ant-cacau)", tamanho = 48 }: { cor?: string; tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" fill={cor} aria-hidden="true">
      <ellipse cx="32" cy="42" rx="14" ry="11" />
      <ellipse cx="14" cy="28" rx="6" ry="8" />
      <ellipse cx="26" cy="16" rx="6" ry="8" />
      <ellipse cx="38" cy="16" rx="6" ry="8" />
      <ellipse cx="50" cy="28" rx="6" ry="8" />
    </svg>
  );
}

/** Cartão polaroide do animal. `indice` alterna inclinação e tom do placeholder. */
export function CartaoAnimal({ animal, indice = 0, proporcao = "4 / 5" }: { animal: Animal; indice?: number; proporcao?: string }) {
  const [curtiu, setCurtiu] = useState(false);
  const [pulos, setPulos] = useState(0);
  const tom = TONS[indice % TONS.length];

  return (
    <article
      className="ant-polaroide ant-polaroide--interativa"
      style={{ ["--ant-inclinacao" as string]: INCLINACOES[indice % INCLINACOES.length], display: "flex", flexDirection: "column", gap: 6 }}
    >
      <span className="ant-fita" aria-hidden="true" />

      <div style={{ position: "relative", aspectRatio: proporcao, borderRadius: 20, overflow: "hidden", background: tom }}>
        {animal.foto ? (
          <Image
            src={animal.foto.url}
            alt={`${animal.nome}, ${animal.especie.toLowerCase()}`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{ objectFit: "cover", objectPosition: `${animal.foto.focoX ?? 50}% ${animal.foto.focoY ?? 35}%` }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Pata />
            <span style={{ fontSize: "var(--ant-texto-xs)", fontWeight: 800 }}>sem foto ainda</span>
          </div>
        )}

        <button
          type="button"
          className="ant-botao-icone"
          aria-label={`Quero conhecer ${animal.nome}`}
          aria-pressed={curtiu}
          onClick={() => { setCurtiu((v) => !v); setPulos((n) => n + 1); }}
          style={{ position: "absolute", right: 10, top: 10, width: 48, height: 48, borderRadius: "50%", border: 0, background: "var(--ant-branco)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--ant-sombra-sm)", cursor: "pointer" }}
        >
          <svg key={pulos} className={`ant-coracao ${pulos ? "ant-pulo" : ""}`} width="24" height="24" viewBox="0 0 24 24" stroke="var(--ant-laranja-texto)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path fill={curtiu ? "var(--ant-acao)" : "none"} d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
          </svg>
        </button>
      </div>

      <div style={{ padding: "6px 8px 0", display: "flex", flexDirection: "column", gap: 4 }}>
        <h3 style={{ margin: 0, fontFamily: "var(--ant-fonte-titulo)", fontWeight: 800, fontSize: 30, lineHeight: 1 }}>{animal.nome}</h3>
        <p style={{ margin: 0, fontSize: "var(--ant-texto-sm)", fontWeight: 800, color: "var(--ant-azul)" }}>
          {[animal.especie, animal.raca, animal.idade].filter(Boolean).join(" · ")}
        </p>
        {animal.personalidade && <p className="ant-mao" style={{ margin: 0, fontSize: 24 }}>{animal.personalidade}</p>}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "4px 0 8px" }}>
          {animal.castrado && <span style={{ padding: "4px 12px", borderRadius: 999, background: "var(--ant-sol-suave)", fontWeight: 800, fontSize: 13 }}>Castrado</span>}
          {animal.vacinado && <span style={{ padding: "4px 12px", borderRadius: 999, background: "var(--ant-sol-suave)", fontWeight: 800, fontSize: 13 }}>Vacinado</span>}
        </div>
        <Link
          href={`/animais/${animal.slug}`}
          className="ant-botao ant-botao--acao"
          style={{ textDecoration: "none", fontWeight: 800, minHeight: 48, borderRadius: 999, background: "var(--ant-acao)", color: "var(--ant-tinta)", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--ant-sombra-degrau)" }}
        >
          Conhecer {animal.nome}
        </Link>
      </div>
    </article>
  );
}
