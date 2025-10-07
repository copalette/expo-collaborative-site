import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 flex items-center justify-center overflow-hidden">
      <div className="relative">
        <h1 className="text-9xl md:text-[12rem] lg:text-[16rem] xl:text-[20rem] font-bold text-white animate-bounce drop-shadow-2xl">
          ?
        </h1>
        {/* 周りの装飾 */}
        <div className="absolute -top-10 -left-10 text-6xl animate-wiggle">✨</div>
        <div className="absolute -top-10 -right-10 text-6xl animate-float">🌟</div>
        <div className="absolute -bottom-10 -left-10 text-6xl animate-pulse">💫</div>
        <div className="absolute -bottom-10 -right-10 text-6xl animate-bounce">⭐</div>
      </div>
      
      {/* 背景の装飾 */}
      <div className="fixed top-10 left-10 text-8xl opacity-30 animate-float">🎈</div>
      <div className="fixed top-20 right-20 text-7xl opacity-30 animate-bounce">🎉</div>
      <div className="fixed bottom-20 left-20 text-8xl opacity-30 animate-pulse">🌈</div>
      <div className="fixed bottom-10 right-10 text-7xl opacity-30 animate-wiggle">🎨</div>
    </div>
  );
};

export default Home;