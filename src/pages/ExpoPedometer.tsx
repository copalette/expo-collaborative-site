import React, { useCallback, useEffect, useMemo, useState } from 'react';

type Intensity = 'easy' | 'moderate' | 'vigorous';

type ManualEntry = {
  id: string;
  timestamp: string;
  steps: number;
  context: string;
};

type SavedSession = {
  id: string;
  startIso: string;
  endIso: string;
  steps: number;
  durationMinutes: number;
  tempo: number;
  intensity: Intensity;
  area: string;
  label: string;
};

type DailyRecord = {
  date: string;
  steps: number;
  activeMinutes: number;
  sessions: SavedSession[];
  manualAdds: ManualEntry[];
};

type PedometerSettings = {
  nickname: string;
  dailyTarget: number;
  stepLengthCm: number;
  weightKg: number;
};

type ActiveSession = {
  id: string;
  startIso: string;
  tempo: number;
  intensity: Intensity;
  area: string;
  label: string;
  elapsedSeconds: number;
  accumulatedSteps: number;
  loggedSteps: number;
  isPaused: boolean;
};

const STORAGE_KEYS = {
  records: 'expo-pedometer-records',
  settings: 'expo-pedometer-settings',
};

const intensityMeta: Record<Intensity, { label: string; description: string; color: string; tempoRange: [number, number] }> = {
  easy: { label: 'ゆったり', description: '会場散策やグループ移動に合わせたペース', color: 'from-emerald-400/70 to-teal-500/70', tempoRange: [90, 110] },
  moderate: { label: 'しっかり', description: '目的地までスムーズに移動したい時向け', color: 'from-sky-400/70 to-indigo-500/70', tempoRange: [110, 135] },
  vigorous: { label: 'アクティブ', description: '思い切り歩いてリズムを作りたい時', color: 'from-rose-400/70 to-purple-500/70', tempoRange: [135, 165] },
};

const areaOptions = [
  { value: 'main-ring', label: '大屋根リング' },
  { value: 'tech-zone', label: 'テクノロジーゾーン' },
  { value: 'north-garden', label: '北ゾーンガーデン' },
  { value: 'waterfront', label: '水辺エリア' },
  { value: 'pavilion-loop', label: 'パビリオン巡り' },
];

const getToday = () => new Date().toISOString().split('T')[0];

const defaultSettings: PedometerSettings = {
  nickname: 'ゲスト',
  dailyTarget: 8000,
  stepLengthCm: 70,
  weightKg: 60,
};

