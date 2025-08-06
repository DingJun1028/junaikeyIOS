import React from 'react';
import './Card.css';

/**
 * 萬能卡牌組件 - Universal Card Component
 * 展示各種數據和功能的核心UI元件
 */

export interface CardProps {
  id?: string;
  title: string;
  subtitle?: string;
  content?: React.ReactNode;
  type?: 'blueprint' | 'agent' | 'event' | 'wisdom' | 'default';
  status?: 'active' | 'inactive' | 'processing' | 'error' | 'completed';
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  metadata?: {
    createdAt?: Date;
    updatedAt?: Date;
    author?: string;
    tags?: string[];
  };
  onClick?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  id,
  title,
  subtitle,
  content,
  type = 'default',
  status,
  actions,
  metadata,
  onClick,
  className = ''
}) => {
  const getCardTypeClass = () => {
    switch (type) {
      case 'blueprint': return 'card-blueprint';
      case 'agent': return 'card-agent';
      case 'event': return 'card-event';
      case 'wisdom': return 'card-wisdom';
      default: return 'card-default';
    }
  };

  const getStatusClass = () => {
    if (!status) return '';
    return `card-status-${status}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'active': return '🟢';
      case 'inactive': return '⚪';
      case 'processing': return '🟡';
      case 'error': return '🔴';
      case 'completed': return '✅';
      default: return '';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'blueprint': return '🏗️';
      case 'agent': return '🤖';
      case 'event': return '⚡';
      case 'wisdom': return '💎';
      default: return '📄';
    }
  };

  return (
    <div
      className={`card ${getCardTypeClass()} ${getStatusClass()} ${className}`}
      onClick={onClick}
      data-card-id={id}
    >
      <div className="card-header">
        <div className="card-type-icon">{getTypeIcon()}</div>
        <div className="card-title-section">
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
        {status && (
          <div className="card-status">
            <span className="status-icon">{getStatusIcon()}</span>
            <span className="status-text">{status}</span>
          </div>
        )}
      </div>

      {content && (
        <div className="card-content">
          {content}
        </div>
      )}

      {metadata && (
        <div className="card-metadata">
          {metadata.tags && (
            <div className="card-tags">
              {metadata.tags.map((tag, index) => (
                <span key={index} className="card-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="card-meta-info">
            {metadata.author && (
              <span className="meta-author">👤 {metadata.author}</span>
            )}
            {metadata.createdAt && (
              <span className="meta-date">
                📅 {metadata.createdAt.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {actions && actions.length > 0 && (
        <div className="card-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`card-action ${action.variant || 'secondary'}`}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};