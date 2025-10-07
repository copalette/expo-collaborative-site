import React, { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  duration: number; // 分単位
  priority: 'critical' | 'high' | 'medium' | 'low';
  completed: boolean;
  startTime?: string;
  category: string;
}

interface DaySchedule {
  date: string;
  dayName: string;
  wakeUpTime: string;
  recommendedWakeUp: string;
  tasks: Task[];
  notes: string;
}

const ExpoFinal: React.FC = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    {
      date: '2025-01-08',
      dayName: '水曜日',
      wakeUpTime: '06:00',
      recommendedWakeUp: '05:30',
      notes: '',
      tasks: [
        { id: '1-1', title: '最終プレゼン資料の確認', duration: 120, priority: 'critical', completed: false, startTime: '09:00', category: 'プレゼン' },
        { id: '1-2', title: '会場設営の最終チェック', duration: 90, priority: 'high', completed: false, startTime: '13:00', category: '設営' },
        { id: '1-3', title: '関係者への連絡事項まとめ', duration: 60, priority: 'medium', completed: false, startTime: '15:00', category: '連絡' },
      ]
    },
    {
      date: '2025-01-09',
      dayName: '木曜日',
      wakeUpTime: '06:00',
      recommendedWakeUp: '05:45',
      notes: '',
      tasks: [
        { id: '2-1', title: 'デモンストレーションのリハーサル', duration: 180, priority: 'critical', completed: false, startTime: '10:00', category: 'リハーサル' },
        { id: '2-2', title: '機材の動作確認', duration: 60, priority: 'high', completed: false, startTime: '14:00', category: '機材' },
        { id: '2-3', title: '明日の段取り確認', duration: 45, priority: 'medium', completed: false, startTime: '16:00', category: '準備' },
      ]
    },
    {
      date: '2025-01-10',
      dayName: '金曜日',
      wakeUpTime: '05:30',
      recommendedWakeUp: '05:00',
      notes: '重要な発表日',
      tasks: [
        { id: '3-1', title: '本番プレゼンテーション', duration: 120, priority: 'critical', completed: false, startTime: '10:00', category: 'プレゼン' },
        { id: '3-2', title: 'VIP対応', duration: 90, priority: 'critical', completed: false, startTime: '13:00', category: '接客' },
        { id: '3-3', title: 'メディア対応', duration: 60, priority: 'high', completed: false, startTime: '15:00', category: 'メディア' },
      ]
    },
    {
      date: '2025-01-11',
      dayName: '土曜日',
      wakeUpTime: '06:00',
      recommendedWakeUp: '06:00',
      notes: '週末対応',
      tasks: [
        { id: '4-1', title: '一般公開デモ', duration: 240, priority: 'high', completed: false, startTime: '10:00', category: 'デモ' },
        { id: '4-2', title: '来場者アンケート収集', duration: 120, priority: 'medium', completed: false, startTime: '14:00', category: 'フィードバック' },
      ]
    },
    {
      date: '2025-01-12',
      dayName: '日曜日',
      wakeUpTime: '07:00',
      recommendedWakeUp: '07:00',
      notes: '休息日（軽作業のみ）',
      tasks: [
        { id: '5-1', title: '週次レポート作成', duration: 90, priority: 'low', completed: false, startTime: '10:00', category: 'レポート' },
        { id: '5-2', title: '来週の準備', duration: 60, priority: 'low', completed: false, startTime: '14:00', category: '準備' },
      ]
    },
    {
      date: '2025-01-13',
      dayName: '月曜日',
      wakeUpTime: '06:00',
      recommendedWakeUp: '05:30',
      notes: '最終週スタート',
      tasks: [
        { id: '6-1', title: '撤収計画の確認', duration: 120, priority: 'high', completed: false, startTime: '09:00', category: '撤収' },
        { id: '6-2', title: '引き継ぎ資料作成', duration: 180, priority: 'high', completed: false, startTime: '13:00', category: 'ドキュメント' },
      ]
    },
    {
      date: '2025-01-14',
      dayName: '火曜日',
      wakeUpTime: '06:00',
      recommendedWakeUp: '06:00',
      notes: '',
      tasks: [
        { id: '7-1', title: '最終展示の準備', duration: 150, priority: 'high', completed: false, startTime: '09:00', category: '展示' },
        { id: '7-2', title: '関係者への感謝状準備', duration: 90, priority: 'medium', completed: false, startTime: '14:00', category: '事務' },
      ]
    },
    {
      date: '2025-01-15',
      dayName: '水曜日',
      wakeUpTime: '05:30',
      recommendedWakeUp: '05:00',
      notes: '最終日前日',
      tasks: [
        { id: '8-1', title: 'クロージングセレモニー準備', duration: 180, priority: 'critical', completed: false, startTime: '09:00', category: 'セレモニー' },
        { id: '8-2', title: '最終チェックリスト確認', duration: 120, priority: 'critical', completed: false, startTime: '14:00', category: 'チェック' },
      ]
    },
    {
      date: '2025-01-16',
      dayName: '木曜日',
      wakeUpTime: '05:00',
      recommendedWakeUp: '04:30',
      notes: '万博最終日！',
      tasks: [
        { id: '9-1', title: 'クロージングセレモニー', duration: 180, priority: 'critical', completed: false, startTime: '10:00', category: 'セレモニー' },
        { id: '9-2', title: '撤収作業', duration: 240, priority: 'high', completed: false, startTime: '14:00', category: '撤収' },
        { id: '9-3', title: '打ち上げ', duration: 180, priority: 'low', completed: false, startTime: '19:00', category: 'イベント' },
      ]
    }
  ]);

  const [selectedDate, setSelectedDate] = useState<string>('2025-01-08');
  const [newTask, setNewTask] = useState({ title: '', duration: 30, priority: 'medium' as Task['priority'], category: '' });

  useEffect(() => {
    const saved = localStorage.getItem('expo-final-schedule');
    if (saved) {
      setSchedule(JSON.parse(saved));
    }
  }, []);

  const saveToStorage = (data: DaySchedule[]) => {
    localStorage.setItem('expo-final-schedule', JSON.stringify(data));
  };

  const toggleTask = (dateStr: string, taskId: string) => {
    const updated = schedule.map(day => {
      if (day.date === dateStr) {
        return {
          ...day,
          tasks: day.tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      }
      return day;
    });
    setSchedule(updated);
    saveToStorage(updated);
  };

  const calculateOptimalWakeTime = (day: DaySchedule): string => {
    if (day.tasks.length === 0) return '07:00';
    
    const earliestTask = day.tasks.reduce((earliest, task) => {
      if (!task.startTime) return earliest;
      return !earliest || task.startTime < earliest ? task.startTime : earliest;
    }, '');

    if (!earliestTask) return '07:00';

    // 準備時間を考慮（90分前に起床を推奨）
    const [hours, minutes] = earliestTask.split(':').map(Number);
    let wakeHour = hours - 1;
    let wakeMinute = minutes - 30;
    
    if (wakeMinute < 0) {
      wakeMinute += 60;
      wakeHour -= 1;
    }
    
    if (wakeHour < 5) wakeHour = 5; // 最早5時起床
    
    return `${String(wakeHour).padStart(2, '0')}:${String(wakeMinute).padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const calculateDailyProgress = (day: DaySchedule) => {
    if (day.tasks.length === 0) return 0;
    const completed = day.tasks.filter(t => t.completed).length;
    return Math.round((completed / day.tasks.length) * 100);
  };

  const calculateTotalWorkTime = (tasks: Task[]) => {
    const total = tasks.reduce((sum, task) => sum + task.duration, 0);
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return `${hours}時間${minutes}分`;
  };

  const currentDay = schedule.find(d => d.date === selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎪 万博ラストウィーク
          </h1>
          <p className="text-xl text-gray-600">
            1/8 〜 1/16 最後の1週間を完璧に仕上げる
          </p>
        </header>

        {/* 日付選択タブ */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {schedule.map((day) => (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`px-4 py-3 rounded-lg transition-all ${
                  selectedDate === day.date 
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-orange-100'
                }`}
              >
                <div className="font-bold">{formatDate(day.date)}</div>
                <div className="text-xs">{day.dayName}</div>
                <div className="text-xs mt-1">
                  {calculateDailyProgress(day)}%
                </div>
              </button>
            ))}
          </div>
        </div>

        {currentDay && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 左側：起床時間と統計 */}
            <div className="lg:col-span-1 space-y-4">
              {/* 起床時間カード */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">⏰ 起床時間</h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">推奨起床時間</div>
                    <div className="text-3xl font-bold text-orange-600">
                      {calculateOptimalWakeTime(currentDay)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">現在の設定</div>
                    <input
                      type="time"
                      value={currentDay.wakeUpTime}
                      onChange={(e) => {
                        const updated = schedule.map(d => 
                          d.date === selectedDate 
                            ? { ...d, wakeUpTime: e.target.value }
                            : d
                        );
                        setSchedule(updated);
                        saveToStorage(updated);
                      }}
                      className="text-2xl font-bold text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* 統計カード */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">📊 本日の統計</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">タスク数</span>
                    <span className="font-bold">{currentDay.tasks.length}件</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">総作業時間</span>
                    <span className="font-bold">{calculateTotalWorkTime(currentDay.tasks)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">完了率</span>
                    <span className="font-bold text-orange-600">
                      {calculateDailyProgress(currentDay)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-orange-600 h-3 rounded-full transition-all"
                      style={{ width: `${calculateDailyProgress(currentDay)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* メモ */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">📝 メモ</h2>
                <textarea
                  value={currentDay.notes}
                  onChange={(e) => {
                    const updated = schedule.map(d => 
                      d.date === selectedDate 
                        ? { ...d, notes: e.target.value }
                        : d
                    );
                    setSchedule(updated);
                    saveToStorage(updated);
                  }}
                  className="w-full p-3 border rounded-md"
                  rows={4}
                  placeholder="この日の注意事項など..."
                />
              </div>
            </div>

            {/* 右側：タイムライン */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">📅 タイムライン</h2>
                
                {/* タスクリスト */}
                <div className="space-y-3">
                  {currentDay.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`border-2 rounded-lg p-4 ${getPriorityColor(task.priority)} ${
                        task.completed ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(currentDay.date, task.id)}
                          className="mt-1 mr-3 h-5 w-5"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                                {task.title}
                              </div>
                              <div className="flex gap-3 mt-2 text-sm">
                                {task.startTime && (
                                  <span className="flex items-center">
                                    🕐 {task.startTime}
                                  </span>
                                )}
                                <span className="flex items-center">
                                  ⏱️ {task.duration}分
                                </span>
                                <span className="bg-white px-2 py-1 rounded">
                                  {task.category}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs font-bold uppercase">
                              {task.priority === 'critical' && '最重要'}
                              {task.priority === 'high' && '重要'}
                              {task.priority === 'medium' && '中'}
                              {task.priority === 'low' && '低'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* タスク追加フォーム */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold mb-3">タスクを追加</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="タスク名"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="カテゴリ"
                      value={newTask.category}
                      onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="number"
                      placeholder="所要時間（分）"
                      value={newTask.duration}
                      onChange={(e) => setNewTask({...newTask, duration: Number(e.target.value)})}
                      className="px-3 py-2 border rounded"
                    />
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                      className="px-3 py-2 border rounded"
                    >
                      <option value="critical">最重要</option>
                      <option value="high">重要</option>
                      <option value="medium">中</option>
                      <option value="low">低</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      if (newTask.title) {
                        const updated = schedule.map(d => {
                          if (d.date === selectedDate) {
                            return {
                              ...d,
                              tasks: [...d.tasks, {
                                id: `${Date.now()}`,
                                title: newTask.title,
                                duration: newTask.duration,
                                priority: newTask.priority,
                                category: newTask.category,
                                completed: false
                              }]
                            };
                          }
                          return d;
                        });
                        setSchedule(updated);
                        saveToStorage(updated);
                        setNewTask({ title: '', duration: 30, priority: 'medium', category: '' });
                      }
                    }}
                    className="mt-3 w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-12 text-center text-gray-500">
          <p>万博ラストウィーク管理システム</p>
          <p className="mt-2">最後まで全力で！ 💪</p>
        </footer>
      </div>
    </div>
  );
};

export default ExpoFinal;