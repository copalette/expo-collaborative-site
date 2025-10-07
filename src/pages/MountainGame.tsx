import React, { useState, useEffect } from 'react';

interface GameState {
  stamina: number;
  altitude: number;
  weather: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'storm';
  equipment: {
    boots: boolean;
    jacket: boolean;
    backpack: boolean;
    rope: boolean;
    oxygen: boolean;
  };
  inventory: {
    water: number;
    food: number;
    medicine: number;
  };
  experience: number;
  isClimbing: boolean;
  gameStatus: 'preparing' | 'climbing' | 'summit' | 'failed' | 'rescued';
  eventLog: string[];
  currentRoute: 'easy' | 'medium' | 'hard' | 'expert';
  maxAltitude: number;
}

interface Route {
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  targetAltitude: number;
  description: string;
  staminaCost: number;
  requiredEquipment: string[];
}

const MountainGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    stamina: 100,
    altitude: 0,
    weather: 'sunny',
    equipment: {
      boots: false,
      jacket: false,
      backpack: false,
      rope: false,
      oxygen: false,
    },
    inventory: {
      water: 3,
      food: 3,
      medicine: 1,
    },
    experience: 0,
    isClimbing: false,
    gameStatus: 'preparing',
    eventLog: ['🏔️ 登山の準備を開始しました。装備を整えて出発しましょう！'],
    currentRoute: 'easy',
    maxAltitude: 0,
  });

  const routes: Route[] = [
    {
      name: '初心者コース',
      difficulty: 'easy',
      targetAltitude: 1000,
      description: '初心者向けの低山ハイキング。装備は最小限でOK。',
      staminaCost: 10,
      requiredEquipment: ['boots'],
    },
    {
      name: '中級者コース',
      difficulty: 'medium',
      targetAltitude: 2500,
      description: '本格的な登山。しっかりとした装備が必要。',
      staminaCost: 20,
      requiredEquipment: ['boots', 'jacket', 'backpack'],
    },
    {
      name: '上級者コース',
      difficulty: 'hard',
      targetAltitude: 4000,
      description: '高山病のリスクあり。万全の装備と経験が必要。',
      staminaCost: 30,
      requiredEquipment: ['boots', 'jacket', 'backpack', 'rope'],
    },
    {
      name: 'エキスパートコース',
      difficulty: 'expert',
      targetAltitude: 6000,
      description: '極限の挑戦。酸素ボンベ必須の高峰登山。',
      staminaCost: 40,
      requiredEquipment: ['boots', 'jacket', 'backpack', 'rope', 'oxygen'],
    },
  ];

  const weatherConditions = {
    sunny: { name: '晴れ', staminaMultiplier: 1.0, emoji: '☀️' },
    cloudy: { name: '曇り', staminaMultiplier: 1.1, emoji: '☁️' },
    rainy: { name: '雨', staminaMultiplier: 1.3, emoji: '🌧️' },
    snowy: { name: '雪', staminaMultiplier: 1.5, emoji: '❄️' },
    storm: { name: '嵐', staminaMultiplier: 2.0, emoji: '⛈️' },
  };

  useEffect(() => {
    if (gameState.isClimbing) {
      const interval = setInterval(() => {
        handleRandomEvent();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [gameState.isClimbing]);

  const purchaseEquipment = (equipment: keyof GameState['equipment']) => {
    if (gameState.gameStatus !== 'preparing') return;
    
    setGameState(prev => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [equipment]: true,
      },
      eventLog: [...prev.eventLog, `🛒 ${getEquipmentName(equipment)}を購入しました。`],
    }));
  };

  const getEquipmentName = (equipment: keyof GameState['equipment']) => {
    const names = {
      boots: '登山靴',
      jacket: 'レインジャケット',
      backpack: 'リュックサック',
      rope: 'ロープ',
      oxygen: '酸素ボンベ',
    };
    return names[equipment];
  };

  const startClimbing = (route: Route) => {
    const missingEquipment = route.requiredEquipment.filter(
      eq => !gameState.equipment[eq as keyof GameState['equipment']]
    );

    if (missingEquipment.length > 0) {
      setGameState(prev => ({
        ...prev,
        eventLog: [...prev.eventLog, `⚠️ 必要な装備が不足しています: ${missingEquipment.map(eq => getEquipmentName(eq as keyof GameState['equipment'])).join(', ')}`],
      }));
      return;
    }

    setGameState(prev => ({
      ...prev,
      isClimbing: true,
      gameStatus: 'climbing',
      currentRoute: route.difficulty,
      eventLog: [...prev.eventLog, `🚀 ${route.name}での登山を開始しました！`],
    }));
  };

  const climbStep = () => {
    if (gameState.stamina <= 0) {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'failed',
        isClimbing: false,
        eventLog: [...prev.eventLog, '💀 体力が尽きて登山に失敗しました...'],
      }));
      return;
    }

    const route = routes.find(r => r.difficulty === gameState.currentRoute)!;
    const weather = weatherConditions[gameState.weather];
    const staminaCost = Math.round(route.staminaCost * weather.staminaMultiplier);
    const altitudeGain = Math.random() * 100 + 50;

    const newAltitude = gameState.altitude + altitudeGain;
    const newStamina = Math.max(0, gameState.stamina - staminaCost);

    if (newAltitude >= route.targetAltitude) {
      setGameState(prev => ({
        ...prev,
        altitude: route.targetAltitude,
        stamina: newStamina,
        gameStatus: 'summit',
        isClimbing: false,
        experience: prev.experience + route.targetAltitude / 10,
        maxAltitude: Math.max(prev.maxAltitude, route.targetAltitude),
        eventLog: [...prev.eventLog, `🏆 頂上到達！おめでとうございます！標高${route.targetAltitude}mを制覇しました！`],
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        altitude: newAltitude,
        stamina: newStamina,
        eventLog: [...prev.eventLog, `⛰️ 標高${Math.round(newAltitude)}mまで登りました。体力-${staminaCost}`],
      }));
    }
  };

  const handleRandomEvent = () => {
    const events = [
      {
        condition: () => Math.random() < 0.3,
        action: () => {
          const newWeather = ['sunny', 'cloudy', 'rainy', 'snowy', 'storm'][Math.floor(Math.random() * 5)] as GameState['weather'];
          setGameState(prev => ({
            ...prev,
            weather: newWeather,
            eventLog: [...prev.eventLog, `🌤️ 天候が${weatherConditions[newWeather].name}に変わりました。`],
          }));
        },
      },
      {
        condition: () => Math.random() < 0.2,
        action: () => {
          setGameState(prev => ({
            ...prev,
            inventory: {
              ...prev.inventory,
              water: Math.max(0, prev.inventory.water - 1),
            },
            eventLog: [...prev.eventLog, '💧 水を1つ消費しました。'],
          }));
        },
      },
      {
        condition: () => Math.random() < 0.15,
        action: () => {
          const damage = Math.round(Math.random() * 20 + 10);
          setGameState(prev => ({
            ...prev,
            stamina: Math.max(0, prev.stamina - damage),
            eventLog: [...prev.eventLog, `🪨 落石に遭遇！体力が${damage}減少しました。`],
          }));
        },
      },
      {
        condition: () => Math.random() < 0.1,
        action: () => {
          const recovery = Math.round(Math.random() * 15 + 5);
          setGameState(prev => ({
            ...prev,
            stamina: Math.min(100, prev.stamina + recovery),
            eventLog: [...prev.eventLog, `🏞️ 美しい景色に癒されました！体力が${recovery}回復。`],
          }));
        },
      },
    ];

    events.forEach(event => {
      if (event.condition()) {
        event.action();
      }
    });
  };

  const consumeItem = (item: keyof GameState['inventory']) => {
    if (gameState.inventory[item] <= 0) return;

    const effects = {
      water: { stamina: 10, message: '💧 水を飲んで体力を10回復しました。' },
      food: { stamina: 20, message: '🍙 食事をして体力を20回復しました。' },
      medicine: { stamina: 30, message: '💊 薬を使って体力を30回復しました。' },
    };

    const effect = effects[item];
    setGameState(prev => ({
      ...prev,
      stamina: Math.min(100, prev.stamina + effect.stamina),
      inventory: {
        ...prev.inventory,
        [item]: prev.inventory[item] - 1,
      },
      eventLog: [...prev.eventLog, effect.message],
    }));
  };

  const resetGame = () => {
    setGameState({
      stamina: 100,
      altitude: 0,
      weather: 'sunny',
      equipment: {
        boots: false,
        jacket: false,
        backpack: false,
        rope: false,
        oxygen: false,
      },
      inventory: {
        water: 3,
        food: 3,
        medicine: 1,
      },
      experience: gameState.experience,
      isClimbing: false,
      gameStatus: 'preparing',
      eventLog: ['🏔️ 新しい登山の準備を開始しました。'],
      currentRoute: 'easy',
      maxAltitude: gameState.maxAltitude,
    });
  };

  const rescueClimber = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'rescued',
      isClimbing: false,
      stamina: 50,
      eventLog: [...prev.eventLog, '🚁 救助隊に助けられました。基地まで戻りました。'],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-stone-600 to-emerald-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            ⛰️ 登山シミュレーター
          </h1>
          <p className="text-xl text-emerald-200">
            装備を整えて、様々な山に挑戦しよう！
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ステータス */}
          <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">📊 ステータス</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-white mb-1">
                  <span>体力</span>
                  <span>{gameState.stamina}/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      gameState.stamina > 60 ? 'bg-green-500' :
                      gameState.stamina > 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${gameState.stamina}%` }}
                  />
                </div>
              </div>

              <div className="text-white">
                <p><span className="text-blue-300">現在の標高:</span> {Math.round(gameState.altitude)}m</p>
                <p><span className="text-purple-300">最高到達点:</span> {gameState.maxAltitude}m</p>
                <p><span className="text-yellow-300">経験値:</span> {Math.round(gameState.experience)}</p>
                <p><span className="text-cyan-300">天候:</span> {weatherConditions[gameState.weather].emoji} {weatherConditions[gameState.weather].name}</p>
              </div>

              <div>
                <h3 className="text-white font-bold mb-2">🎒 アイテム</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => consumeItem('water')}
                    disabled={gameState.inventory.water <= 0}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-2 rounded text-sm"
                  >
                    💧 水 ({gameState.inventory.water})
                  </button>
                  <button
                    onClick={() => consumeItem('food')}
                    disabled={gameState.inventory.food <= 0}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white p-2 rounded text-sm"
                  >
                    🍙 食料 ({gameState.inventory.food})
                  </button>
                  <button
                    onClick={() => consumeItem('medicine')}
                    disabled={gameState.inventory.medicine <= 0}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white p-2 rounded text-sm"
                  >
                    💊 薬 ({gameState.inventory.medicine})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ゲーム画面 */}
          <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">🎮 ゲーム画面</h2>

            {gameState.gameStatus === 'preparing' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-bold mb-2">🛒 装備購入</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(gameState.equipment).map(([key, owned]) => (
                      <button
                        key={key}
                        onClick={() => purchaseEquipment(key as keyof GameState['equipment'])}
                        disabled={owned}
                        className={`p-2 rounded text-sm font-medium ${
                          owned 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                        }`}
                      >
                        {owned ? '✅' : '🛒'} {getEquipmentName(key as keyof GameState['equipment'])}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">🏔️ ルート選択</h3>
                  <div className="space-y-2">
                    {routes.map((route) => (
                      <button
                        key={route.difficulty}
                        onClick={() => startClimbing(route)}
                        className="w-full p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-left"
                      >
                        <div className="font-bold">{route.name}</div>
                        <div className="text-sm opacity-80">{route.description}</div>
                        <div className="text-xs">目標: {route.targetAltitude}m</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {gameState.gameStatus === 'climbing' && (
              <div className="space-y-4">
                <div className="text-white text-center">
                  <p className="text-xl mb-2">🧗‍♂️ 登山中...</p>
                  <p>目標まで: {Math.round(routes.find(r => r.difficulty === gameState.currentRoute)!.targetAltitude - gameState.altitude)}m</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={climbStep}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-bold"
                  >
                    ⬆️ 登る
                  </button>
                  <button
                    onClick={rescueClimber}
                    className="bg-red-600 hover:bg-red-700 text-white p-3 rounded"
                  >
                    🚁 救助要請
                  </button>
                </div>
              </div>
            )}

            {(gameState.gameStatus === 'summit' || gameState.gameStatus === 'failed' || gameState.gameStatus === 'rescued') && (
              <div className="text-center space-y-4">
                {gameState.gameStatus === 'summit' && (
                  <div className="text-white">
                    <p className="text-3xl mb-2">🏆</p>
                    <p className="text-xl font-bold">登頂成功！</p>
                    <p>経験値+{Math.round(routes.find(r => r.difficulty === gameState.currentRoute)!.targetAltitude / 10)}</p>
                  </div>
                )}
                {gameState.gameStatus === 'failed' && (
                  <div className="text-white">
                    <p className="text-3xl mb-2">💀</p>
                    <p className="text-xl font-bold">登山失敗...</p>
                    <p>体力が尽きました</p>
                  </div>
                )}
                {gameState.gameStatus === 'rescued' && (
                  <div className="text-white">
                    <p className="text-3xl mb-2">🚁</p>
                    <p className="text-xl font-bold">救助されました</p>
                    <p>無事に帰還</p>
                  </div>
                )}
                <button
                  onClick={resetGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold"
                >
                  🔄 新しい登山を開始
                </button>
              </div>
            )}
          </div>

          {/* イベントログ */}
          <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">📝 イベントログ</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {gameState.eventLog.slice(-10).map((log, index) => (
                <div key={index} className="text-sm text-gray-200 p-2 bg-black bg-opacity-30 rounded">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-emerald-200">
          <p>登山シミュレーター</p>
          <p className="mt-2">安全第一で山を楽しもう！ ⛰️</p>
        </footer>
      </div>
    </div>
  );
};

export default MountainGame;