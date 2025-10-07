import React, { useState, useEffect } from 'react';

interface Facility {
  id: string;
  name: string;
  category: 'shop' | 'restaurant' | 'service' | 'transport' | 'amenity';
  floor: 'B2' | 'B1' | '1F' | '2F' | '3F';
  position: { x: number; y: number };
  description: string;
  openTime: string;
  closeTime: string;
  phone?: string;
  isOpen: boolean;
}

interface TrainLine {
  id: string;
  name: string;
  color: string;
  platform: string;
  nextTrains: {
    destination: string;
    time: string;
    delay: number;
  }[];
}

const StationGuide: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState<'B2' | 'B1' | '1F' | '2F' | '3F'>('1F');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const facilities: Facility[] = [
    // 1F
    { id: '1f-gate', name: '改札口', category: 'transport', floor: '1F', position: { x: 50, y: 30 }, description: 'メイン改札。ICカード対応', openTime: '05:00', closeTime: '24:00', isOpen: true },
    { id: '1f-info', name: '案内所', category: 'service', floor: '1F', position: { x: 30, y: 40 }, description: '駅員による案内サービス', openTime: '06:00', closeTime: '22:00', phone: '03-1234-5678', isOpen: true },
    { id: '1f-ticket', name: '券売機', category: 'service', floor: '1F', position: { x: 20, y: 35 }, description: '乗車券・定期券販売', openTime: '24時間', closeTime: '24時間', isOpen: true },
    { id: '1f-convenience', name: 'ファミリーマート', category: 'shop', floor: '1F', position: { x: 70, y: 20 }, description: '24時間営業のコンビニ', openTime: '24時間', closeTime: '24時間', isOpen: true },
    { id: '1f-cafe', name: 'ドトール', category: 'restaurant', floor: '1F', position: { x: 80, y: 40 }, description: 'コーヒーショップ', openTime: '06:30', closeTime: '21:00', isOpen: true },

    // B1
    { id: 'b1-platform1', name: '1・2番線ホーム', category: 'transport', floor: 'B1', position: { x: 30, y: 50 }, description: '山手線・京浜東北線', openTime: '05:00', closeTime: '24:30', isOpen: true },
    { id: 'b1-platform3', name: '3・4番線ホーム', category: 'transport', floor: 'B1', position: { x: 70, y: 50 }, description: '中央線・総武線', openTime: '05:00', closeTime: '24:30', isOpen: true },
    { id: 'b1-toilet', name: 'トイレ', category: 'amenity', floor: 'B1', position: { x: 50, y: 20 }, description: '多目的トイレあり', openTime: '24時間', closeTime: '24時間', isOpen: true },
    { id: 'b1-elevator', name: 'エレベーター', category: 'amenity', floor: 'B1', position: { x: 50, y: 80 }, description: '車椅子対応', openTime: '05:00', closeTime: '24:30', isOpen: true },

    // 2F
    { id: '2f-restaurant', name: 'レストラン街', category: 'restaurant', floor: '2F', position: { x: 40, y: 30 }, description: '和洋中8店舗', openTime: '11:00', closeTime: '22:00', isOpen: true },
    { id: '2f-bookstore', name: '紀伊國屋書店', category: 'shop', floor: '2F', position: { x: 60, y: 20 }, description: '書籍・雑誌・文具', openTime: '10:00', closeTime: '21:00', isOpen: true },
    { id: '2f-pharmacy', name: 'マツモトキヨシ', category: 'shop', floor: '2F', position: { x: 20, y: 60 }, description: 'ドラッグストア', openTime: '09:00', closeTime: '22:00', isOpen: true },
    { id: '2f-atm', name: 'ATMコーナー', category: 'service', floor: '2F', position: { x: 80, y: 70 }, description: '主要銀行ATM設置', openTime: '24時間', closeTime: '24時間', isOpen: true },

    // 3F
    { id: '3f-clinic', name: '駅ナカクリニック', category: 'service', floor: '3F', position: { x: 30, y: 40 }, description: '内科・外科', openTime: '09:00', closeTime: '18:00', phone: '03-9999-0000', isOpen: false },
    { id: '3f-gym', name: 'ジムスタ', category: 'service', floor: '3F', position: { x: 70, y: 30 }, description: 'フィットネスジム', openTime: '06:00', closeTime: '23:00', isOpen: true },
    { id: '3f-coworking', name: 'ワークスペース', category: 'service', floor: '3F', position: { x: 50, y: 60 }, description: 'コワーキングスペース', openTime: '07:00', closeTime: '22:00', isOpen: true },

    // B2
    { id: 'b2-subway', name: '地下鉄連絡通路', category: 'transport', floor: 'B2', position: { x: 50, y: 40 }, description: '地下鉄3路線に接続', openTime: '05:00', closeTime: '24:00', isOpen: true },
    { id: 'b2-parking', name: '駐車場', category: 'service', floor: 'B2', position: { x: 30, y: 70 }, description: '300台収容', openTime: '24時間', closeTime: '24時間', isOpen: true },
    { id: 'b2-storage', name: 'コインロッカー', category: 'amenity', floor: 'B2', position: { x: 70, y: 20 }, description: '大中小サイズ対応', openTime: '24時間', closeTime: '24時間', isOpen: true },
  ];

  const trainLines: TrainLine[] = [
    {
      id: 'yamanote',
      name: '山手線',
      color: '#9acd32',
      platform: '1・2番線',
      nextTrains: [
        { destination: '新宿・池袋方面', time: '13:45', delay: 0 },
        { destination: '品川・東京方面', time: '13:47', delay: 2 },
        { destination: '新宿・池袋方面', time: '13:49', delay: 0 },
      ]
    },
    {
      id: 'keihin',
      name: '京浜東北線',
      color: '#0066cc',
      platform: '1・2番線',
      nextTrains: [
        { destination: '大宮・浦和方面', time: '13:46', delay: 0 },
        { destination: '横浜・大船方面', time: '13:50', delay: 1 },
        { destination: '大宮・浦和方面', time: '13:54', delay: 0 },
      ]
    },
    {
      id: 'chuo',
      name: '中央線',
      color: '#ff6600',
      platform: '3・4番線',
      nextTrains: [
        { destination: '新宿・中野方面', time: '13:48', delay: 0 },
        { destination: '東京・千葉方面', time: '13:52', delay: 3 },
        { destination: '新宿・中野方面', time: '13:56', delay: 0 },
      ]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const filteredFacilities = facilities.filter(facility => {
    const matchesFloor = facility.floor === selectedFloor;
    const matchesCategory = selectedCategory === 'all' || facility.category === selectedCategory;
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFloor && matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: Facility['category']) => {
    switch (category) {
      case 'shop': return '🛍️';
      case 'restaurant': return '🍽️';
      case 'service': return '🏢';
      case 'transport': return '🚇';
      case 'amenity': return '🚻';
    }
  };

  const getCategoryName = (category: Facility['category']) => {
    switch (category) {
      case 'shop': return 'ショップ';
      case 'restaurant': return 'レストラン';
      case 'service': return 'サービス';
      case 'transport': return '交通';
      case 'amenity': return '設備';
    }
  };

  const isCurrentlyOpen = (facility: Facility) => {
    if (facility.openTime === '24時間') return true;
    const now = currentTime;
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTimeStr >= facility.openTime && currentTimeStr <= facility.closeTime;
  };

  const getFloorColor = (floor: string) => {
    switch (floor) {
      case 'B2': return 'bg-purple-600';
      case 'B1': return 'bg-blue-600';
      case '1F': return 'bg-green-600';
      case '2F': return 'bg-orange-600';
      case '3F': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚉 駅構内案内
          </h1>
          <p className="text-xl text-gray-600">
            フロアマップ・施設案内・乗り換え情報
          </p>
          <div className="mt-4 text-lg font-medium text-indigo-700">
            現在時刻: {currentTime.toLocaleTimeString('ja-JP')}
          </div>
        </header>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* 左サイドバー - 検索とフィルター */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🔍 施設検索</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    キーワード検索
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="施設名で検索..."
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カテゴリ
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">すべて</option>
                    <option value="shop">🛍️ ショップ</option>
                    <option value="restaurant">🍽️ レストラン</option>
                    <option value="service">🏢 サービス</option>
                    <option value="transport">🚇 交通</option>
                    <option value="amenity">🚻 設備</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 電車時刻表 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🚃 次の電車</h2>
              <div className="space-y-3">
                {trainLines.map((line) => (
                  <div key={line.id} className="border-l-4 pl-3" style={{ borderColor: line.color }}>
                    <div className="font-bold text-sm">{line.name}</div>
                    <div className="text-xs text-gray-600 mb-1">{line.platform}</div>
                    {line.nextTrains.slice(0, 2).map((train, index) => (
                      <div key={index} className="text-xs">
                        <span className="font-medium">{train.time}</span>
                        <span className="ml-2">{train.destination}</span>
                        {train.delay > 0 && (
                          <span className="ml-1 text-red-600">({train.delay}分遅延)</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* メインエリア - フロアマップ */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">🗺️ フロアマップ</h2>
                
                {/* フロア選択 */}
                <div className="flex gap-1">
                  {['3F', '2F', '1F', 'B1', 'B2'].map((floor) => (
                    <button
                      key={floor}
                      onClick={() => setSelectedFloor(floor as any)}
                      className={`px-3 py-2 rounded-md font-bold text-white ${
                        selectedFloor === floor 
                          ? getFloorColor(floor)
                          : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                    >
                      {floor}
                    </button>
                  ))}
                </div>
              </div>

              {/* マップエリア */}
              <div className="relative bg-gray-100 rounded-lg h-96 mb-4">
                <div className="absolute inset-0 p-4">
                  <div className="w-full h-full border-2 border-gray-300 rounded relative">
                    {/* 施設プロット */}
                    {filteredFacilities.map((facility) => (
                      <button
                        key={facility.id}
                        onClick={() => setSelectedFacility(facility)}
                        className={`absolute w-4 h-4 rounded-full transform -translate-x-2 -translate-y-2 ${
                          isCurrentlyOpen(facility) ? 'bg-green-500' : 'bg-red-500'
                        } hover:w-6 hover:h-6 hover:-translate-x-3 hover:-translate-y-3 transition-all cursor-pointer`}
                        style={{
                          left: `${facility.position.x}%`,
                          top: `${facility.position.y}%`,
                        }}
                        title={facility.name}
                      />
                    ))}
                    
                    {/* 凡例 */}
                    <div className="absolute bottom-2 left-2 bg-white p-2 rounded shadow text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>営業中</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>営業時間外</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 選択された施設の詳細 */}
              {selectedFacility && (
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold flex items-center">
                        {getCategoryIcon(selectedFacility.category)}
                        <span className="ml-2">{selectedFacility.name}</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          isCurrentlyOpen(selectedFacility) 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isCurrentlyOpen(selectedFacility) ? '営業中' : '営業時間外'}
                        </span>
                      </h3>
                      <p className="text-gray-600 mt-1">{selectedFacility.description}</p>
                      <div className="mt-2 text-sm">
                        <p><strong>営業時間:</strong> {selectedFacility.openTime} - {selectedFacility.closeTime}</p>
                        <p><strong>フロア:</strong> {selectedFacility.floor}</p>
                        {selectedFacility.phone && (
                          <p><strong>電話:</strong> {selectedFacility.phone}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFacility(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右サイドバー - 施設リスト */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">
                📍 {selectedFloor} 施設一覧 ({filteredFacilities.length})
              </h2>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredFacilities.map((facility) => (
                  <button
                    key={facility.id}
                    onClick={() => setSelectedFacility(facility)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedFacility?.id === facility.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium flex items-center">
                          {getCategoryIcon(facility.category)}
                          <span className="ml-2">{facility.name}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getCategoryName(facility.category)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {facility.openTime} - {facility.closeTime}
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        isCurrentlyOpen(facility) ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500">
          <p>駅構内案内システム</p>
          <p className="mt-2">迷わず快適な駅利用を！ 🚉</p>
        </footer>
      </div>
    </div>
  );
};

export default StationGuide;