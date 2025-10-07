import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Reunion from './pages/Reunion';
import LifePlan from './pages/LifePlan';
import ExpoFinal from './pages/ExpoFinal';
import ExpoWaitTime from './pages/ExpoWaitTime';
import ExpoRingCounter from './pages/ExpoRingCounter';
import ExpoPedometer from './pages/ExpoPedometer';
import MountainGame from './pages/MountainGame';
import StationGuide from './pages/StationGuide';
import BrowsingHistory from './pages/BrowsingHistory';
import RecipeManager from './pages/RecipeManager';
import SchoolYear from './pages/SchoolYear';
import JobHunting from './pages/JobHunting';
import ExpoTips from './pages/ExpoTips';

type NavItem = {
  path: string;
  label: string;
  icon: string;
  accentClass: string;
};

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'ホーム', icon: '🏠', accentClass: 'hover:bg-amber-100 hover:border-amber-300/70' },
  { path: '/school-year', label: '学校カレンダー', icon: '📅', accentClass: 'hover:bg-pink-100 hover:border-pink-300/70' },
  { path: '/about', label: 'このサイト', icon: 'ℹ️', accentClass: 'hover:bg-sky-100 hover:border-sky-300/70' },
  { path: '/reunion', label: '同窓会', icon: '🎓', accentClass: 'hover:bg-emerald-100 hover:border-emerald-300/70' },
  { path: '/life-plan', label: '人生計画', icon: '🌅', accentClass: 'hover:bg-purple-100 hover:border-purple-300/70' },
  { path: '/expo-final', label: '万博ラストウィーク', icon: '🎪', accentClass: 'hover:bg-orange-100 hover:border-orange-300/70' },
  { path: '/expo-wait-time', label: '万博待ち時間', icon: '⏰', accentClass: 'hover:bg-rose-100 hover:border-rose-300/70' },
  { path: '/expo-ring-counter', label: 'リング周回', icon: '🏃‍♂️', accentClass: 'hover:bg-amber-100 hover:border-amber-300/70' },
  { path: '/expo-pedometer', label: '歩数計', icon: '🚶‍♀️', accentClass: 'hover:bg-sky-100 hover:border-sky-300/70' },
  { path: '/expo-tips', label: '攻略チップ', icon: '🧭', accentClass: 'hover:bg-indigo-100 hover:border-indigo-300/70' },
  { path: '/mountain-game', label: '登山ゲーム', icon: '⛰️', accentClass: 'hover:bg-emerald-100 hover:border-emerald-300/70' },
  { path: '/station-guide', label: '駅案内', icon: '🚉', accentClass: 'hover:bg-indigo-100 hover:border-indigo-300/70' },
  { path: '/browsing-history', label: '閲覧履歴', icon: '📊', accentClass: 'hover:bg-purple-100 hover:border-purple-300/70' },
  { path: '/recipe-manager', label: 'レシピ', icon: '📝', accentClass: 'hover:bg-yellow-100 hover:border-yellow-300/70' },
  { path: '/job-hunting', label: '就活', icon: '💼', accentClass: 'hover:bg-cyan-100 hover:border-cyan-300/70' },
];

const PAGE_INFO = NAV_ITEMS.reduce<Record<string, { title: string; icon: string }>>((acc, item) => {
  acc[item.path] = { title: item.label, icon: item.icon };
  return acc;
}, {});

const HistoryTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const pageData = PAGE_INFO[location.pathname];
    if (!pageData) return;

    const newEntry = {
      id: Date.now().toString(),
      path: location.pathname,
      title: pageData.title,
      timestamp: new Date().toISOString(),
      icon: pageData.icon,
    };

    const savedHistory = localStorage.getItem('browsing-history');
    const currentHistory = savedHistory ? JSON.parse(savedHistory) : [];

    if (currentHistory.length > 0) {
      const lastEntry = currentHistory[currentHistory.length - 1];
      const duration = Math.round((Date.now() - new Date(lastEntry.timestamp).getTime()) / 1000);
      lastEntry.duration = Math.min(duration, 3600);
    }

    const updatedHistory = [...currentHistory, newEntry];

    if (updatedHistory.length > 500) {
      updatedHistory.splice(0, updatedHistory.length - 500);
    }

    localStorage.setItem('browsing-history', JSON.stringify(updatedHistory));
  }, [location.pathname]);

  return null;
};

const DesktopNav = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 flex-col gap-6 bg-white/90 backdrop-blur-xl border-r border-slate-200/70 px-6 py-8 shadow-xl">
      <Link to="/" className="flex items-center gap-3 text-lg font-bold text-slate-900">
        <span className="text-2xl">🎟️</span>
        <span>Expo Companion</span>
      </Link>
      <p className="text-xs text-slate-500 leading-relaxed">
        万博に向けた計画と現地攻略のツールボックス。気になる機能へすぐアクセスできます。
      </p>
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${active ? 'bg-slate-900 text-white border-slate-900/80 shadow-lg shadow-slate-900/20' : `text-slate-600 border-transparent ${item.accentClass}`}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

const MobileNav = ({ isOpen, onToggle, onNavigate }: { isOpen: boolean; onToggle: () => void; onNavigate: () => void }) => {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200/70 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2 text-base font-semibold text-slate-800">
          <span className="text-xl">🎟️</span>
          <span>Expo Companion</span>
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-md"
        >
          {isOpen ? '閉じる' : 'メニュー'}
        </button>
      </div>
      <div className={`${isOpen ? 'grid' : 'hidden'} grid-cols-2 gap-3 px-4 pb-4`}> 
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${active ? 'bg-slate-900 text-white border-slate-900/80 shadow-lg' : `text-slate-600 border-transparent ${item.accentClass}`}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Router>
      <HistoryTracker />
      <DesktopNav />
      <MobileNav
        isOpen={isMobileMenuOpen}
        onToggle={() => setIsMobileMenuOpen(open => !open)}
        onNavigate={() => setIsMobileMenuOpen(false)}
      />
      <div className="min-h-screen bg-slate-50 lg:pl-80">
        <main className="pt-24 lg:pt-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/school-year" element={<SchoolYear />} />
            <Route path="/reunion" element={<Reunion />} />
            <Route path="/life-plan" element={<LifePlan />} />
            <Route path="/expo-final" element={<ExpoFinal />} />
            <Route path="/expo-wait-time" element={<ExpoWaitTime />} />
            <Route path="/expo-ring-counter" element={<ExpoRingCounter />} />
            <Route path="/expo-pedometer" element={<ExpoPedometer />} />
            <Route path="/expo-tips" element={<ExpoTips />} />
            <Route path="/mountain-game" element={<MountainGame />} />
            <Route path="/station-guide" element={<StationGuide />} />
            <Route path="/browsing-history" element={<BrowsingHistory />} />
            <Route path="/recipe-manager" element={<RecipeManager />} />
            <Route path="/job-hunting" element={<JobHunting />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
