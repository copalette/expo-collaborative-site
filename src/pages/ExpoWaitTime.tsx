import React, { useState, useEffect } from 'react';

interface Pavilion {
  id: string;
  name: string;
  area: string;
  waitTime: number;
  priorityAccess: {
    hasAccess: boolean;
    conditions: string[];
    waitTimeReduction: number;
  };
  popularity: 'very-high' | 'high' | 'medium' | 'low';
  category: 'technology' | 'culture' | 'environment' | 'entertainment' | 'food';
  openTime: string;
  closeTime: string;
  status: 'open' | 'closed' | 'maintenance';
}

const ExpoWaitTime: React.FC = () => {
  const [pavilions, setPavilions] = useState<Pavilion[]>([
    {
      id: 'jp-pavilion',
      name: '日本館',
      area: 'メインエリア',
      waitTime: 180,
      priorityAccess: {
        hasAccess: true,
        conditions: ['障害者手帳保持者', '高齢者（70歳以上）', 'VIPパス保持者'],
        waitTimeReduction: 60
      },
      popularity: 'very-high',
      category: 'culture',
      openTime: '09:00',
      closeTime: '20:00',
      status: 'open'
    },
    {
      id: 'future-tech',
      name: '未来技術館',
      area: 'テクノロジーゾーン',
      waitTime: 120,
      priorityAccess: {
        hasAccess: true,
        conditions: ['学生証提示', '研究者証明書', 'プレミアムパス'],
        waitTimeReduction: 45
      },
      popularity: 'very-high',
      category: 'technology',
      openTime: '09:30',
      closeTime: '19:30',
      status: 'open'
    },
    {
      id: 'green-planet',
      name: 'グリーンプラネット',
      area: '環境エリア',
      waitTime: 45,
      priorityAccess: {
        hasAccess: false,
        conditions: [],
        waitTimeReduction: 0
      },
      popularity: 'medium',
      category: 'environment',
      openTime: '10:00',
      closeTime: '18:00',
      status: 'open'
    },
    {
      id: 'food-world',
      name: 'ワールドフード館',
      area: 'グルメエリア',
      waitTime: 30,
      priorityAccess: {
        hasAccess: true,
        conditions: ['レストラン予約者', 'ファミリーパス'],
        waitTimeReduction: 15
      },
      popularity: 'high',
      category: 'food',
      openTime: '11:00',
      closeTime: '21:00',
      status: 'open'
    },
    {
      id: 'virtual-reality',
      name: 'VRワンダーランド',
      area: 'エンターテイメントゾーン',
      waitTime: 90,
      priorityAccess: {
        hasAccess: true,
        conditions: ['18歳未満優先', 'グループ予約（4名以上）'],
        waitTimeReduction: 30
      },
      popularity: 'high',
      category: 'entertainment',
      openTime: '10:00',
      closeTime: '20:00',
      status: 'open'
    },
    {
      id: 'space-exploration',
      name: '宇宙探査館',
      area: 'サイエンスゾーン',
      waitTime: 0,
      priorityAccess: {
        hasAccess: false,
        conditions: [],
        waitTimeReduction: 0
      },
      popularity: 'medium',
      category: 'technology',
      openTime: '09:00',
      closeTime: '18:00',
      status: 'maintenance'
    }
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'waitTime' | 'name' | 'popularity'>('waitTime');

  useEffect(() => {
    const interval = setInterval(() => {
      setPavilions(prev => prev.map(pavilion => {
        if (pavilion.status === 'maintenance') return pavilion;
        
        const randomChange = Math.floor(Math.random() * 21) - 10;
        const newWaitTime = Math.max(0, pavilion.waitTime + randomChange);
        return { ...pavilion, waitTime: newWaitTime };
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getPopularityColor = (popularity: Pavilion['popularity']) => {
    switch (popularity) {
      case 'very-high': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const getWaitTimeColor = (waitTime: number) => {
    if (waitTime >= 120) return 'text-red-600 font-bold';
    if (waitTime >= 60) return 'text-orange-600 font-bold';
    if (waitTime >= 30) return 'text-yellow-600 font-bold';
    return 'text-green-600 font-bold';
  };

  const getCategoryIcon = (category: Pavilion['category']) => {
    switch (category) {
      case 'technology': return '🚀';
      case 'culture': return '🏛️';
      case 'environment': return '🌱';
      case 'entertainment': return '🎮';
      case 'food': return '🍽️';
    }
  };

  const filteredAndSortedPavilions = pavilions
    .filter(pavilion => {
      if (filterCategory !== 'all' && pavilion.category !== filterCategory) return false;
      if (filterPriority === 'priority-only' && !pavilion.priorityAccess.hasAccess) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'waitTime':
          return a.waitTime - b.waitTime;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
          const popularityOrder = { 'very-high': 0, 'high': 1, 'medium': 2, 'low': 3 };
          return popularityOrder[a.popularity] - popularityOrder[b.popularity];
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ⏰ 万博待ち時間＆優先入場ガイド
          </h1>
          <p className="text-xl text-gray-600">
            リアルタイム待ち時間と優先入場条件をチェック
          </p>
          <div className="mt-4 text-sm text-gray-500">
            最終更新: {new Date().toLocaleTimeString('ja-JP')}
          </div>
        </header>

        {/* フィルター＆ソート */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリで絞り込み
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">すべて</option>
                <option value="technology">🚀 テクノロジー</option>
                <option value="culture">🏛️ 文化</option>
                <option value="environment">🌱 環境</option>
                <option value="entertainment">🎮 エンターテイメント</option>
                <option value="food">🍽️ グルメ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                優先入場で絞り込み
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">すべて</option>
                <option value="priority-only">優先入場ありのみ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                並び順
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full p-2 border rounded-md"
              >
                <option value="waitTime">待ち時間順</option>
                <option value="name">名前順</option>
                <option value="popularity">人気順</option>
              </select>
            </div>
          </div>
        </div>

        {/* パビリオン一覧 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredAndSortedPavilions.map((pavilion) => (
            <div
              key={pavilion.id}
              className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
                pavilion.status === 'maintenance' 
                  ? 'border-gray-400 opacity-60' 
                  : pavilion.priorityAccess.hasAccess 
                    ? 'border-green-400' 
                    : 'border-blue-400'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getCategoryIcon(pavilion.category)}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{pavilion.name}</h3>
                    <p className="text-sm text-gray-600">{pavilion.area}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPopularityColor(pavilion.popularity)}`}>
                  {pavilion.popularity === 'very-high' && '超人気'}
                  {pavilion.popularity === 'high' && '人気'}
                  {pavilion.popularity === 'medium' && '普通'}
                  {pavilion.popularity === 'low' && '空いてる'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">現在の待ち時間</div>
                  <div className={`text-3xl font-bold ${getWaitTimeColor(pavilion.waitTime)}`}>
                    {pavilion.status === 'maintenance' ? 'メンテ中' : `${pavilion.waitTime}分`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">営業時間</div>
                  <div className="text-lg font-medium text-gray-800">
                    {pavilion.openTime} - {pavilion.closeTime}
                  </div>
                </div>
              </div>

              {pavilion.priorityAccess.hasAccess && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2 flex items-center">
                    ⚡ 優先入場あり（待ち時間 -{pavilion.priorityAccess.waitTimeReduction}分）
                  </h4>
                  <div className="text-sm text-green-700">
                    <div className="font-medium mb-1">対象条件:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {pavilion.priorityAccess.conditions.map((condition, index) => (
                        <li key={index}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {!pavilion.priorityAccess.hasAccess && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-gray-600 text-sm">
                    💡 このパビリオンには優先入場制度はありません
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 優先入場の説明 */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-purple-700">
            📋 優先入場制度について
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-700">🎫 優先入場の種類</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <strong>VIPパス:</strong> 全パビリオンで最優先入場
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <strong>障害者手帳:</strong> 本人＋付添者1名まで優先
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <strong>高齢者優先:</strong> 70歳以上の方
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <strong>学生証:</strong> 一部パビリオンで学生優先枠
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4 text-green-700">💡 待ち時間短縮のコツ</h3>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <strong>朝一番:</strong> 開場直後が最も空いています
                </div>
                <div className="p-3 bg-cyan-50 rounded-lg">
                  <strong>昼食時間:</strong> 12:00-13:00は比較的空きます
                </div>
                <div className="p-3 bg-pink-50 rounded-lg">
                  <strong>夕方以降:</strong> 17:00以降は待ち時間が減少
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <strong>平日狙い:</strong> 土日祝日を避ける
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500">
          <p>万博待ち時間情報システム</p>
          <p className="mt-2">効率的な万博観光をサポート！ 🎪</p>
        </footer>
      </div>
    </div>
  );
};

export default ExpoWaitTime;