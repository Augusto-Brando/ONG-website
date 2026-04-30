import { PawPrint } from 'lucide-react'

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
              Dando segunda chance aos cães que mais precisam.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#dogs" className="hover:text-primary-foreground transition">Cães para Adoção</a></li>
              <li><a href="#about" className="hover:text-primary-foreground transition">Sobre Nós</a></li>
              <li><a href="#contact" className="hover:text-primary-foreground transition">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Redes Sociais</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#" className="hover:text-primary-foreground transition">Instagram</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition">Facebook</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition">WhatsApp</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/60">
          <p>&copy; 2025 Patinhas ONG. Todos os direitos reservados. ❤️</p>
        </div>
      </div>
    </footer>
  )
}
