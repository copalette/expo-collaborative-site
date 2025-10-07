import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface HistoryEntry {
  id: string;
  path: string;
  title: string;
  timestamp: string;
  duration?: number;
  icon: string;
}

interface PageStats {
  path: string;
  title: string;
  visitCount: number;
  totalTime: number;
  lastVisit: string;
  icon: string;
}

const BrowsingHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [pageStats, setPageStats] = useState<PageStats[]>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'stats' | 'breadcrumb'>('timeline');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const pageInfo: Record<string, { title: string; icon: string }> = {
    '/': { title: 'ホーム', icon: '🏠' },
    '/about': { title: 'このサイトについて', icon: 'ℹ️' },
    '/school-year': { title: '学校カレンダー', icon: '📅' },
    '/reunion': { title: '同窓会', icon: '🎓' },
    '/life-plan': { title: '人生計画', icon: '🌅' },
    '/expo-final': { title: '万博ラストウィーク', icon: '🎪' },
    '/expo-wait-time': { title: '万博待ち時間案内', icon: '⏰' },
    '/mountain-game': { title: '登山シミュレーター', icon: '⛰️' },
    '/station-guide': { title: '駅構内案内', icon: '🚉' },
    '/job-hunting': { title: '就活', icon: '💼' },
    '/browsing-history': { title: '閲覧履歴', icon: '📊' },
  };

  useEffect(() => {
    loadHistory();
    calculateStats();
  }, []);

  const loadHistory = () => {
    const savedHistory = localStorage.getItem('browsing-history');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setHistory(parsed);
    }
  };

  const calculateStats = () => {
    const savedHistory = localStorage.getItem('browsing-history');
    if (!savedHistory) return;

    const historyData: HistoryEntry[] = JSON.parse(savedHistory);
    const statsMap = new Map<string, PageStats>();

    historyData.forEach((entry, index) => {
      const { path, timestamp, duration = 0 } = entry;
      const pageData = pageInfo[path];
      
      if (!pageData) return;

      if (statsMap.has(path)) {
        const existing = statsMap.get(path)!;
        existing.visitCount++;
        existing.totalTime += duration;
        existing.lastVisit = timestamp;
      } else {
        statsMap.set(path, {
          path,
          title: pageData.title,
          visitCount: 1,
          totalTime: duration,
          lastVisit: timestamp,
          icon: pageData.icon,
        });
      }
    });

    const stats = Array.from(statsMap.values())
      .sort((a, b) => b.visitCount - a.visitCount);
    
    setPageStats(stats);
  };

  const addToHistory = (path: string) => {
    const pageData = pageInfo[path];
    if (!pageData) return;

    const newEntry: HistoryEntry = {
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
    setHistory(updatedHistory);
    calculateStats();
  };

  const clearHistory = () => {
    if (window.confirm('閲覧履歴をすべて削除しますか？')) {
      localStorage.removeItem('browsing-history');
      setHistory([]);
      setPageStats([]);
    }
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `browsing-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const navigateToPage = (path: string) => {
    addToHistory(path);
    navigate(path);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
    return `${Math.floor(seconds / 3600)}時間${Math.floor((seconds % 3600) / 60)}分`;
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('ja-JP'),
      time: date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const filteredHistory = history.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.path.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterDate === 'all') return matchesSearch;
    
    const entryDate = new Date(entry.timestamp).toDateString();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    switch (filterDate) {
      case 'today':
        return matchesSearch && entryDate === today;
      case 'yesterday':
        return matchesSearch && entryDate === yesterday;
      case 'week':
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return matchesSearch && new Date(entry.timestamp).getTime() > weekAgo;
      default:
        return matchesSearch;
    }
  });

  const getBreadcrumbPath = () => {
    const recentPages = history.slice(-5).reverse();
    return recentPages;
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayEntries = history.filter(entry => 
      new Date(entry.timestamp).toDateString() === today
    );
    
    const totalTime = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const uniquePages = new Set(todayEntries.map(entry => entry.path)).size;
    
    return {
      visits: todayEntries.length,
      uniquePages,
      totalTime,
    };
  };

  const todayStats = getTodayStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            📊 閲覧履歴
          </h1>
          <p className="text-xl text-gray-600">
            あなたのサイト内での軌跡を追跡
          </p>
        </header>

        {/* 今日の統計 */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{todayStats.visits}</div>
            <div className="text-gray-600">今日のページ訪問</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{todayStats.uniquePages}</div>
            <div className="text-gray-600">訪問したページ数</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{formatDuration(todayStats.totalTime)}</div>
            <div className="text-gray-600">合計滞在時間</div>
          </div>
        </div>

        {/* コントロールパネル */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded ${
                  viewMode === 'timeline' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📋 タイムライン
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`px-4 py-2 rounded ${
                  viewMode === 'stats' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📈 統計
              </button>
              <button
                onClick={() => setViewMode('breadcrumb')}
                className={`px-4 py-2 rounded ${
                  viewMode === 'breadcrumb' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🍞 パンくず
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportHistory}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                📥 エクスポート
              </button>
              <button
                onClick={clearHistory}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                🗑️ クリア
              </button>
            </div>
          </div>

          {viewMode === 'timeline' && (
            <div className="mt-4 flex gap-4">
              <input
                type="text"
                placeholder="ページを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-2 border rounded"
              />
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="all">すべての期間</option>
                <option value="today">今日</option>
                <option value="yesterday">昨日</option>
                <option value="week">過去1週間</option>
              </select>
            </div>
          )}
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {viewMode === 'timeline' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                📋 閲覧タイムライン ({filteredHistory.length}件)
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredHistory.slice().reverse().map((entry, index) => {
                  const { date, time } = formatDateTime(entry.timestamp);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigateToPage(entry.path)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{entry.icon}</span>
                        <div>
                          <div className="font-medium">{entry.title}</div>
                          <div className="text-sm text-gray-600">{entry.path}</div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{date} {time}</div>
                        {entry.duration && (
                          <div className="text-xs">滞在: {formatDuration(entry.duration)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'stats' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">📈 ページ別統計</h2>
              <div className="space-y-3">
                {pageStats.map((stat) => {
                  const { date, time } = formatDateTime(stat.lastVisit);
                  return (
                    <div
                      key={stat.path}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigateToPage(stat.path)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{stat.icon}</span>
                        <div>
                          <div className="font-medium">{stat.title}</div>
                          <div className="text-sm text-gray-600">{stat.path}</div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-bold text-blue-600">{stat.visitCount}回訪問</div>
                        <div className="text-gray-600">合計: {formatDuration(stat.totalTime)}</div>
                        <div className="text-xs text-gray-500">最終: {date} {time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'breadcrumb' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">🍞 最近の軌跡</h2>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {getBreadcrumbPath().map((entry, index) => (
                  <React.Fragment key={entry.id}>
                    <button
                      onClick={() => navigateToPage(entry.path)}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <span>{entry.icon}</span>
                      <span className="font-medium">{entry.title}</span>
                    </button>
                    {index < getBreadcrumbPath().length - 1 && (
                      <span className="text-gray-400">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold mb-4">🗺️ サイトマップ</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(pageInfo).map(([path, info]) => {
                    const stat = pageStats.find(s => s.path === path);
                    return (
                      <button
                        key={path}
                        onClick={() => navigateToPage(path)}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 text-left"
                      >
                        <span className="text-xl">{info.icon}</span>
                        <div>
                          <div className="font-medium">{info.title}</div>
                          <div className="text-xs text-gray-500">
                            {stat ? `${stat.visitCount}回訪問` : '未訪問'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-12 text-center text-gray-500">
          <p>閲覧履歴システム</p>
          <p className="mt-2">あなたの軌跡を可視化！ 📊</p>
        </footer>
      </div>
    </div>
  );
};

export default BrowsingHistory;