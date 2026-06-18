export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 md:px-8 bg-accent/10">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src="/happy-dogs-rescue-sanctuary.jpg"
              alt="ONG em ação"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div>
            <h2 className="text-4xl font-bold text-primary mb-6">
              Sobre a Amor não tem Raça
            </h2>
            <div className="space-y-4 text-foreground/80">
              <p className="text-lg leading-relaxed">
                Amor não tem Raça é uma organização sem fins lucrativos dedicada ao resgate,
                reabilitação e adoção de animais abandonados e maltratados.
              </p>
              <p className="text-lg leading-relaxed">
                Desde 2015, já resgatamos mais de 500 animais e os colocamos em lares
                amorosos. Nossa missão é dar uma segunda chance a cada animal que chega até nós.
              </p>
              <p className="text-lg leading-relaxed">
                Toda adoção inclui vacinação, microchip, castração e um mês de acompanhamento 
                veterinário para garantir que seu novo amigo tenha o melhor início.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground mt-2">Animais Resgatados</p>
              </div>
              <div className="bg-accent/20 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-accent">8 Anos</p>
                <p className="text-sm text-muted-foreground mt-2">De Atuação</p>
              </div>
              <div className="bg-secondary/10 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-secondary">100%</p>
                <p className="text-sm text-muted-foreground mt-2">Voluntários</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
