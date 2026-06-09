import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 px-4 md:px-8">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Entre em Contato</h2>
          <p className="text-lg text-muted-foreground">Tem dúvidas? Quer conhecer nossos cães? Fale conosco!</p>
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
                  Rua das Flores, 123
                  <br />
                  São Paulo, SP - 01234-567
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Telefone</h3>
                <p className="text-muted-foreground">(11) 3456-7890</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Email</h3>
                <p className="text-muted-foreground">contato@patinhas.org.br</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Horário</h3>
                <p className="text-muted-foreground">
                  Seg - Sex: 10h - 18h
                  <br />
                  Sábados: 10h - 16h
                </p>
              </div>
            </div>
          </div>

          {/* Message Box */}
          <div className="bg-accent/10 rounded-xl p-8 border border-border">
            <h3 className="text-xl font-bold text-primary mb-4">Quer visitar nossos cães?</h3>
            <p className="text-muted-foreground mb-6">
              Visite nosso abrigo e conheça pessoalmente todos os nossos amigos de 4 patas! Você pode trazer sua família
              e passar um tempo com eles.
            </p>
            <div className="space-y-3">
              <Button
                asChild
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 font-semibold"
              >
                <a href={`https://wa.me/5532999611971?text=${encodeURIComponent('Olá! Gostaria de agendar uma visita ao abrigo para conhecer os animais. 🐾')}`} target="_blank" rel="noopener noreferrer">
                  Agendar Visita via WhatsApp
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
