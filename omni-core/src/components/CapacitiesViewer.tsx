import React, { useState, useEffect } from 'react';
import { useCapacities } from '../hooks/useCapacities';
import './CapacitiesViewer.css';

/**
 * Capacities 智典檢視器 - Capacities Knowledge Viewer
 * 整合 Capacities 知識庫的顯示組件
 */

interface CapacitiesViewerProps {
  height?: string;
  showHeader?: boolean;
  autoLoad?: boolean;
}

export const CapacitiesViewer: React.FC<CapacitiesViewerProps> = ({
  height = '600px',
  showHeader = true,
  autoLoad = true
}) => {
  const {
    loading,
    error,
    entries,
    getEmbedUrl,
    fetchCapacitiesData,
    openCapacitiesInNewTab,
    checkCapacitiesAccess
  } = useCapacities();

  const [viewMode, setViewMode] = useState<'embed' | 'link' | 'error'>('embed');
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    if (autoLoad) {
      initializeCapacities();
    }
  }, [autoLoad]);

  const initializeCapacities = async () => {
    try {
      // 檢查 Capacities 是否可訪問
      const isAccessible = await checkCapacitiesAccess();
      setAccessChecked(true);
      
      if (isAccessible) {
        await fetchCapacitiesData();
        setViewMode('embed');
      } else {
        setViewMode('link');
      }
    } catch (error) {
      console.log('Failed to initialize:', error);
      setViewMode('error');
    }
  };

  const handleRetry = () => {
    setAccessChecked(false);
    setViewMode('embed');
    initializeCapacities();
  };

  const renderHeader = () => (
    <div className="capacities-header">
      <div className="header-left">
        <h2>📚 萬能智典 - Capacities</h2>
        <span className="header-subtitle">知識庫整合系統</span>
      </div>
      <div className="header-actions">
        <button
          className="action-btn refresh"
          onClick={handleRetry}
          disabled={loading}
          title="重新載入"
        >
          {loading ? '🔄' : '↻'}
        </button>
        <button
          className="action-btn external"
          onClick={() => openCapacitiesInNewTab()}
          title="在新視窗中開啟"
        >
          🔗
        </button>
        <button
          className="action-btn toggle"
          onClick={() => setViewMode(viewMode === 'embed' ? 'link' : 'embed')}
          title="切換顯示模式"
        >
          {viewMode === 'embed' ? '📱' : '🖥️'}
        </button>
      </div>
    </div>
  );

  const renderEmbedView = () => (
    <div className="capacities-embed-container">
      <iframe
        src={getEmbedUrl()}
        width="100%"
        height={height}
        frameBorder="0"
        allow="fullscreen"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        className="capacities-iframe"
        title="Capacities 知識庫"
        onLoad={() => console.log('Capacities iframe loaded')}
        onError={() => setViewMode('link')}
      />
    </div>
  );

  const renderLinkView = () => (
    <div className="capacities-link-container">
      <div className="link-placeholder">
        <div className="link-icon">📚</div>
        <h3>Capacities 智典</h3>
        <p>點擊下方按鈕訪問 Capacities 知識庫</p>
        
        {entries.map((entry) => (
          <div key={entry.id} className="entry-card">
            <h4>{entry.title}</h4>
            <div className="entry-meta">
              <span className="entry-type">{entry.type}</span>
              {entry.tags && (
                <div className="entry-tags">
                  {entry.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <button
              className="open-capacities-btn"
              onClick={() => openCapacitiesInNewTab()}
            >
              🚀 開啟 Capacities 智典
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderErrorView = () => (
    <div className="capacities-error-container">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h3>載入失敗</h3>
        <p>{error || '無法連接到 Capacities 服務'}</p>
        <div className="error-actions">
          <button className="retry-btn" onClick={handleRetry}>
            🔄 重試
          </button>
          <button
            className="fallback-btn"
            onClick={() => openCapacitiesInNewTab()}
          >
            🔗 直接訪問
          </button>
        </div>
      </div>
    </div>
  );

  const renderLoadingView = () => (
    <div className="capacities-loading-container">
      <div className="loading-content">
        <div className="loading-spinner">🌀</div>
        <h3>載入中...</h3>
        <p>正在連接 Capacities 智典</p>
      </div>
    </div>
  );

  return (
    <div className="capacities-viewer">
      {showHeader && renderHeader()}
      
      <div className="capacities-content">
        {loading && !accessChecked && renderLoadingView()}
        {viewMode === 'embed' && accessChecked && renderEmbedView()}
        {viewMode === 'link' && renderLinkView()}
        {viewMode === 'error' && renderErrorView()}
      </div>
    </div>
  );
};