const ExpoPedometer: React.FC = () => {
  const [settings, setSettings] = useState<PedometerSettings>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    const stored = localStorage.getItem(STORAGE_KEYS.settings);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  });

  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.records);
    return stored ? JSON.parse(stored) : [];
  });

  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [manualSteps, setManualSteps] = useState(500);
  const [manualContext, setManualContext] = useState('パビリオンの移動');

  const today = getToday();

  const applyStepIncrement = useCallback((steps: number) => {
    if (steps <= 0) return;
    setDailyRecords(prev => prev.map(record => {
      if (record.date !== today) return record;
      return {
        ...record,
        steps: record.steps + steps,
      };
    }));
  }, [today]);

  useEffect(() => {
    if (!dailyRecords.some(record => record.date === today)) {
      setDailyRecords(prev => [{
        date: today,
        steps: 0,
        activeMinutes: 0,
        sessions: [],
        manualAdds: [],
      }, ...prev]);
    }
  }, [dailyRecords, today]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(dailyRecords));
  }, [dailyRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!activeSession || activeSession.isPaused) return;

    const interval = setInterval(() => {
      setActiveSession(prev => {
        if (!prev || prev.isPaused) return prev;

        const stepsPerSecond = prev.tempo / 60;
        const nextAccumulated = prev.accumulatedSteps + stepsPerSecond;
        const nextElapsed = prev.elapsedSeconds + 1;
        const totalStepsInt = Math.floor(nextAccumulated);
        const increment = totalStepsInt - prev.loggedSteps;

        if (increment > 0) {
          applyStepIncrement(increment);
        }

        return {
          ...prev,
          accumulatedSteps: nextAccumulated,
          elapsedSeconds: nextElapsed,
          loggedSteps: prev.loggedSteps + Math.max(increment, 0),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, applyStepIncrement]);

  const todayRecord = useMemo(() => {
    return dailyRecords.find(record => record.date === today) ?? {
      date: today,
      steps: 0,
      activeMinutes: 0,
      sessions: [],
      manualAdds: [],
    };
  }, [dailyRecords, today]);

  const weeklyRecords = useMemo(() => {
    const sorted = [...dailyRecords].sort((a, b) => b.date.localeCompare(a.date));
    return sorted.slice(0, 7).reverse();
  }, [dailyRecords]);

  const streak = useMemo(() => {
    const sorted = [...dailyRecords].sort((a, b) => b.date.localeCompare(a.date));
    let count = 0;
    for (const record of sorted) {
      const meetsTarget = record.steps >= settings.dailyTarget;
      if (meetsTarget) {
        count += 1;
      } else {
        if (record.date !== today) break;
        break;
      }
    }
    return count;
  }, [dailyRecords, settings.dailyTarget, today]);

  const completion = Math.min(100, Math.round((todayRecord.steps / settings.dailyTarget) * 100 || 0));
  const distanceKm = (todayRecord.steps * settings.stepLengthCm) / 100000;
  const calories = Math.round(todayRecord.steps * 0.04 * (settings.weightKg / 60));

  const addManualSteps = () => {
    if (!Number.isFinite(manualSteps) || manualSteps <= 0) return;
    const stepsToAdd = Math.round(manualSteps);
    setDailyRecords(prev => prev.map(record => {
      if (record.date !== today) return record;
      return {
        ...record,
        steps: record.steps + stepsToAdd,
        manualAdds: [{
          id: Date.now().toString(),
          steps: stepsToAdd,
          context: manualContext,
          timestamp: new Date().toISOString(),
        }, ...record.manualAdds],
      };
    }));
    setManualContext('パビリオンの移動');
  };

  const updateSettings = (partial: Partial<PedometerSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const startSession = () => {
    const sessionId = Date.now().toString();
    setActiveSession({
      id: sessionId,
      startIso: new Date().toISOString(),
      tempo: 120,
      intensity: 'moderate',
      area: areaOptions[0].value,
      label: '大屋根ウォーク',
      elapsedSeconds: 0,
      accumulatedSteps: 0,
      loggedSteps: 0,
      isPaused: false,
    });
  };

  const finalizeSession = (keepData: boolean) => {
    if (!activeSession) return;
    const durationMinutes = Math.max(1, Math.round(activeSession.elapsedSeconds / 60));
    const stepsLogged = activeSession.loggedSteps;

    if (keepData && stepsLogged > 0) {
      setDailyRecords(prev => prev.map(record => {
        if (record.date !== today) return record;
        return {
          ...record,
          activeMinutes: record.activeMinutes + durationMinutes,
          sessions: [{
            id: activeSession.id,
            startIso: activeSession.startIso,
            endIso: new Date().toISOString(),
            steps: stepsLogged,
            durationMinutes,
            tempo: activeSession.tempo,
            intensity: activeSession.intensity,
            area: activeSession.area,
            label: activeSession.label,
          }, ...record.sessions],
        };
      }));
    }

    if (!keepData && stepsLogged > 0) {
      setDailyRecords(prev => prev.map(record => {
        if (record.date !== today) return record;
        return {
          ...record,
          steps: Math.max(0, record.steps - stepsLogged),
        };
      }));
    }

    setActiveSession(null);
  };

  const toggleSessionPause = () => {
    if (!activeSession) return;
    setActiveSession(prev => prev ? { ...prev, isPaused: !prev.isPaused } : prev);
  };

  const updateSession = (partial: Partial<ActiveSession>) => {
    setActiveSession(prev => prev ? { ...prev, ...partial } : prev);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const weeklyTotalSteps = weeklyRecords.reduce((sum, record) => sum + record.steps, 0);
  const weeklyAverageSteps = weeklyRecords.length ? Math.round(weeklyTotalSteps / weeklyRecords.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-100 pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-sky-200"> Expo Step Studio </p>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                歩数計ダッシュボード
              </h1>
              <p className="text-slate-200 leading-relaxed">
                万博会場での移動を可視化してペース配分を最適化。歩数・距離・消費カロリーを日次で追跡し、仲間とシェアできるセッションログも管理します。
              </p>
            </div>
            <div className="bg-gradient-to-br from-sky-500/30 to-indigo-500/30 border border-white/20 rounded-2xl p-6 w-full md:w-80 shadow-lg">
              <p className="text-sm text-sky-100 mb-4">今日の進捗</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-200">歩数</span>
                  <span className="text-2xl font-bold text-white">{todayRecord.steps.toLocaleString()}歩</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-200">目標</span>
                  <span className="text-white">{settings.dailyTarget.toLocaleString()}歩</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500" style={{ width: `${completion}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs text-slate-200">
                  <div>
                    <p className="text-white font-semibold">{completion}%</p>
                    <p className="mt-1 text-[11px]">目標達成率</p>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{distanceKm.toFixed(2)}km</p>
                    <p className="mt-1 text-[11px]">推定距離</p>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{calories}kcal</p>
                    <p className="mt-1 text-[11px]">推定消費</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="bg-white/10 border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">クイック歩数入力</h2>
                <p className="mt-1 text-xs text-slate-300">立ち寄りポイントの移動や休憩後の再開に合わせて調整。</p>
              </div>
              <div className="text-right text-xs text-slate-300">
                <p>今週累計 {weeklyTotalSteps.toLocaleString()}歩</p>
                <p>平均 {weeklyAverageSteps.toLocaleString()}歩/日</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {[200, 500, 800, 1000].map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setManualSteps(value)}
                  className={`px-4 py-2 rounded-full border transition ${manualSteps === value ? 'bg-sky-500/40 border-sky-200 text-white' : 'border-white/20 text-slate-200 hover:border-white/40 hover:bg-white/10'}`}
                >
                  +{value}歩
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                <label className="block text-xs text-slate-300">歩数を入力</label>
                <input
                  type="number"
                  min={1}
                  value={manualSteps}
                  onChange={event => setManualSteps(Number(event.target.value))}
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-sky-300"
                  placeholder="例: 600"
                />
                <label className="block text-xs text-slate-300">メモ</label>
                <input
                  type="text"
                  value={manualContext}
                  onChange={event => setManualContext(event.target.value)}
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-300"
                  placeholder="どこを歩いたか記録"
                />
              </div>
              <div className="flex flex-col gap-3 justify-end">
                <button
                  type="button"
                  onClick={addManualSteps}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 text-sm font-semibold shadow-lg hover:from-sky-400 hover:to-indigo-400 transition"
                >
                  歩数を追加
                </button>
                <button
                  type="button"
                  onClick={() => setManualContext('パビリオンの移動')}
                  className="px-6 py-2 rounded-2xl border border-white/20 text-xs text-slate-200 hover:border-white/40"
                >
                  メモをリセット
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">今日の入力履歴</h3>
              <ul className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {todayRecord.manualAdds.length === 0 && (
                  <li className="text-xs text-slate-400">まだ手動入力はありません。</li>
                )}
                {todayRecord.manualAdds.map(entry => (
                  <li key={entry.id} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-semibold">+{entry.steps.toLocaleString()}歩</p>
                      <p className="mt-1">{entry.context}</p>
                    </div>
                    <time className="text-[11px] text-slate-400">{new Date(entry.timestamp).toLocaleTimeString('ja-JP')}</time>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">ターゲット設定</h3>
                <p className="mt-1 text-xs text-slate-300">歩幅と体重を入れると距離・消費カロリー推定が精度アップ。</p>
              </div>
              <span className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs text-slate-200">現在 {settings.nickname}</span>
            </div>
            <div className="space-y-3">
              <label className="text-xs text-slate-300">ニックネーム</label>
              <input
                type="text"
                value={settings.nickname}
                onChange={event => updateSettings({ nickname: event.target.value })}
                className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300">1日の目標歩数</label>
                <input
                  type="number"
                  min={1000}
                  value={settings.dailyTarget}
                  onChange={event => updateSettings({ dailyTarget: Number(event.target.value) })}
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-300"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">歩幅 (cm)</label>
                <input
                  type="number"
                  min={40}
                  max={120}
                  value={settings.stepLengthCm}
                  onChange={event => updateSettings({ stepLengthCm: Number(event.target.value) })}
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-300"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">体重 (kg)</label>
                <input
                  type="number"
                  min={30}
                  max={120}
                  value={settings.weightKg}
                  onChange={event => updateSettings({ weightKg: Number(event.target.value) })}
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-300"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">達成連続日数</label>
                <div className="mt-3 text-2xl font-bold text-white">{streak}日</div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/8 border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">ライブ歩行セッション</h2>
              <p className="text-xs text-slate-300 mt-1">テンポを設定して自動加算。撮影スポットまでの移動やウォームアップに最適。</p>
            </div>
            {!activeSession && (
              <button
                type="button"
                onClick={startSession}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-500 text-sm font-semibold text-slate-900 shadow-lg hover:from-emerald-300 hover:to-sky-400 transition"
              >
                🚶‍♀️ セッションを開始
              </button>
            )}
          </div>

          {activeSession && (
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="bg-white/10 border border-white/10 rounded-3xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-sky-200">Live Session</p>
                    <h3 className="text-lg font-semibold text-white">{activeSession.label}</h3>
                    <p className="text-xs text-slate-300 mt-1">{new Date(activeSession.startIso).toLocaleTimeString('ja-JP')} 開始</p>
                  </div>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-slate-200">{formatTime(activeSession.elapsedSeconds)}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-slate-200">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-xs text-slate-300">累計</p>
                    <p className="mt-1 text-xl font-semibold text-white">{activeSession.loggedSteps.toLocaleString()}歩</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-xs text-slate-300">テンポ</p>
                    <p className="mt-1 text-xl font-semibold text-white">{activeSession.tempo}歩/分</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-xs text-slate-300">エリア</p>
                    <p className="mt-1 text-sm font-semibold text-white">{areaOptions.find(option => option.value === activeSession.area)?.label ?? '指定なし'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={toggleSessionPause}
                    className={`px-4 py-2 rounded-2xl text-sm font-semibold border border-white/20 transition ${activeSession.isPaused ? 'bg-emerald-400/20 text-white border-emerald-200/40' : 'bg-white/10 text-slate-100 hover:border-white/40'}`}
                  >
                    {activeSession.isPaused ? '再開' : '一時停止'}
                  </button>
                  <button
                    type="button"
                    onClick={() => finalizeSession(true)}
                    className="px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow hover:from-sky-400 hover:to-indigo-400"
                  >
                    セッション完了
                  </button>
                  <button
                    type="button"
                    onClick={() => finalizeSession(false)}
                    className="px-4 py-2 rounded-2xl text-sm font-semibold border border-white/20 text-slate-200 hover:border-rose-300 hover:text-rose-200"
                  >
                    取り消し
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 border border-white/10 rounded-3xl p-5 space-y-4">
                  <label className="text-xs text-slate-300">セッション名</label>
                  <input
                    type="text"
                    value={activeSession.label}
                    onChange={event => updateSession({ label: event.target.value })}
                    className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-300"
                  />

                  <label className="text-xs text-slate-300">歩くエリア</label>
                  <select
                    value={activeSession.area}
                    onChange={event => updateSession({ area: event.target.value })}
                    className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-300"
                  >
                    {areaOptions.map(option => (
                      <option key={option.value} value={option.value} className="text-slate-900">{option.label}</option>
                    ))}
                  </select>

                  <label className="text-xs text-slate-300">テンポ (歩/分)</label>
                  <input
                    type="range"
                    min={80}
                    max={180}
                    step={5}
                    value={activeSession.tempo}
                    onChange={event => updateSession({ tempo: Number(event.target.value) })}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>80</span>
                    <span>{activeSession.tempo}</span>
                    <span>180</span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {(Object.keys(intensityMeta) as Intensity[]).map(level => {
                      const meta = intensityMeta[level];
                      const active = activeSession.intensity === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => updateSession({ intensity: level, tempo: Math.round((meta.tempoRange[0] + meta.tempoRange[1]) / 2) })}
                          className={`rounded-2xl px-4 py-3 text-xs text-left border transition ${active ? 'border-white/60 text-white shadow bg-gradient-to-r ' + meta.color : 'border-white/20 text-slate-200 hover:border-white/40 hover:bg-white/10'}`}
                        >
                          <p className="font-semibold">{meta.label}</p>
                          <p className="mt-1 leading-relaxed">{meta.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!activeSession && (
            <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-200">
              {(Object.keys(intensityMeta) as Intensity[]).map(level => {
                const meta = intensityMeta[level];
                return (
                  <div key={level} className="bg-white/5 border border-white/10 rounded-3xl p-5">
                    <p className="text-xs uppercase tracking-wide text-sky-200">{meta.label}</p>
                    <p className="mt-2 text-sm leading-relaxed">{meta.description}</p>
                    <p className="mt-3 text-xs text-slate-300">推奨テンポ {meta.tempoRange[0]}〜{meta.tempoRange[1]}歩/分</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="bg-white/8 border border-white/10 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white">直近7日間の歩数推移</h2>
            <p className="mt-1 text-xs text-slate-300">達成ラインと比較しながら、混雑日や天候の影響を読み解く。</p>
            <div className="mt-5 space-y-3">
              {weeklyRecords.length === 0 && (
                <p className="text-xs text-slate-300">記録がまだありません。</p>
              )}
              {weeklyRecords.map(record => {
                const percent = Math.min(100, Math.round((record.steps / settings.dailyTarget) * 100 || 0));
                const dateLabel = new Date(record.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' });
                return (
                  <div key={record.date} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>{dateLabel}</span>
                      <span>{record.steps.toLocaleString()}歩</span>
                    </div>
                    <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${percent >= 100 ? 'bg-gradient-to-r from-emerald-400 to-sky-400' : 'bg-gradient-to-r from-slate-400 to-sky-500'}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/8 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">セッションログ</h3>
              <span className="text-xs text-slate-300">今日 {todayRecord.sessions.length}件</span>
            </div>
            <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {todayRecord.sessions.length === 0 && (
                <li className="text-xs text-slate-300">ライブセッションが記録されると表示されます。</li>
              )}
              {todayRecord.sessions.map(session => (
                <li key={session.id} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-slate-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{session.label}</p>
                    <span className="text-[11px] text-slate-400">{new Date(session.startIso).toLocaleTimeString('ja-JP')} - {new Date(session.endIso).toLocaleTimeString('ja-JP')}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-300">
                    <span>歩数 {session.steps.toLocaleString()}歩</span>
                    <span>時間 {session.durationMinutes}分</span>
                    <span>テンポ {session.tempo}歩/分</span>
                    <span>{intensityMeta[session.intensity].label}</span>
                    <span>{areaOptions.find(option => option.value === session.area)?.label ?? session.area}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-white/8 border border-white/10 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white">歩行のヒント</h3>
              <p className="mt-1 text-xs text-slate-300">歩数に応じて次に試したいルートやリカバリーを提案します。</p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs text-slate-200">
              今日の達成感メモ: {completion >= 100 ? '🎉 目標達成！ゆっくり余韻を。' : completion >= 60 ? 'あとひと押しでゴール！夕方の散策を追加。' : '午前・午後で小分けに歩いてリズムを作ろう。'}
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm text-slate-200">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wide text-sky-200">おすすめルート</p>
              <p className="mt-2 leading-relaxed">{completion < 60 ? 'テクノロジーゾーン→北ゾーンの逆時計回りルートで混雑を避けつつ歩数を稼ぎましょう。' : '大屋根リングを時計回りに巡って夜のライトアップを満喫。写真スポット巡りで＋1500歩！'}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wide text-sky-200">体力ケア</p>
              <p className="mt-2 leading-relaxed">{todayRecord.activeMinutes > 60 ? 'クールダウンとして水辺エリアの芝生で10分間のストレッチを。' : '次のセッション前に水分補給と軽い足首回しで疲労を溜めないように。'}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wide text-sky-200">チーム共有</p>
              <p className="mt-2 leading-relaxed">{todayRecord.steps > 9000 ? 'グループチャットで成果を共有して、ナイトショー前の集合時間を再確認。' : '仲間に途中経過を報告して、午後の合流地点と歩行目標を決めましょう。'}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExpoPedometer;
