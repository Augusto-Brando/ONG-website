import { Instagram, Mail, PawPrint, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 px-4 md:px-8">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PawPrint className="w-6 h-6" />
              <span className="font-bold text-lg">Patinhas</span>
            </div>
            <p className="text-primary-foreground/80">
              Dando segunda chance aos animais que mais precisam.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#dogs" className="hover:text-primary-foreground transition">Animais para Adoção</a></li>
              <li><a href="#about" className="hover:text-primary-foreground transition">Sobre Nós</a></li>
              <li><a href="#donations" className="hover:text-primary-foreground transition">Doações</a></li>
              <li><a href="#contact" className="hover:text-primary-foreground transition">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>
                <a
                  href="https://www.instagram.com/amornaotemracajf/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary-foreground transition"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5532999611971"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary-foreground transition"
                >
                  <Phone className="w-4 h-4" />
                  +55 32 99961-1971
                </a>
              </li>
              <li>
                <a
                  href="mailto:amornaotemracajf@gmail.com"
                  className="inline-flex items-center gap-2 hover:text-primary-foreground transition"
                >
                  <Mail className="w-4 h-4" />
                  amornaotemracajf@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/60">
          <p>&copy; 2025 Amor não tem Raça. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
