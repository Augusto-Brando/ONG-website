import { Clock, Instagram, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 px-4 md:px-8">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Entre em Contato</h2>
          <p className="text-lg text-muted-foreground">Tem dúvidas? Quer conhecer nossos animais? Fale conosco!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Endereço</h3>
                <p className="text-muted-foreground">
                  A ONG está sem endereço físico no momento.
                  <br />
                  Visitas e encontros são combinados previamente.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">WhatsApp</h3>
                <a
                  href="https://wa.me/5532999611971"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  +55 32 99961-1971
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Email</h3>
                <a
                  href="mailto:amornaotemracajf@gmail.com"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  amornaotemracajf@gmail.com
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Instagram className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Instagram</h3>
                <a
                  href="https://www.instagram.com/amornaotemracajf/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  @amornaotemracajf
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Horário</h3>
                <p className="text-muted-foreground">
                  Atendimento por mensagem.
                  <br />
                  A equipe responde conforme disponibilidade.
                </p>
              </div>
            </div>
          </div>

          {/* Message Box */}
          <div className="bg-accent/10 rounded-xl p-8 border border-border">
            <h3 className="text-xl font-bold text-primary mb-4">Quer conhecer um animal?</h3>
            <p className="text-muted-foreground mb-6">
              Fale com a equipe para tirar dúvidas sobre adoção, disponibilidade dos animais
              e próximos passos para encontrar seu novo companheiro.
            </p>
            <div className="space-y-3">
              <Button
                asChild
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 font-semibold"
              >
                <a href={`https://wa.me/5532999611971?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre os animais disponíveis para adoção.')}`} target="_blank" rel="noopener noreferrer">
                  Conversar pelo WhatsApp
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full py-6 font-semibold border-primary text-primary hover:bg-primary/5 bg-transparent"
              >
                <a href="https://www.instagram.com/amornaotemracajf/" target="_blank" rel="noopener noreferrer">
                  Seguir no Instagram
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
