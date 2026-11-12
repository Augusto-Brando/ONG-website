// Tema "amor" do Astryx: identidade "Sol de Bairro" da ONG Amor Não Tem Raça.
// Os valores apontam para as variáveis da marca (app/marca/tokens.css), fonte única da verdade
// (skill .claude/skills/amor-nao-tem-raca-ui). Modo escuro ainda não desenhado: o app usa mode="light".
// Depois de editar: npm run theme:build
import { defineTheme } from '@astryxdesign/core/theme'
import { neutralTheme } from '@astryxdesign/theme-neutral'

export const amorTheme = defineTheme({
  name: 'amor',
  extends: neutralTheme,
  typography: {
    body: { family: 'Nunito', fallbacks: 'system-ui, sans-serif' },
    heading: { family: 'Baloo 2', fallbacks: 'Nunito, system-ui, sans-serif' },
  },
  radius: { base: 8, multiplier: 2 },
  motion: { character: 'standard', easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
  tokens: {
    // Ação principal: laranja com texto tinta (branco no laranja reprova AA: 2,7:1)
    '--color-accent': 'var(--ant-acao)',
    '--color-on-accent': 'var(--ant-tinta)',
    '--color-accent-muted': 'var(--ant-pessego)',
    // Links, ícones de destaque e foco em azul (4,6:1 no creme)
    '--color-text-accent': 'var(--ant-azul)',
    '--color-icon-accent': 'var(--ant-azul)',
    '--focus-outline-color': 'var(--ant-azul)',
    // Superfícies
    '--color-background-body': 'var(--ant-creme)',
    '--color-background-surface': 'var(--ant-branco)',
    '--color-background-card': 'var(--ant-branco)',
    '--color-background-popover': 'var(--ant-branco)',
    '--color-background-muted': 'var(--ant-sol-suave)',
    '--color-skeleton': 'var(--ant-esqueleto)',
    // Texto e bordas
    '--color-text-primary': 'var(--ant-tinta)',
    '--color-text-secondary': 'var(--ant-tinta-suave)',
    '--color-icon-primary': 'var(--ant-tinta)',
    '--color-icon-secondary': 'var(--ant-tinta-suave)',
    '--color-border': 'var(--ant-areia)',
    '--color-border-emphasized': 'var(--ant-areia-forte)',
    // Estados
    '--color-error': 'var(--ant-erro)',
    '--color-text-error': 'var(--ant-erro)',
    '--color-error-muted': 'var(--ant-erro-fundo)',
    '--color-on-error-muted': 'var(--ant-erro-texto-forte)',
    '--color-info': 'var(--ant-azul)',
    '--color-info-muted': 'var(--ant-azul-suave)',
    '--color-on-info-muted': 'var(--ant-azul-texto-suave)',
    // Sombras quentes e baixas
    '--shadow-low': 'var(--ant-sombra-sm)',
  },
})
