// Envio de e-mails. Em dev aponta para o Mailpit (http://localhost:8025).
// Nunca lança erro: falha de e-mail não pode derrubar a operação principal.
import nodemailer, { type Transporter } from 'nodemailer'

let transporter: Transporter | null = null

function getTransporter() {
  const host = process.env.SMTP_HOST
  if (!host) return null
  transporter ??= nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
  return transporter
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Envia um e-mail simples. `lines` vira parágrafos (texto é escapado). Retorna true se enviou. */
export async function sendMail(to: string | null | undefined, subject: string, lines: string[]): Promise<boolean> {
  const t = getTransporter()
  if (!t || !to) return false
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || 'Amor Nao Tem Raca <nao-responda@localhost>',
      to,
      subject,
      text: lines.join('\n\n'),
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1f2937">${lines
        .map((l) => `<p>${escapeHtml(l)}</p>`)
        .join('')}<p style="color:#6b7280;font-size:12px">ONG Amor Não Tem Raça · Juiz de Fora/MG</p></div>`,
    })
    return true
  } catch (e) {
    console.error('Falha ao enviar e-mail', e)
    return false
  }
}

/** E-mail da equipe que recebe avisos administrativos. */
export const adminEmail = () => process.env.ADMIN_NOTIFY_EMAIL || 'equipe@ong.local'
