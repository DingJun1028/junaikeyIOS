# 萬能智典 - Capacities 集成設計說明

## 功能概述

本實現在 junaikeyIOS 專案中成功集成了 Capacities 智典功能，提供了完整的知識庫訪問和管理功能。

## 技術架構

### 核心組件

1. **useCapacities Hook** (`/src/hooks/useCapacities.ts`)
   - 管理 Capacities 配置和狀態
   - 提供 URL 生成和訪問檢查功能
   - 支援 API 集成 (預留接口)
   - 與 Firebase 數據同步

2. **CapacitiesViewer 組件** (`/src/components/CapacitiesViewer.tsx`)
   - 支援三種顯示模式：嵌入式(iframe)、連結模式、錯誤處理
   - 響應式設計，適配各種螢幕尺寸
   - 自動檢測 Capacities 可訪問性
   - 提供重試和外部開啟功能

3. **CapacitiesPage 頁面** (`/src/pages/CapacitiesPage.tsx`)
   - 專門的 Capacities 智典展示頁面
   - 包含功能說明和使用指南
   - 側邊欄提供技術資訊和操作指引

4. **Capacities API 工具** (`/src/api/capacitiesApi.ts`)
   - 完整的 API 客戶端實現
   - 支援工作空間管理、頁面操作、內容搜尋
   - 錯誤處理和響應管理

### 集成方式

#### 1. 導航集成
- 在主頁導航中新增 "📚 Capacities 智典" 選項
- 支援頁面切換和狀態管理

#### 2. 控制台集成  
- 在 Dashboard 中新增 Capacities 預覽區域
- 提供快速訪問和概覽功能

#### 3. 數據同步
- 透過 Firebase 儲存 Capacities 條目資訊
- 支援離線瀏覽和數據緩存

## 配置資訊

### 基本配置
```typescript
const defaultConfig = {
  baseUrl: 'https://app.capacities.io',
  workspaceId: '48460089-fa48-4eb4-8910-bb35cdfabac4',
  pageId: '1f2e2aba-1228-41e8-a473-607614fb29f7'
};
```

### URL 格式
- 完整 URL: `https://app.capacities.io/{workspaceId}/{pageId}`
- 嵌入 URL: `https://app.capacities.io/{workspaceId}/{pageId}?embed=true&hide_header=true`

## 功能特色

### 1. 多模式顯示
- **嵌入模式**: 透過 iframe 直接顯示 Capacities 內容
- **連結模式**: 提供外部連結訪問
- **錯誤處理**: 自動降級處理連接問題

### 2. 智能訪問檢查
- 自動檢測 Capacities 服務可用性
- 根據檢查結果切換顯示模式
- 提供重試機制

### 3. 響應式設計
- 支援桌面和行動裝置
- 自適應佈局和控制項
- 優化的使用者體驗

### 4. API 支援 (預備功能)
- 完整的 Capacities API 客戶端
- 支援內容獲取、搜尋、創建和更新
- 錯誤處理和驗證機制

## 安全考量

### 1. iframe 安全
```typescript
sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
```

### 2. API 安全
- 支援 Bearer Token 驗證
- HTTPS 加密傳輸
- 錯誤資訊過濾

### 3. 跨域處理
- 使用 `no-cors` 模式進行連接檢查
- 適當的 CSP 設定建議

## 使用說明

### 1. 基本使用
1. 點擊導航中的 "📚 Capacities 智典"
2. 系統會自動載入 Capacities 內容
3. 如果無法載入，會提供替代訪問方式

### 2. 控制項說明
- **🔄 重新載入**: 重新初始化 Capacities 連接
- **🔗 外部開啟**: 在新視窗中開啟 Capacities
- **📱/🖥️ 模式切換**: 在嵌入和連結模式間切換

### 3. Dashboard 預覽
- 在控制台底部可看到 Capacities 預覽
- 高度設定為 400px，適合快速瀏覽
- 點擊可跳轉到完整頁面

## 擴展功能

### 1. API Key 配置
如果 Capacities 提供 API 訪問，可在配置中新增 API Key：
```typescript
const configWithApi = {
  ...defaultConfig,
  apiKey: 'your-capacities-api-key'
};
```

### 2. 內容同步
- 自動同步 Capacities 內容到 Firebase
- 支援離線瀏覽
- 搜尋和索引功能

### 3. 自訂主題
- 支援自訂 CSS 樣式
- 可調整色彩和佈局
- 符合整體系統設計

## 故障排除

### 1. 無法載入內容
- 檢查網路連接
- 確認 Capacities 服務狀態
- 嘗試直接訪問 Capacities 網站

### 2. iframe 被封鎖
- 某些網站可能不允許嵌入
- 自動切換到連結模式
- 提供外部開啟選項

### 3. API 連接失敗
- 檢查 API Key 是否正確
- 確認 Capacities API 可用性
- 查看控制台錯誤訊息

## 開發注意事項

### 1. TypeScript 支援
所有組件都有完整的 TypeScript 類型定義，確保類型安全。

### 2. 效能優化
- 使用 useCallback 避免不必要的重新渲染
- 適當的載入狀態管理
- 錯誤邊界處理

### 3. 可訪問性
- 適當的 ARIA 標籤
- 鍵盤導航支援
- 螢幕閱讀器相容

## 未來改進計劃

1. **深度 API 集成**: 當 Capacities 提供完整 API 時進行深度集成
2. **內容搜尋**: 實現跨 Capacities 內容的搜尋功能
3. **協作功能**: 支援多用戶協作和分享
4. **行動裝置優化**: 進一步優化行動裝置體驗
5. **離線模式**: 完善離線瀏覽和同步功能

---

此實現遵循最小化修改原則，在現有架構基礎上無縫集成 Capacities 功能，為用戶提供完整的智典體驗。