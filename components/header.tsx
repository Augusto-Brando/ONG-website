'use client'

export default function Header() {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="Amor não tem Raça"
              className="h-12 w-auto object-contain"
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-primary">Amor não tem Raça</h1>
              <p className="text-xs text-muted-foreground">ONG de Resgate</p>
            </div>
          </div>

          <nav className="hidden md:flex gap-8">
            <a href="#dogs" className="text-sm font-medium hover:text-primary transition-colors">
              Animais para Adoção
            </a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              Sobre Nós
            </a>
            <a href="#news" className="text-sm font-medium hover:text-primary transition-colors">
              Notícias
            </a>
            <a href="#donations" className="text-sm font-medium hover:text-primary transition-colors">
              Doações
            </a>
            <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contato
            </a>
          </nav>
        </div>
      </header>
    </>
  )
}