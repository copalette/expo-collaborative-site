import React, { useState, useEffect } from 'react';

interface LapTime {
  lap: number;
  time: number;
  timestamp: string;
}

interface WalkingSession {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  totalLaps: number;
  totalTime: number;
  totalSteps: number;
  totalCalories: number;
  lapTimes: LapTime[];
  notes: string;
}

interface UserProfile {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  stepLength: number;
}

const ExpoRingCounter: React.FC = () => {
  const [laps, setLaps] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);
  const [currentSession, setCurrentSession] = useState<WalkingSession | null>(null);
  const [sessions, setSessions] = useState<WalkingSession[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    weight: 60,
    height: 165,
    age: 30,
    gender: 'female',
    stepLength: 65,
  });
  const [showProfile, setShowProfile] = useState(false);
  const [notes, setNotes] = useState('');

  // 大屋根リングの仕様
  const RING_CIRCUMFERENCE = 2000; // 2km（実際の大屋根リングの外周）
  const STEPS_PER_KM = Math.round(1000 / (userProfile.stepLength / 100)); // 歩幅から1kmあたりの歩数を計算

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    loadSessions();
    loadUserProfile();
  }, []);

  const loadSessions = () => {
    const saved = localStorage.getItem('expo-ring-sessions');
    if (saved) {
      setSessions(JSON.parse(saved));
    }
  };

  const loadUserProfile = () => {
    const saved = localStorage.getItem('expo-ring-profile');
    if (saved) {
      setUserProfile(JSON.parse(saved));
    }
  };

  const saveSessions = (newSessions: WalkingSession[]) => {
    localStorage.setItem('expo-ring-sessions', JSON.stringify(newSessions));
    setSessions(newSessions);
  };

  const saveUserProfile = (profile: UserProfile) => {
    localStorage.setItem('expo-ring-profile', JSON.stringify(profile));
    setUserProfile(profile);
  };

  const startWalking = () => {
    const newSession: WalkingSession = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('ja-JP'),
      startTime: new Date().toLocaleTimeString('ja-JP'),
      totalLaps: 0,
      totalTime: 0,
      totalSteps: 0,
      totalCalories: 0,
      lapTimes: [],
      notes: '',
    };
    setCurrentSession(newSession);
    setIsActive(true);
    setTime(0);
    setLaps(0);
    setLapTimes([]);
    setNotes('');
  };

  const stopWalking = () => {
    if (currentSession) {
      const finalSession: WalkingSession = {
        ...currentSession,
        endTime: new Date().toLocaleTimeString('ja-JP'),
        totalLaps: laps,
        totalTime: time,
        totalSteps: calculateSteps(),
        totalCalories: calculateCalories(),
        lapTimes,
        notes,
      };
      
      const updatedSessions = [finalSession, ...sessions];
      saveSessions(updatedSessions);
      setCurrentSession(null);
    }
    setIsActive(false);
  };

  const addLap = () => {
    const newLap = laps + 1;
    const lapTime: LapTime = {
      lap: newLap,
      time: time,
      timestamp: new Date().toISOString(),
    };
    
    setLaps(newLap);
    setLapTimes([...lapTimes, lapTime]);
  };

  const resetCounter = () => {
    setIsActive(false);
    setTime(0);
    setLaps(0);
    setLapTimes([]);
    setCurrentSession(null);
    setNotes('');
  };

  const calculateDistance = () => {
    return (laps * RING_CIRCUMFERENCE) / 1000; // km
  };

  const calculateSteps = () => {
    const distance = calculateDistance();
    return Math.round(distance * STEPS_PER_KM);
  };

  const calculateCalories = () => {
    // METs値: ウォーキング（平地、4.0km/h）= 3.0
    const mets = 3.0;
    const timeInHours = time / 3600;
    const calories = mets * userProfile.weight * timeInHours;
    return Math.round(calories);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getLapTime = (lapIndex: number) => {
    if (lapIndex === 0) return lapTimes[0]?.time || 0;
    return (lapTimes[lapIndex]?.time || 0) - (lapTimes[lapIndex - 1]?.time || 0);
  };

  const getAverageLapTime = () => {
    if (lapTimes.length === 0) return 0;
    return Math.round(time / lapTimes.length);
  };

  const getCurrentPace = () => {
    if (time === 0 || laps === 0) return 0;
    const avgLapTime = getAverageLapTime();
    const pacePerKm = (avgLapTime / (RING_CIRCUMFERENCE / 1000)) / 60; // 分/km
    return pacePerKm;
  };

  const getTotalStats = () => {
    const totalSessions = sessions.length;
    const totalLaps = sessions.reduce((sum, session) => sum + session.totalLaps, 0);
    const totalDistance = (totalLaps * RING_CIRCUMFERENCE) / 1000;
    const totalTime = sessions.reduce((sum, session) => sum + session.totalTime, 0);
    const totalCalories = sessions.reduce((sum, session) => sum + session.totalCalories, 0);
    
    return {
      totalSessions,
      totalLaps,
      totalDistance,
      totalTime,
      totalCalories,
    };
  };

  const totalStats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎪 大屋根リング周回カウンター
          </h1>
          <p className="text-xl text-gray-600">
            万博会場の大屋根リングを何周したかをカウント
          </p>
          <div className="mt-4 text-lg text-orange-700">
            1周 = {RING_CIRCUMFERENCE}m（外周）
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* メインカウンター */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-8">
                <div className="text-8xl font-bold text-orange-600 mb-4">
                  {laps}
                </div>
                <div className="text-2xl text-gray-700">周</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatTime(time)}</div>
                  <div className="text-sm text-gray-600">経過時間</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{calculateDistance().toFixed(2)}</div>
                  <div className="text-sm text-gray-600">距離 (km)</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{calculateSteps().toLocaleString()}</div>
                  <div className="text-sm text-gray-600">歩数</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{calculateCalories()}</div>
                  <div className="text-sm text-gray-600">消費カロリー</div>
                </div>
              </div>

              {/* ペース情報 */}
              {laps > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">
                      {formatTime(getAverageLapTime())}
                    </div>
                    <div className="text-sm text-gray-600">平均ラップタイム</div>
                  </div>
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <div className="text-xl font-bold text-cyan-600">
                      {getCurrentPace().toFixed(1)} 分/km
                    </div>
                    <div className="text-sm text-gray-600">現在のペース</div>
                  </div>
                </div>
              )}

              {/* コントロールボタン */}
              <div className="flex justify-center gap-4">
                {!isActive ? (
                  <button
                    onClick={startWalking}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-xl font-bold transition-colors"
                  >
                    🚶‍♂️ 歩行開始
                  </button>
                ) : (
                  <>
                    <button
                      onClick={addLap}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-full text-lg font-bold transition-colors"
                    >
                      ➕ 1周完了
                    </button>
                    <button
                      onClick={stopWalking}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-full text-lg font-bold transition-colors"
                    >
                      ⏹️ 終了
                    </button>
                  </>
                )}
                <button
                  onClick={resetCounter}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-full text-lg font-bold transition-colors"
                >
                  🔄 リセット
                </button>
              </div>

              {/* メモ入力 */}
              {isActive && (
                <div className="mt-6">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="今日のウォーキングメモ..."
                    className="w-full p-3 border rounded-lg"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* ラップタイム */}
            {lapTimes.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                <h2 className="text-2xl font-bold mb-4">⏱️ ラップタイム</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {lapTimes.map((lap, index) => (
                    <div key={lap.lap} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">第{lap.lap}周</span>
                      <div className="text-right">
                        <div className="font-bold">{formatTime(getLapTime(index))}</div>
                        <div className="text-sm text-gray-500">通算: {formatTime(lap.time)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 総合統計 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">📊 総合統計</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">総セッション数</span>
                  <span className="font-bold">{totalStats.totalSessions}回</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">総周回数</span>
                  <span className="font-bold">{totalStats.totalLaps}周</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">総距離</span>
                  <span className="font-bold">{totalStats.totalDistance.toFixed(1)}km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">総時間</span>
                  <span className="font-bold">{formatTime(totalStats.totalTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">総消費カロリー</span>
                  <span className="font-bold">{totalStats.totalCalories}kcal</span>
                </div>
              </div>
            </div>

            {/* ユーザープロフィール */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">👤 プロフィール</h2>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {showProfile ? '閉じる' : '編集'}
                </button>
              </div>
              
              {showProfile ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600">体重 (kg)</label>
                    <input
                      type="number"
                      value={userProfile.weight}
                      onChange={(e) => setUserProfile({...userProfile, weight: Number(e.target.value)})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">身長 (cm)</label>
                    <input
                      type="number"
                      value={userProfile.height}
                      onChange={(e) => setUserProfile({...userProfile, height: Number(e.target.value)})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">年齢</label>
                    <input
                      type="number"
                      value={userProfile.age}
                      onChange={(e) => setUserProfile({...userProfile, age: Number(e.target.value)})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">歩幅 (cm)</label>
                    <input
                      type="number"
                      value={userProfile.stepLength}
                      onChange={(e) => setUserProfile({...userProfile, stepLength: Number(e.target.value)})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <button
                    onClick={() => {
                      saveUserProfile(userProfile);
                      setShowProfile(false);
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    保存
                  </button>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div>体重: {userProfile.weight}kg</div>
                  <div>身長: {userProfile.height}cm</div>
                  <div>年齢: {userProfile.age}歳</div>
                  <div>歩幅: {userProfile.stepLength}cm</div>
                </div>
              )}
            </div>

            {/* 最近のセッション */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">📅 最近のセッション</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">{session.date}</div>
                    <div className="text-sm text-gray-600">
                      {session.totalLaps}周 • {formatTime(session.totalTime)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {session.totalCalories}kcal
                    </div>
                    {session.notes && (
                      <div className="text-xs text-gray-500 mt-1">{session.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500">
          <p>大屋根リング周回カウンター</p>
          <p className="mt-2">健康的な万博観光を！ 🚶‍♂️</p>
        </footer>
      </div>
    </div>
  );
};

export default ExpoRingCounter;