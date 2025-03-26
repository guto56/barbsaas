import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import { Link } from 'react-router-dom';

export default function Landing() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const [ref1, inView1] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [ref2, inView2] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [ref3, inView3] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden">
      {/* Particles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          particles: {
            color: {
              value: "#ffffff",
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1,
            },
            move: {
              enable: true,
              speed: 0.5,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.2,
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
        }}
      />

      {/* Navigation */}
      <nav className="absolute top-0 w-full p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">Logo</Link>
          <Link 
            to="/login" 
            className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
          >
            Acessar Sistema
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Sistema de Agendamento
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Gerencie seus compromissos de forma simples e eficiente
          </p>
          <Link
            to="/register"
            className="px-8 py-3 bg-blue-600 rounded-full text-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Começar Agora
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section
        ref={ref1}
        className="py-20 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView1 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-8">Funcionalidades</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-gray-800 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Agendamento Online</h3>
                <p className="text-gray-400">
                  Agende seus compromissos de forma rápida e intuitiva
                </p>
              </div>
              <div className="p-6 bg-gray-800 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Galeria de Fotos</h3>
                <p className="text-gray-400">
                  Compartilhe momentos especiais com sua galeria personalizada
                </p>
              </div>
              <div className="p-6 bg-gray-800 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Gestão de Perfil</h3>
                <p className="text-gray-400">
                  Mantenha suas informações atualizadas facilmente
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Technologies Section */}
      <motion.section
        ref={ref2}
        className="py-20 px-4 bg-gray-800/50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-12">Tecnologias Utilizadas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <TechCard name="React" icon="⚛️" />
              <TechCard name="TypeScript" icon="📘" />
              <TechCard name="Supabase" icon="🔋" />
              <TechCard name="Tailwind CSS" icon="🎨" />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        ref={ref3}
        className="py-20 px-4"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView3 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-8">Sobre o Projeto</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Este projeto foi desenvolvido com o objetivo de criar uma plataforma moderna
              e eficiente para gerenciamento de agendamentos. Utilizando as mais recentes
              tecnologias do mercado, oferecemos uma experiência fluida e intuitiva para
              nossos usuários.
            </p>
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-4">Desenvolvido por</h3>
              <p className="text-gray-300">Seu Nome</p>
              <div className="mt-4 flex justify-center space-x-4">
                <a href="https://github.com/seu-usuario" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                  GitHub
                </a>
                <a href="https://linkedin.com/in/seu-usuario" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                  LinkedIn
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          <p>© 2024 Sistema de Agendamento. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function TechCard({ name, icon }: { name: string; icon: string }) {
  return (
    <div className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-bold">{name}</h3>
    </div>
  );
} 