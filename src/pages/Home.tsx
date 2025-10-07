import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-stone-600 to-emerald-800 flex flex-col items-center justify-center overflow-hidden relative">
      {/* 山のシルエット背景 */}
      <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-gray-800 to-transparent opacity-60" style={{clipPath: "polygon(0 100%, 15% 60%, 35% 80%, 50% 40%, 65% 70%, 80% 30%, 100% 50%, 100% 100%)"}}></div>
      
      {/* メインコンテンツ */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white drop-shadow-2xl mb-4">
            ⛰️ SUMMIT
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-emerald-200 drop-shadow-lg">
            登山家のための協働制作サイト
          </h2>
        </div>
        
        {/* 概要セクション */}
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-8 mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-amber-300 mb-6 flex items-center justify-center">
            🏔️ ミッション：万博2025への登頂計画
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-stone-800 bg-opacity-50 p-4 rounded-lg">
              <h4 className="text-lg font-bold text-green-300 mb-2 flex items-center">
                🧗‍♂️ ベースキャンプ設営
              </h4>
              <p className="text-gray-200 text-sm">
                AIツールと人間の協働による
                開発基盤の構築。
                チーム編成と装備確認。
              </p>
            </div>
            <div className="bg-stone-800 bg-opacity-50 p-4 rounded-lg">
              <h4 className="text-lg font-bold text-blue-300 mb-2 flex items-center">
                🎯 ルート開拓
              </h4>
              <p className="text-gray-200 text-sm">
                万博向けデモサイトの
                段階的な開発。
                各チェックポイントでの進捗記録。
              </p>
            </div>
            <div className="bg-stone-800 bg-opacity-50 p-4 rounded-lg">
              <h4 className="text-lg font-bold text-orange-300 mb-2 flex items-center">
                🏆 サミット到達
              </h4>
              <p className="text-gray-200 text-sm">
                万博2025での成果発表。
                登頂記録の共有と
                次の山への準備。
              </p>
            </div>
          </div>
        </div>
        
        {/* アクションボタン */}
        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg">
            🚀 登山開始
          </button>
          <button className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg">
            📋 装備確認
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg">
            🗺️ ルート確認
          </button>
        </div>
      </div>
      
      {/* 山岳背景装飾 */}
      <div className="fixed top-10 left-10 text-6xl opacity-40 animate-float">🦅</div>
      <div className="fixed top-20 right-20 text-5xl opacity-40 animate-bounce">❄️</div>
      <div className="fixed bottom-40 left-20 text-6xl opacity-30 animate-pulse">🌲</div>
      <div className="fixed bottom-20 right-10 text-5xl opacity-30 animate-wiggle">🏕️</div>
      <div className="fixed top-1/2 left-5 text-4xl opacity-25 animate-float">🥾</div>
      <div className="fixed top-1/3 right-5 text-4xl opacity-25 animate-bounce">⛰️</div>
    </div>
  );
};

export default Home;