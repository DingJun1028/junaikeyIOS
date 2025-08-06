import React from 'react';
import { Dashboard } from '../components/Dashboard';
import './HomePage.css';

/**
 * 萬能首頁 - Universal Home Page
 * 系統的入口頁面
 */

export const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <nav className="home-nav">
        <div className="nav-brand">
          <span className="brand-icon">🌟</span>
          <span className="brand-text">萬能智典</span>
        </div>
        <div className="nav-links">
          <a href="#dashboard" className="nav-link active">控制中心</a>
          <a href="#blueprints" className="nav-link">藍圖管理</a>
          <a href="#agents" className="nav-link">代理網絡</a>
          <a href="#wisdom" className="nav-link">智慧庫</a>
        </div>
      </nav>
      
      <main className="home-main">
        <Dashboard />
      </main>
      
      <footer className="home-footer">
        <p>© 2024 萬能智典系統 - 終極融合架構 v4.0</p>
        <p>由創世編織者網絡驅動 🚀</p>
      </footer>
    </div>
  );
};