"use client";
import Link from "next/link";
import "./page.scss";
import HeaderPublic from '../components/header/HeaderPublic';

export default function HomePage() {
  return (
    <>
      <HeaderPublic />
      <main className="home-page">
        <div className="home-container">
          <header className="project-header">
            <h1 className="project-title">
              <span className="title-main">Taskerize</span>
              <span className="title-subtitle">IA na Organização de Equipes</span>
            </h1>
            <p className="project-tagline">
              Transforme sua gestão de equipes com inteligência artificial
            </p>
          </header>
          <div className="hero-button">
            <Link href="/cadastro" className="btn primary hero-btn">
              Começar Agora - Cadastro Gratuito
            </Link>
          </div>

          <div className="button-group secondary-buttons">
            <Link href="/login" className="btn secondary">
              Já tem conta? Login
            </Link>
            <Link href="/board" className="btn outline">
              Ver Demo do Board
            </Link>
          </div>

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
             desenvolvida com ❤️ e Next.js
          </footer>
        </div>
      </main>
    </>
  );
}