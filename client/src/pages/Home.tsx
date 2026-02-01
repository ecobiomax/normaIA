import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import SignupModal from "@/components/SignupModal";
import LoginModal from "@/components/LoginModal";
import { CheckCircle, BookOpen, Zap, Shield, BarChart3, Users } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, user, loading, setLocation]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (isAuthenticated && user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecionando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">NormaIA</h1>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#beneficios" className="text-slate-600 hover:text-slate-900 transition">Benefícios</a>
            <a href="#preco" className="text-slate-600 hover:text-slate-900 transition">Preços</a>
            <a href="#faq" className="text-slate-600 hover:text-slate-900 transition">FAQ</a>
          </nav>
          <Button
            onClick={() => {
              setShowLoginModal(true);
            }}
            variant="outline"
            size="sm"
          >
            Entrar
          </Button>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              NormaIA – O assistente IA especializado em normas técnicas para inspetores industriais
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Consulte normas técnicas (NBR, ASME, Petrobras) instantaneamente com respostas baseadas em IA. Cite exatamente o parágrafo e a norma. Rápido, seguro e confiável.
            </p>
            <div className="flex gap-4">
              <Button 
                size="lg" 
                onClick={() => setShowSignupModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Comece grátis por 7 dias
              </Button>
              <Button size="lg" variant="outline">
                Saiba mais
              </Button>
            </div>
            <p className="text-sm text-slate-500 mt-4">✓ Sem cartão de crédito • ✓ Acesso completo • ✓ Cancele quando quiser</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 h-96 flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-24 h-24 text-blue-600 mx-auto mb-4 opacity-20" />
              <p className="text-slate-600">Interface de chat intuitiva</p>
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-12 text-center">Por que escolher NormaIA?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800 rounded-xl p-8">
              <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
              <h4 className="text-xl font-semibold mb-3">Respostas baseadas em normas oficiais</h4>
              <p className="text-slate-300">Todas as respostas são fundamentadas em normas técnicas reais. Sem alucinações, apenas fatos.</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-8">
              <Zap className="w-12 h-12 text-yellow-400 mb-4" />
              <h4 className="text-xl font-semibold mb-3">Citação exata de parágrafos</h4>
              <p className="text-slate-300">Cada resposta cita o nome da norma, seção e texto original para rastreabilidade completa.</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-8">
              <Shield className="w-12 h-12 text-blue-400 mb-4" />
              <h4 className="text-xl font-semibold mb-3">Rápido e seguro</h4>
              <p className="text-slate-300">Respostas em segundos com criptografia end-to-end. Seus dados de inspeção estão sempre protegidos.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold mb-12 text-center text-slate-900">Funcionalidades principais</h3>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="flex gap-4">
            <BarChart3 className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-lg mb-2 text-slate-900">Chat IA inteligente</h4>
              <p className="text-slate-600">Faça perguntas em português sobre qualquer norma técnica e receba respostas contextualizadas com citações.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Users className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-lg mb-2 text-slate-900">Histórico de consultas</h4>
              <p className="text-slate-600">Acesse todas as suas consultas anteriores. Retome conversas e acompanhe seu histórico de pesquisas.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <BookOpen className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-lg mb-2 text-slate-900">Upload de normas</h4>
              <p className="text-slate-600">Carregue seus próprios PDFs de normas técnicas. O sistema indexa automaticamente para buscas rápidas.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-lg mb-2 text-slate-900">Acesso mobile-first</h4>
              <p className="text-slate-600">Interface otimizada para uso em campo. Instale como app no seu celular para acesso offline.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="preco" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-12 text-center text-slate-900">Planos e preços</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <h4 className="text-xl font-semibold mb-2">Teste gratuito</h4>
              <p className="text-slate-600 mb-6">Perfeito para conhecer a plataforma</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">Grátis</span>
                <span className="text-slate-600 ml-2">por 7 dias</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Acesso completo por 7 dias</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Chat ilimitado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Upload de normas</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowSignupModal(true)}
              >
                Começar agora
              </Button>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-blue-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Mais popular</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Profissional</h4>
              <p className="text-slate-600 mb-6">Para inspetores e profissionais</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">R$ 89</span>
                <span className="text-slate-600 ml-2">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Chat ilimitado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Upload ilimitado de normas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Histórico completo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Suporte prioritário</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowSignupModal(true)}
              >
                Comece o teste grátis
              </Button>
            </div>

            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <h4 className="text-xl font-semibold mb-2">Empresarial</h4>
              <p className="text-slate-600 mb-6">Para equipes e organizações</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">Sob consulta</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Múltiplos usuários</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">API customizada</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">SLA garantido</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Suporte dedicado</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Fale conosco
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Pronto para começar?</h3>
          <p className="text-xl mb-8 text-blue-100">Teste NormaIA gratuitamente por 7 dias. Sem cartão de crédito necessário.</p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => setShowSignupModal(true)}
          >
            Comece agora
          </Button>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="font-semibold text-white mb-4">Produto</h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition">Preços</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Empresa</h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contato</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Legal</h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition">Termos</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Contato</h5>
              <p className="text-sm">suporte@normaIA.com.br</p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2026 NormaIA. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      <SignupModal open={showSignupModal} onOpenChange={setShowSignupModal} />
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}
