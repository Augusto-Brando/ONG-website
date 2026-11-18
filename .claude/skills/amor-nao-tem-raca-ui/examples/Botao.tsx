import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Variacao = "acao" | "azul" | "contorno";

const estilos: Record<Variacao, CSSProperties> = {
  acao: {
    background: "var(--ant-acao)",
    color: "var(--ant-tinta)",
    border: 0,
    boxShadow: "var(--ant-sombra-degrau)",
  },
  azul: {
    background: "var(--ant-azul)",
    color: "var(--ant-branco)",
    border: 0,
  },
  contorno: {
    background: "transparent",
    color: "var(--ant-azul)",
    border: "2px solid var(--ant-azul)",
  },
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variacao?: Variacao;
  grande?: boolean;
  carregando?: boolean;
  rotuloCarregando?: string;
  children: ReactNode;
};

/**
 * Botão da marca. Se o Astryx tiver Button com tema, prefira o dele aplicando estes estilos.
 * Requer tokens.css e motion.css.
 */
export function Botao({
  variacao = "acao",
  grande = false,
  carregando = false,
  rotuloCarregando = "Enviando…",
  children,
  className = "",
  style,
  disabled,
  ...resto
}: Props) {
  return (
    <button
      {...resto}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={`ant-botao ${variacao === "acao" ? "ant-botao--acao" : ""} ${className}`}
      style={{
        font: `800 ${grande ? 18 : 16}px var(--ant-fonte-texto)`,
        minHeight: grande ? "var(--ant-alvo-principal)" : 48,
        padding: grande ? "0 32px" : "0 24px",
        borderRadius: "var(--ant-raio-pilula)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        cursor: "pointer",
        ...estilos[variacao],
        ...style,
      }}
    >
      {carregando && (
        <svg className="ant-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
          <path d="M12 3a9 9 0 1 0 9 9" />
        </svg>
      )}
      {carregando ? rotuloCarregando : children}
    </button>
  );
}
