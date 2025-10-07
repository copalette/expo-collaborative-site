import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Reunion from './pages/Reunion';
import LifePlan from './pages/LifePlan';
import ExpoFinal from './pages/ExpoFinal';
import ExpoWaitTime from './pages/ExpoWaitTime';
import ExpoRingCounter from './pages/ExpoRingCounter';
import MountainGame from './pages/MountainGame';
import StationGuide from './pages/StationGuide';
import BrowsingHistory from './pages/BrowsingHistory';
import RecipeManager from './pages/RecipeManager';
import SchoolYear from './pages/SchoolYear';
import JobHunting from './pages/JobHunting';
import ExpoTips from './pages/ExpoTips';

// 履歴追跡用コンポーネント
function HistoryTracker() {
  const location = useLocation();

  useEffect(() => {
    const pageInfo: Record<string, { title: string; icon: string }> = {
      '/': { title: 'ホーム', icon: '🏠' },
      '/about': { title: 'このサイトについて', icon: 'ℹ️' },
      '/school-year': { title: '学校カレンダー', icon: '📅' },
      '/reunion': { title: '同窓会', icon: '🎓' },
      '/life-plan': { title: '人生計画', icon: '🌅' },
      '/expo-final': { title: '万博ラストウィーク', icon: '🎪' },
      '/expo-wait-time': { title: '万博待ち時間案内', icon: '⏰' },
      '/expo-ring-counter': { title: '大屋根リング周回カウンター', icon: '🏃‍♂️' },
      '/mountain-game': { title: '登山シミュレーター', icon: '⛰️' },
      '/station-guide': { title: '駅構内案内', icon: '🚉' },
      '/browsing-history': { title: '閲覧履歴', icon: '📊' },
      '/recipe-manager': { title: 'レシピ管理帳', icon: '📝' },
      '/job-hunting': { title: '就活', icon: '💼' },
      '/expo-tips': { title: '万博攻略チップ集', icon: '🧭' },
    };

    const addToHistory = (path: string) => {
      const pageData = pageInfo[path];
      if (!pageData) return;

      const newEntry = {
        id: Date.now().toString(),
        path,
        title: pageData.title,
        timestamp: new Date().toISOString(),
        icon: pageData.icon,
      };

      const savedHistory = localStorage.getItem('browsing-history');
      const currentHistory = savedHistory ? JSON.parse(savedHistory) : [];
      
      // 前回のエントリーに滞在時間を計算
      if (currentHistory.length > 0) {
        const lastEntry = currentHistory[currentHistory.length - 1];
        const duration = Math.round((Date.now() - new Date(lastEntry.timestamp).getTime()) / 1000);
        lastEntry.duration = Math.min(duration, 3600); // 最大1時間でキャップ
      }

      const updatedHistory = [...currentHistory, newEntry];
      
      // 最大500件まで保持
      if (updatedHistory.length > 500) {
        updatedHistory.splice(0, updatedHistory.length - 500);
      }

      localStorage.setItem('browsing-history', JSON.stringify(updatedHistory));
    };

    addToHistory(location.pathname);
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <HistoryTracker />
      <nav className="fixed top-0 right-0 p-4 z-50 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 rounded-bl-3xl shadow-2xl">
        <div className="flex gap-2 flex-wrap">
          <Link 
            to="/" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-yellow-200 shadow-lg"
          >
            🏠 ホーム
          </Link>
          <Link 
            to="/school-year" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-pink-200 shadow-lg"
          >
            📅 学校カレンダー
          </Link>
          <Link 
            to="/about" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-blue-200 shadow-lg"
          >
            ℹ️ このサイト
          </Link>
          <Link 
            to="/reunion" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-green-200 shadow-lg"
          >
            🎓 同窓会
          </Link>
          <Link 
            to="/life-plan" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-purple-200 shadow-lg"
          >
            🌅 人生計画
          </Link>
          <Link 
            to="/expo-final" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-orange-200 shadow-lg"
          >
            🎪 万博
          </Link>
          <Link 
            to="/expo-wait-time" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-red-200 shadow-lg"
          >
            ⏰ 待ち時間
          </Link>
          <Link 
            to="/expo-ring-counter" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-orange-200 shadow-lg"
          >
            🏃‍♂️ リング周回
          </Link>
          <Link 
            to="/expo-tips" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-indigo-200 shadow-lg"
          >
            🧭 攻略チップ
          </Link>
          <Link 
            to="/mountain-game" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-emerald-200 shadow-lg"
          >
            ⛰️ 登山ゲーム
          </Link>
          <Link 
            to="/station-guide" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-indigo-200 shadow-lg"
          >
            🚉 駅案内
          </Link>
          <Link 
            to="/browsing-history" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-purple-200 shadow-lg"
          >
            📊 履歴
          </Link>
          <Link 
            to="/recipe-manager" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-yellow-200 shadow-lg"
          >
            📝 レシピ
          </Link>
          <Link 
            to="/job-hunting" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-cyan-200 shadow-lg"
          >
            💼 就活
          </Link>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/school-year" element={<SchoolYear />} />
        <Route path="/reunion" element={<Reunion />} />
        <Route path="/life-plan" element={<LifePlan />} />
        <Route path="/expo-final" element={<ExpoFinal />} />
        <Route path="/expo-wait-time" element={<ExpoWaitTime />} />
        <Route path="/expo-ring-counter" element={<ExpoRingCounter />} />
        <Route path="/expo-tips" element={<ExpoTips />} />
        <Route path="/mountain-game" element={<MountainGame />} />
        <Route path="/station-guide" element={<StationGuide />} />
        <Route path="/browsing-history" element={<BrowsingHistory />} />
        <Route path="/recipe-manager" element={<RecipeManager />} />
        <Route path="/job-hunting" element={<JobHunting />} />
      </Routes>
    </Router>
  );
}

export default App;
