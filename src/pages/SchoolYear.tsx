import React, { useState } from 'react';

interface Event {
  id: string;
  name: string;
  emoji: string;
  date: string;
  type: 'event' | 'test' | 'vacation' | 'ceremony';
  description: string;
  excitement: number; // 1-5 楽しさレベル
}

interface Month {
  month: number;
  name: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  events: Event[];
}

const SchoolYear: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(4);
  
  const schoolYear: Month[] = [
    {
      month: 4,
      name: '4月',
      season: 'spring',
      events: [
        { id: '4-1', name: '入学式・始業式', emoji: '🌸', date: '4月8日', type: 'ceremony', description: '新しい友達との出会い！ワクワクの新学期スタート！', excitement: 5 },
        { id: '4-2', name: '健康診断', emoji: '🏥', date: '4月15日', type: 'event', description: '身長どれだけ伸びたかな？', excitement: 2 },
        { id: '4-3', name: '授業参観', emoji: '👨‍👩‍👧', date: '4月25日', type: 'event', description: 'お父さんお母さんが学校に来る日', excitement: 3 },
      ]
    },
    {
      month: 5,
      name: '5月',
      season: 'spring',
      events: [
        { id: '5-1', name: 'ゴールデンウィーク', emoji: '🎌', date: '5月1日〜5日', type: 'vacation', description: '長〜いお休み！家族でお出かけしよう！', excitement: 5 },
        { id: '5-2', name: '春の遠足', emoji: '🎒', date: '5月20日', type: 'event', description: 'お弁当持って、みんなで楽しい遠足！', excitement: 5 },
        { id: '5-3', name: '中間テスト', emoji: '📝', date: '5月27日〜29日', type: 'test', description: '初めての大きなテスト。がんばろう！', excitement: 1 },
      ]
    },
    {
      month: 6,
      name: '6月',
      season: 'summer',
      events: [
        { id: '6-1', name: '体育祭', emoji: '🏃‍♂️', date: '6月10日', type: 'event', description: '赤組？白組？みんなで力を合わせて優勝だ！', excitement: 5 },
        { id: '6-2', name: 'プール開き', emoji: '🏊‍♀️', date: '6月15日', type: 'event', description: '待ちに待ったプール！水泳の授業スタート！', excitement: 5 },
        { id: '6-3', name: '修学旅行（6年生）', emoji: '✈️', date: '6月20日〜22日', type: 'event', description: '一生の思い出！友達と最高の旅行！', excitement: 5 },
      ]
    },
    {
      month: 7,
      name: '7月',
      season: 'summer',
      events: [
        { id: '7-1', name: '期末テスト', emoji: '📚', date: '7月1日〜3日', type: 'test', description: '夏休み前の最後の頑張り！', excitement: 1 },
        { id: '7-2', name: '七夕', emoji: '🎋', date: '7月7日', type: 'event', description: '願い事を短冊に書こう！', excitement: 4 },
        { id: '7-3', name: '終業式・夏休みスタート', emoji: '🌻', date: '7月20日', type: 'ceremony', description: 'やったー！夏休みだ！宿題も忘れずに！', excitement: 5 },
      ]
    },
    {
      month: 8,
      name: '8月',
      season: 'summer',
      events: [
        { id: '8-1', name: '夏休み', emoji: '🏖️', date: '8月いっぱい', type: 'vacation', description: '海！山！花火！最高の夏を楽しもう！', excitement: 5 },
        { id: '8-2', name: '夏祭り', emoji: '🎆', date: '8月15日', type: 'event', description: '浴衣を着て、屋台で遊ぼう！', excitement: 5 },
        { id: '8-3', name: '宿題ラストスパート', emoji: '😅', date: '8月25日〜', type: 'event', description: 'まだ終わってない...急げ〜！', excitement: 1 },
      ]
    },
    {
      month: 9,
      name: '9月',
      season: 'autumn',
      events: [
        { id: '9-1', name: '始業式', emoji: '🎒', date: '9月1日', type: 'ceremony', description: '2学期スタート！友達に会える！', excitement: 4 },
        { id: '9-2', name: '防災訓練', emoji: '🚨', date: '9月10日', type: 'event', description: '地震や火事から身を守る練習', excitement: 2 },
        { id: '9-3', name: '秋分の日', emoji: '🍂', date: '9月23日', type: 'vacation', description: 'お休みだ！秋を感じよう', excitement: 3 },
      ]
    },
    {
      month: 10,
      name: '10月',
      season: 'autumn',
      events: [
        { id: '10-1', name: '文化祭', emoji: '🎭', date: '10月15日〜16日', type: 'event', description: 'クラスの出し物！劇？合唱？お化け屋敷？', excitement: 5 },
        { id: '10-2', name: 'ハロウィン', emoji: '🎃', date: '10月31日', type: 'event', description: 'トリック・オア・トリート！仮装して楽しもう！', excitement: 5 },
        { id: '10-3', name: '中間テスト', emoji: '📖', date: '10月25日〜27日', type: 'test', description: '文化祭の後はテスト...切り替えて頑張ろう！', excitement: 1 },
      ]
    },
    {
      month: 11,
      name: '11月',
      season: 'autumn',
      events: [
        { id: '11-1', name: '音楽会', emoji: '🎵', date: '11月10日', type: 'event', description: 'みんなで心を一つに歌おう！演奏しよう！', excitement: 4 },
        { id: '11-2', name: '秋の遠足', emoji: '🍁', date: '11月20日', type: 'event', description: '紅葉がきれい！秋を満喫！', excitement: 4 },
        { id: '11-3', name: '勤労感謝の日', emoji: '🙏', date: '11月23日', type: 'vacation', description: '働く人に感謝！お父さんお母さんありがとう！', excitement: 3 },
      ]
    },
    {
      month: 12,
      name: '12月',
      season: 'winter',
      events: [
        { id: '12-1', name: '期末テスト', emoji: '✏️', date: '12月1日〜3日', type: 'test', description: '今年最後のテスト！頑張るぞ！', excitement: 1 },
        { id: '12-2', name: 'クリスマス会', emoji: '🎄', date: '12月20日', type: 'event', description: 'サンタさん来るかな？プレゼント交換！', excitement: 5 },
        { id: '12-3', name: '終業式・冬休みスタート', emoji: '⛄', date: '12月25日', type: 'ceremony', description: 'メリークリスマス！冬休みだ！', excitement: 5 },
      ]
    },
    {
      month: 1,
      name: '1月',
      season: 'winter',
      events: [
        { id: '1-1', name: 'お正月', emoji: '🎍', date: '1月1日〜3日', type: 'vacation', description: 'あけましておめでとう！お年玉もらえる！', excitement: 5 },
        { id: '1-2', name: '始業式', emoji: '📚', date: '1月8日', type: 'ceremony', description: '3学期スタート！今年も頑張ろう！', excitement: 3 },
        { id: '1-3', name: '書き初め大会', emoji: '🖌️', date: '1月15日', type: 'event', description: '今年の目標を筆で書こう！', excitement: 3 },
      ]
    },
    {
      month: 2,
      name: '2月',
      season: 'winter',
      events: [
        { id: '2-1', name: '節分', emoji: '👹', date: '2月3日', type: 'event', description: '鬼は外！福は内！豆まきだ！', excitement: 4 },
        { id: '2-2', name: 'バレンタインデー', emoji: '🍫', date: '2月14日', type: 'event', description: 'ドキドキ...チョコレートの日！', excitement: 4 },
        { id: '2-3', name: '学年末テスト', emoji: '📝', date: '2月25日〜27日', type: 'test', description: '今年度最後のテスト！ラストスパート！', excitement: 1 },
      ]
    },
    {
      month: 3,
      name: '3月',
      season: 'spring',
      events: [
        { id: '3-1', name: 'ひな祭り', emoji: '🎎', date: '3月3日', type: 'event', description: 'ひなあられ美味しい！女の子の日！', excitement: 3 },
        { id: '3-2', name: '卒業式', emoji: '🎓', date: '3月15日', type: 'ceremony', description: '6年生さようなら...感動の日', excitement: 4 },
        { id: '3-3', name: '修了式・春休み', emoji: '🌷', date: '3月25日', type: 'ceremony', description: '1年間お疲れさま！春休みだ！', excitement: 5 },
      ]
    }
  ];

  const currentMonth = schoolYear.find(m => m.month === selectedMonth);

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'spring': return 'from-pink-300 to-yellow-300';
      case 'summer': return 'from-blue-300 to-cyan-300';
      case 'autumn': return 'from-orange-300 to-red-300';
      case 'winter': return 'from-blue-200 to-purple-300';
      default: return 'from-gray-300 to-gray-400';
    }
  };

  const getEventTypeStyle = (type: string) => {
    switch (type) {
      case 'event': return 'bg-gradient-to-r from-purple-400 to-pink-400 text-white';
      case 'test': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      case 'vacation': return 'bg-gradient-to-r from-green-400 to-blue-400 text-white';
      case 'ceremony': return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white';
      default: return 'bg-gray-200';
    }
  };

  const getExcitementStars = (level: number) => {
    return '⭐'.repeat(level);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentMonth ? getSeasonColor(currentMonth.season) : 'from-gray-100 to-gray-200'} transition-all duration-500`}>
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <header className="text-center mb-8 animate-bounce">
          <h1 className="text-6xl font-bold text-white drop-shadow-lg mb-4">
            🏫 学校の1年間カレンダー 📅
          </h1>
          <p className="text-2xl text-white drop-shadow">
            楽しいイベントがいっぱい！
          </p>
        </header>

        {/* 月選択ボタン */}
        <div className="mb-8 bg-white/90 rounded-3xl p-4 shadow-2xl">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
            {schoolYear.map((month) => (
              <button
                key={month.month}
                onClick={() => setSelectedMonth(month.month)}
                className={`
                  relative p-3 rounded-2xl font-bold text-lg transform transition-all duration-300
                  ${selectedMonth === month.month 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110 shadow-lg animate-pulse' 
                    : 'bg-white hover:scale-105 hover:shadow-md'}
                `}
              >
                <div>{month.name}</div>
                <div className="text-2xl mt-1">
                  {month.events[0]?.emoji}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 選択された月の詳細 */}
        {currentMonth && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 月のタイトル */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 rounded-3xl p-8 shadow-2xl transform hover:scale-[1.02] transition-all">
                <h2 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {currentMonth.name}のイベント
                </h2>
                <div className="text-center text-3xl">
                  {currentMonth.season === 'spring' && '🌸 春 🌸'}
                  {currentMonth.season === 'summer' && '☀️ 夏 ☀️'}
                  {currentMonth.season === 'autumn' && '🍁 秋 🍁'}
                  {currentMonth.season === 'winter' && '❄️ 冬 ❄️'}
                </div>
              </div>
            </div>

            {/* イベントカード */}
            {currentMonth.events.map((event, index) => (
              <div
                key={event.id}
                className="transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`${getEventTypeStyle(event.type)} rounded-3xl p-6 shadow-2xl border-4 border-white`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-5xl animate-bounce">{event.emoji}</div>
                    <div className="text-right">
                      <div className="text-yellow-200 text-xl">
                        {getExcitementStars(event.excitement)}
                      </div>
                      <div className="text-white/80 text-sm">楽しさレベル</div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{event.name}</h3>
                  <div className="text-lg mb-3 opacity-90">📅 {event.date}</div>
                  <p className="text-base leading-relaxed">
                    {event.description}
                  </p>

                  {/* イベントタイプバッジ */}
                  <div className="mt-4">
                    <span className="inline-block bg-white/30 rounded-full px-3 py-1 text-sm font-bold">
                      {event.type === 'event' && '🎉 イベント'}
                      {event.type === 'test' && '📝 テスト'}
                      {event.type === 'vacation' && '🏖️ お休み'}
                      {event.type === 'ceremony' && '🎊 式典'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* フッター */}
        <footer className="mt-12 text-center">
          <div className="bg-white/90 rounded-3xl p-6 shadow-2xl inline-block">
            <p className="text-2xl font-bold text-purple-600">
              みんなで楽しい1年にしよう！ 🎒✨
            </p>
            <div className="mt-4 text-4xl animate-pulse">
              🌈 💫 🎨 🎮 ⚽ 🎵 📚 🍀
            </div>
          </div>
        </footer>
      </div>

      {/* 浮遊する装飾 */}
      <div className="fixed top-20 left-10 text-6xl animate-bounce opacity-50">🎈</div>
      <div className="fixed top-40 right-20 text-5xl animate-pulse opacity-50">✨</div>
      <div className="fixed bottom-20 left-20 text-6xl animate-bounce opacity-50">🌟</div>
      <div className="fixed bottom-40 right-10 text-5xl animate-pulse opacity-50">🎉</div>
    </div>
  );
};

export default SchoolYear;