import React from 'react';
import { Card } from './Card';
import { CapacitiesViewer } from './CapacitiesViewer';
import { useAgentNetwork } from '../hooks/useAgentNetwork';
import { useFirestore } from '../hooks/useFirestore';
import './Dashboard.css';

/**
 * 萬能儀表板 - Universal Dashboard
 * 系統的核心控制中心
 */

export const Dashboard: React.FC = () => {
  const {
    networkStatus,
    activeAgents,
    networkEvents,
    activateGenesisWeaver,
    createEventCard,
    getNetworkStats
  } = useAgentNetwork();

  const { data: blueprints } = useFirestore('blueprints');
  const { data: wisdomCards } = useFirestore('wisdomCards');

  const stats = getNetworkStats();

  const handleCreateBlueprint = async () => {
    try {
      await activateGenesisWeaver('新創世藍圖', {
        type: 'universal',
        timestamp: new Date(),
        creator: 'system'
      });
    } catch (error) {
      console.error('Failed to create blueprint:', error);
    }
  };

  const handleTriggerEvent = async () => {
    try {
      await createEventCard('system_activation', {
        source: 'dashboard',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to trigger event:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🌟 萬能智典控制中心</h1>
        <div className="network-status">
          <span className={`status-indicator ${networkStatus}`}>
            {networkStatus === 'connected' ? '🟢' : networkStatus === 'syncing' ? '🟡' : '⚪'}
          </span>
          <span>網絡狀態: {networkStatus}</span>
        </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>活躍代理</h3>
          <div className="stat-value">{stats.activeCount}/{stats.totalAgents}</div>
        </div>
        <div className="stat-card">
          <h3>處理中任務</h3>
          <div className="stat-value">{stats.processingCount}</div>
        </div>
        <div className="stat-card">
          <h3>網絡健康度</h3>
          <div className="stat-value">{stats.networkHealth.toFixed(1)}%</div>
        </div>
        <div className="stat-card">
          <h3>藍圖總數</h3>
          <div className="stat-value">{blueprints?.length || 0}</div>
        </div>
      </div>

      <div className="dashboard-controls">
        <button className="control-btn primary" onClick={handleCreateBlueprint}>
          🏗️ 創建新藍圖
        </button>
        <button className="control-btn secondary" onClick={handleTriggerEvent}>
          ⚡ 觸發事件
        </button>
      </div>

      <div className="dashboard-sections">
        <section className="dashboard-section">
          <h2>🤖 智能代理網絡</h2>
          <div className="cards-grid">
            {activeAgents.map((agent) => (
              <Card
                key={agent.id}
                id={agent.id}
                title={agent.name}
                subtitle={agent.currentTask || '待命中'}
                type="agent"
                status={agent.status}
                metadata={{
                  updatedAt: agent.lastActivity
                }}
                actions={[
                  {
                    label: '查看詳情',
                    onClick: () => console.log('View agent:', agent.id)
                  }
                ]}
              />
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2>🏗️ 創世藍圖</h2>
          <div className="cards-grid">
            {blueprints?.map((blueprint) => (
              <Card
                key={blueprint.id}
                id={blueprint.id}
                title={blueprint.name || '未命名藍圖'}
                subtitle={blueprint.description}
                type="blueprint"
                status={blueprint.status}
                metadata={{
                  createdAt: blueprint.createdAt?.toDate(),
                  author: blueprint.creator,
                  tags: blueprint.tags
                }}
                actions={[
                  {
                    label: '激活',
                    onClick: () => console.log('Activate blueprint:', blueprint.id),
                    variant: 'primary'
                  },
                  {
                    label: '編輯',
                    onClick: () => console.log('Edit blueprint:', blueprint.id)
                  }
                ]}
              />
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2>⚡ 近期事件</h2>
          <div className="cards-grid">
            {networkEvents.slice(0, 6).map((event) => (
              <Card
                key={event.id}
                id={event.id}
                title={event.type}
                subtitle={`代理: ${event.agentId}`}
                type="event"
                status={event.status}
                metadata={{
                  createdAt: event.timestamp?.toDate()
                }}
                content={
                  <div className="event-payload">
                    <pre>{JSON.stringify(event.payload, null, 2)}</pre>
                  </div>
                }
              />
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2>💎 智慧結晶</h2>
          <div className="cards-grid">
            {wisdomCards?.map((wisdom) => (
              <Card
                key={wisdom.id}
                id={wisdom.id}
                title={wisdom.title}
                subtitle={wisdom.summary}
                type="wisdom"
                metadata={{
                  createdAt: wisdom.createdAt?.toDate(),
                  tags: wisdom.categories
                }}
                content={
                  <div className="wisdom-content">
                    {wisdom.content}
                  </div>
                }
                actions={[
                  {
                    label: '展開',
                    onClick: () => console.log('Expand wisdom:', wisdom.id)
                  }
                ]}
              />
            ))}
          </div>
        </section>

        <section className="dashboard-section capacities-section">
          <h2>📚 Capacities 智典預覽</h2>
          <div className="capacities-preview">
            <CapacitiesViewer
              height="400px"
              showHeader={false}
              autoLoad={true}
            />
          </div>
        </section>
      </div>
    </div>
  );
};