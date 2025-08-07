import React from 'react';
import { CapacitiesViewer } from '../components/CapacitiesViewer';
import './CapacitiesPage.css';

/**
 * Capacities 智典頁面 - Capacities Knowledge Page
 * 專門展示 Capacities 知識庫的頁面
 */

export const CapacitiesPage: React.FC = () => {
  return (
    <div className="capacities-page">
      <div className="page-container">
        <header className="page-header">
          <div className="header-content">
            <h1>📚 萬能智典</h1>
            <p className="header-description">
              整合 Capacities 知識庫，提供智慧檢索與知識管理功能
            </p>
          </div>
        </header>

        <main className="page-main">
          <div className="viewer-container">
            <CapacitiesViewer
              height="calc(100vh - 200px)"
              showHeader={true}
              autoLoad={true}
            />
          </div>
        </main>

        <aside className="page-sidebar">
          <div className="sidebar-section">
            <h3>🎯 功能特色</h3>
            <ul className="feature-list">
              <li>📝 直接訪問 Capacities 知識庫</li>
              <li>🔍 智能檢索與搜尋</li>
              <li>📱 響應式設計，支援各種裝置</li>
              <li>🔄 即時同步更新</li>
              <li>🌐 跨平台存取</li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h3>📋 使用說明</h3>
            <ol className="instruction-list">
              <li>點擊上方的「🔗」按鈕可在新視窗開啟</li>
              <li>使用「↻」按鈕重新載入內容</li>
              <li>「📱/🖥️」按鈕可切換顯示模式</li>
              <li>如果無法載入，會自動切換到連結模式</li>
            </ol>
          </div>

          <div className="sidebar-section">
            <h3>🔧 技術資訊</h3>
            <div className="tech-info">
              <div className="info-item">
                <span className="info-label">平台：</span>
                <span className="info-value">Capacities.io</span>
              </div>
              <div className="info-item">
                <span className="info-label">整合方式：</span>
                <span className="info-value">WebView/Iframe</span>
              </div>
              <div className="info-item">
                <span className="info-label">更新頻率：</span>
                <span className="info-value">即時</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};