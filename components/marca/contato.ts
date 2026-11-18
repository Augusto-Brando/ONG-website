/**
 * Contatos oficiais da ONG (fonte: `.claude/skills/amor-nao-tem-raca-ui/reference/conteudo.md`).
 * Um único lugar para o rodapé, os estados e os links de ajuda.
 */
export const WHATSAPP_NUMERO = '5532999611971'
export const WHATSAPP_EXIBICAO = '(32) 99961-1971'
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMERO}`
export const EMAIL = 'amornaotemracajf@gmail.com'
export const INSTAGRAM_USUARIO = '@amornaotemracajf'
export const INSTAGRAM_LINK = 'https://www.instagram.com/amornaotemracajf/'
export const SLOGAN = 'Adote um focinho com carinho!'

/** Link de ajuda por WhatsApp com uma mensagem inicial. */
export function whatsappCom(texto: string) {
  return `${WHATSAPP_LINK}?text=${encodeURIComponent(texto)}`
}
