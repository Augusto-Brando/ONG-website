"use client"

import { Check, Copy, HandHeart, Mail, Phone } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const PIX_KEY = "48.118.169/0001-77"
const MEMBER_EMAIL = "amornaotemracajf@gmail.com"
const MEMBER_WHATSAPP = "5532999533087"

export default function DonationSection() {
  const [copied, setCopied] = useState(false)

  const copyPixKey = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section id="donations" className="py-20 px-4 md:px-8 bg-primary/5">
      <div className="container max-w-5xl">
        <div className="mb-12 max-w-3xl">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <HandHeart className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mb-4 text-4xl font-bold text-primary">Doações</h2>
          <p className="text-lg leading-relaxed text-foreground/80">
            Sua ajuda mantém resgates, alimentação, medicações, castrações e cuidados
            veterinários dos animais acolhidos pela Amor não tem Raça.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="h-full rounded-lg border border-border bg-background p-6">
              <h3 className="mb-4 text-xl font-bold text-primary">Doe por Pix</h3>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Chave Pix CNPJ</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <strong className="text-xl text-foreground">{PIX_KEY}</strong>
                <Button
                  type="button"
                  onClick={copyPixKey}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar Pix
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-6">
            <h3 className="mb-3 text-xl font-bold text-primary">Seja sócio contribuinte</h3>
            <p className="mb-4 text-muted-foreground">
              Também é possível apoiar a ONG como sócio contribuinte a partir de
              R$ 50,00 por mês. A receita da Amor não tem Raça vem exclusivamente
              de doações e sócios.
            </p>
            <p className="mb-5 text-sm text-muted-foreground">
              Para se associar, envie nome completo, endereço completo com CEP,
              telefone, CPF e o valor mensal que deseja contribuir.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <a href={`mailto:${MEMBER_EMAIL}?subject=${encodeURIComponent("Quero ser sócio contribuinte")}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar email
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5 bg-transparent"
              >
                <a
                  href={`https://wa.me/${MEMBER_WHATSAPP}?text=${encodeURIComponent("Olá! Gostaria de ser sócio contribuinte da Amor não tem Raça.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Falar pelo WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
