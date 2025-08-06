import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { HomePage } from './pages/HomePage';
import './App.css';

/**
 * 萬能智典主應用 - Universal Wisdom System Main App
 * 系統的核心入口點，整合所有功能模組
 */

// Firebase 配置 (在生產環境中應使用環境變數)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app);

function App() {
  return (
    <div className="app">
      <HomePage />
    </div>
  );
}

export default App;
