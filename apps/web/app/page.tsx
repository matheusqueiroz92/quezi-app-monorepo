import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-champagne via-neutral-white to-accent-blush">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="font-display text-6xl md:text-7xl text-marsala mb-4">
            Quezi
          </h1>
          <p className="text-xl text-neutral-graphite max-w-2xl mx-auto">
            Conectando você aos melhores profissionais de beleza e estética
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link
            href="/login"
            className="px-8 py-4 bg-marsala text-white rounded-quezi-lg hover:bg-marsala-dark transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            Entrar
          </Link>

          <Link
            href="/register"
            className="px-8 py-4 bg-white text-marsala border-2 border-marsala rounded-quezi-lg hover:bg-marsala hover:text-white transition-all shadow-lg font-semibold text-lg"
          >
            Cadastrar
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <FeatureCard
            title="Profissionais Verificados"
            description="Todos os profissionais são cuidadosamente selecionados"
            icon="✨"
          />
          <FeatureCard
            title="Agendamento Fácil"
            description="Agende seus serviços em poucos cliques"
            icon="📅"
          />
          <FeatureCard
            title="Pagamento Seguro"
            description="Seus dados protegidos com a melhor tecnologia"
            icon="🔒"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white p-8 rounded-quezi-lg shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-display text-2xl text-marsala mb-2">{title}</h3>
      <p className="text-neutral-graphite">{description}</p>
    </div>
  );
}

