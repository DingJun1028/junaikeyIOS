import React, { useState } from 'react';
import { Dashboard } from '../components/Dashboard';
import { CapacitiesPage } from './CapacitiesPage';
import './HomePage.css';

/**
 * 萬能首頁 - Universal Home Page
 * 系統的入口頁面，現在包含 Capacities 智典集成
 */

type PageType = 'dashboard' | 'capacities' | 'blueprints' | 'agents' | 'wisdom';

export const HomePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'capacities':
        return <CapacitiesPage />;
      case 'dashboard':
      default:
        return (
          <div className="dashboard-container">
            <Dashboard />
          </div>
        );
    }
  };

  return (
    <div className="home-page">
      <nav className="home-nav">
        <div className="nav-brand">
          <span className="brand-icon">🌟</span>
          <span className="brand-text">萬能智典</span>
        </div>
        <div className="nav-links">
          <button 
            className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            🎛️ 控制中心
          </button>
          <button 
            className={`nav-link ${currentPage === 'capacities' ? 'active' : ''}`}
            onClick={() => setCurrentPage('capacities')}
          >
            📚 Capacities 智典
          </button>
          <button 
            className={`nav-link ${currentPage === 'blueprints' ? 'active' : ''}`}
            onClick={() => setCurrentPage('blueprints')}
          >
            🏗️ 藍圖管理
          </button>
          <button 
            className={`nav-link ${currentPage === 'agents' ? 'active' : ''}`}
            onClick={() => setCurrentPage('agents')}
          >
            🤖 代理網絡
          </button>
          <button 
            className={`nav-link ${currentPage === 'wisdom' ? 'active' : ''}`}
            onClick={() => setCurrentPage('wisdom')}
          >
            💎 智慧庫
          </button>
        </div>
      </nav>
      
      <main className="home-main">
        {renderCurrentPage()}
      </main>
      
      <footer className="home-footer">
        <p>© 2024 萬能智典系統 - 終極融合架構 v4.0</p>
        <p>由創世編織者網絡驅動 🚀 | 現已集成 Capacities 智典</p>
      </footer>
    </div>
  );
};