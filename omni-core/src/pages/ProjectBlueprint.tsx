import React, { useState } from 'react';
import { Card } from '../components/Card';
import { useFirestore, useFirestoreOperations } from '../hooks/useFirestore';
import { useAgentNetwork } from '../hooks/useAgentNetwork';
import './ProjectBlueprint.css';

/**
 * 專案藍圖頁面 - Project Blueprint Page
 * 管理和創建專案藍圖的頁面
 */

interface BlueprintFormData {
  name: string;
  description: string;
  type: string;
  tags: string[];
  specifications: {
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
  };
}

export const ProjectBlueprint: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<BlueprintFormData>({
    name: '',
    description: '',
    type: 'universal',
    tags: [],
    specifications: {
      frontend: 'React + TypeScript',
      backend: 'Firebase Functions',
      database: 'Firestore',
      deployment: 'Firebase Hosting'
    }
  });

  const { data: blueprints, loading } = useFirestore('blueprints');
  const { addDocument } = useFirestoreOperations('blueprints');
  const { activateGenesisWeaver } = useAgentNetwork();

  const handleCreateBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 創建藍圖文檔
      const result = await addDocument({
        ...formData,
        status: 'draft',
        creator: 'user',
        createdAt: new Date(),
        version: '1.0'
      });

      if (result.success) {
        // 激活創世編織者
        await activateGenesisWeaver(formData.name, formData);
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          type: 'universal',
          tags: [],
          specifications: {
            frontend: 'React + TypeScript',
            backend: 'Firebase Functions',
            database: 'Firestore',
            deployment: 'Firebase Hosting'
          }
        });
      }
    } catch (error) {
      console.error('Failed to create blueprint:', error);
    }
  };

  const handleTagInput = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData({ ...formData, tags });
  };

  if (loading) {
    return (
      <div className="blueprint-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>載入藍圖中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blueprint-page">
      <header className="blueprint-header">
        <h1>🏗️ 專案藍圖管理</h1>
        <button 
          className="create-btn"
          onClick={() => setShowCreateForm(true)}
        >
          ➕ 創建新藍圖
        </button>
      </header>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="create-form-modal">
            <form onSubmit={handleCreateBlueprint} className="blueprint-form">
              <h2>創建新專案藍圖</h2>
              
              <div className="form-group">
                <label>藍圖名稱</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="輸入藍圖名稱"
                  required
                />
              </div>

              <div className="form-group">
                <label>描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="描述此藍圖的目標和功能"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>藍圖類型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="universal">萬能系統</option>
                  <option value="web-app">網頁應用</option>
                  <option value="mobile-app">行動應用</option>
                  <option value="api-service">API 服務</option>
                  <option value="data-pipeline">數據管道</option>
                </select>
              </div>

              <div className="form-group">
                <label>標籤 (用逗號分隔)</label>
                <input
                  type="text"
                  onChange={(e) => handleTagInput(e.target.value)}
                  placeholder="前端, 後端, 全端, AI, 自動化"
                />
              </div>

              <div className="specifications-section">
                <h3>技術規格</h3>
                
                <div className="form-group">
                  <label>前端技術</label>
                  <input
                    type="text"
                    value={formData.specifications.frontend}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, frontend: e.target.value }
                    })}
                  />
                </div>

                <div className="form-group">
                  <label>後端技術</label>
                  <input
                    type="text"
                    value={formData.specifications.backend}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, backend: e.target.value }
                    })}
                  />
                </div>

                <div className="form-group">
                  <label>資料庫</label>
                  <input
                    type="text"
                    value={formData.specifications.database}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, database: e.target.value }
                    })}
                  />
                </div>

                <div className="form-group">
                  <label>部署方式</label>
                  <input
                    type="text"
                    value={formData.specifications.deployment}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, deployment: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="cancel-btn"
                >
                  取消
                </button>
                <button type="submit" className="submit-btn">
                  創建藍圖
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="blueprints-grid">
        {blueprints?.map((blueprint) => (
          <Card
            key={blueprint.id}
            id={blueprint.id}
            title={blueprint.name}
            subtitle={blueprint.description}
            type="blueprint"
            status={blueprint.status}
            metadata={{
              createdAt: blueprint.createdAt?.toDate(),
              author: blueprint.creator,
              tags: blueprint.tags
            }}
            content={
              <div className="blueprint-specs">
                <div className="spec-item">
                  <strong>前端:</strong> {blueprint.specifications?.frontend}
                </div>
                <div className="spec-item">
                  <strong>後端:</strong> {blueprint.specifications?.backend}
                </div>
                <div className="spec-item">
                  <strong>資料庫:</strong> {blueprint.specifications?.database}
                </div>
                <div className="spec-item">
                  <strong>部署:</strong> {blueprint.specifications?.deployment}
                </div>
              </div>
            }
            actions={[
              {
                label: '激活',
                onClick: () => activateGenesisWeaver(blueprint.name, blueprint),
                variant: 'primary'
              },
              {
                label: '編輯',
                onClick: () => console.log('Edit blueprint:', blueprint.id)
              },
              {
                label: '複製',
                onClick: () => console.log('Clone blueprint:', blueprint.id)
              }
            ]}
          />
        ))}
      </div>

      {(!blueprints || blueprints.length === 0) && (
        <div className="empty-state">
          <div className="empty-icon">🏗️</div>
          <h3>還沒有任何藍圖</h3>
          <p>創建你的第一個專案藍圖，開始構建萬能系統</p>
          <button 
            className="create-btn"
            onClick={() => setShowCreateForm(true)}
          >
            創建第一個藍圖
          </button>
        </div>
      )}
    </div>
  );
};