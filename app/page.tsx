"use client";
import Link from "next/link";
import "./page.scss";

export default function HomePage() {
  return (
    <main className="home-page">
      <div className="home-container">
        {/* Header com nome do projeto mais destacado */}
        <header className="project-header">
          <h1 className="project-title">
            <span className="title-main">Taskerize</span>
            <span className="title-subtitle">IA na Organização de Equipes</span>
          </h1>
          <p className="project-tagline">
            Transforme sua gestão de equipes com inteligência artificial
          </p>
        </header>

        {/* Descrição breve */}
        <p className="home-description">
          Um protótipo revolucionário que usa IA para otimizar colaboração, 
          distribuição de tarefas e performance das equipes.
        </p>

        {/* Botão principal - CADASTRO em destaque */}
        <div className="hero-button">
          <Link href="/register" className="btn primary hero-btn">
            Começar Agora - Cadastro Gratuito
          </Link>
        </div>

        {/* Botões secundários */}
        <div className="button-group secondary-buttons">
          <Link href="/login" className="btn secondary">
            Já tem conta? Login
          </Link>
          <Link href="/board" className="btn outline">
            Ver Demo do Board
          </Link>
        </div>

        {/* Features rápidas */}
        <div className="features-preview">
          <div className="feature-item">
            <span className="feature-icon">🤖</span>
            <span>IA sugere formações otimizadas</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Distribuição automática de tarefas</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📈</span>
            <span>Análise de performance em tempo real</span>
          </div>
        </div>

        <footer className="home-footer">
          © {new Date().getFullYear()} Taskerize — 
          POC desenvolvida com ❤️ e Next.js
        </footer>
      </div>
    </main>
  );
}