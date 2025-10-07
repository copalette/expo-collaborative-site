import React, { useState, useEffect } from 'react';

interface Company {
  id: string;
  name: string;
  status: 'interested' | 'applied' | 'interview' | 'offer' | 'rejected' | 'declined';
  excitement: number; // 1-5
  notes: string;
  interviewDate?: string;
  emoji: string;
}

interface HandoverTask {
  id: string;
  task: string;
  completed: boolean;
  assignee: string;
  deadline: string;
  category: string;
}

interface FunActivity {
  id: string;
  activity: string;
  completed: boolean;
  emoji: string;
  category: 'experience' | 'network' | 'travel' | 'skill';
}

const JobHunting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'journey' | 'handover' | 'fun'>('journey');
  const [companies, setCompanies] = useState<Company[]>([
    { id: '1', name: 'テック株式会社', status: 'interview', excitement: 5, notes: 'AIの最先端！ワクワク！', interviewDate: '2025-01-15', emoji: '🚀' },
    { id: '2', name: 'クリエイティブ社', status: 'applied', excitement: 4, notes: 'デザイン×テクノロジー', emoji: '🎨' },
    { id: '3', name: 'グローバル商事', status: 'interested', excitement: 3, notes: '海外勤務のチャンス', emoji: '🌍' },
  ]);

  const [handoverTasks, setHandoverTasks] = useState<HandoverTask[]>([
    { id: 'h1', task: '業務マニュアルの作成・更新', completed: false, assignee: '後輩A', deadline: '2025-02-01', category: '文書化' },
    { id: 'h2', task: 'プロジェクト引き継ぎミーティング', completed: false, assignee: 'チーム全体', deadline: '2025-01-20', category: '会議' },
    { id: 'h3', task: 'パスワード・アクセス権限の整理', completed: false, assignee: 'IT部門', deadline: '2025-01-25', category: 'システム' },
    { id: 'h4', task: '顧客リストと対応履歴の共有', completed: false, assignee: '営業チーム', deadline: '2025-01-30', category: '顧客' },
    { id: 'h5', task: '進行中タスクのステータス更新', completed: false, assignee: '各担当者', deadline: '2025-01-15', category: 'タスク' },
    { id: 'h6', task: '最後の感謝の挨拶準備', completed: false, assignee: '自分', deadline: '2025-02-28', category: '感謝' },
  ]);

  const [funActivities, setFunActivities] = useState<FunActivity[]>([
    { id: 'f1', activity: '憧れの企業のオフィス見学ツアー', completed: false, emoji: '🏢', category: 'experience' },
    { id: 'f2', activity: 'OB/OG訪問で人生の先輩と語る', completed: false, emoji: '☕', category: 'network' },
    { id: 'f3', activity: '地方の面接ついでに観光', completed: false, emoji: '🗾', category: 'travel' },
    { id: 'f4', activity: '業界研究会で新しい友達作り', completed: false, emoji: '👥', category: 'network' },
    { id: 'f5', activity: '面接練習を友達とゲーム化', completed: false, emoji: '🎮', category: 'skill' },
    { id: 'f6', activity: 'LinkedIn映え写真撮影会', completed: false, emoji: '📸', category: 'skill' },
    { id: 'f7', activity: '企業の無料セミナーで最新技術を学ぶ', completed: false, emoji: '💡', category: 'skill' },
    { id: 'f8', activity: '内定祝いパーティーの企画', completed: false, emoji: '🎉', category: 'experience' },
    { id: 'f9', activity: '就活仲間とストレス発散カラオケ', completed: false, emoji: '🎤', category: 'experience' },
    { id: 'f10', activity: '面接帰りの美味しいランチ開拓', completed: false, emoji: '🍜', category: 'travel' },
  ]);

  // ローカルストレージ
  useEffect(() => {
    const savedCompanies = localStorage.getItem('job-hunting-companies');
    const savedHandover = localStorage.getItem('job-hunting-handover');
    const savedFun = localStorage.getItem('job-hunting-fun');
    
    if (savedCompanies) setCompanies(JSON.parse(savedCompanies));
    if (savedHandover) setHandoverTasks(JSON.parse(savedHandover));
    if (savedFun) setFunActivities(JSON.parse(savedFun));
  }, []);

  const saveToStorage = () => {
    localStorage.setItem('job-hunting-companies', JSON.stringify(companies));
    localStorage.setItem('job-hunting-handover', JSON.stringify(handoverTasks));
    localStorage.setItem('job-hunting-fun', JSON.stringify(funActivities));
  };

  useEffect(() => {
    saveToStorage();
  }, [companies, handoverTasks, funActivities]);

  const getStatusColor = (status: Company['status']) => {
    const colors = {
      interested: 'bg-blue-100 text-blue-800',
      applied: 'bg-yellow-100 text-yellow-800',
      interview: 'bg-purple-100 text-purple-800',
      offer: 'bg-green-100 text-green-800',
      rejected: 'bg-gray-100 text-gray-800',
      declined: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const getStatusText = (status: Company['status']) => {
    const texts = {
      interested: '興味あり',
      applied: '応募済み',
      interview: '面接予定',
      offer: '内定！',
      rejected: 'ご縁なし',
      declined: '辞退',
    };
    return texts[status];
  };

  const toggleHandoverTask = (id: string) => {
    setHandoverTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const toggleFunActivity = (id: string) => {
    setFunActivities(prev => prev.map(activity => 
      activity.id === id ? { ...activity, completed: !activity.completed } : activity
    ));
  };

  const handoverProgress = Math.round((handoverTasks.filter(t => t.completed).length / handoverTasks.length) * 100);
  const funProgress = Math.round((funActivities.filter(a => a.completed).length / funActivities.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🎯 ハッピー就活ジャーニー 🚀
          </h1>
          <p className="text-xl text-gray-600">
            楽しみながら、きちんと引き継いで、最高の次のステップへ！
          </p>
        </header>

        {/* タブナビゲーション */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full shadow-lg p-1">
            <button
              onClick={() => setActiveTab('journey')}
              className={`px-6 py-3 rounded-full font-bold transition-all ${
                activeTab === 'journey' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🎯 就活ジャーニー
            </button>
            <button
              onClick={() => setActiveTab('handover')}
              className={`px-6 py-3 rounded-full font-bold transition-all ${
                activeTab === 'handover' 
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🤝 引き継ぎ準備
            </button>
            <button
              onClick={() => setActiveTab('fun')}
              className={`px-6 py-3 rounded-full font-bold transition-all ${
                activeTab === 'fun' 
                  ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🎉 楽しむリスト
            </button>
          </div>
        </div>

        {/* 就活ジャーニー */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-4xl">{company.emoji}</div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(company.status)}`}>
                      {getStatusText(company.status)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{company.name}</h3>
                  <div className="mb-3">
                    <div className="text-yellow-400 text-xl">
                      {'⭐'.repeat(company.excitement)}
                    </div>
                    <div className="text-sm text-gray-500">ワクワク度</div>
                  </div>
                  <p className="text-gray-600 mb-3">{company.notes}</p>
                  {company.interviewDate && (
                    <div className="text-sm bg-purple-50 text-purple-700 rounded-lg px-3 py-2">
                      📅 面接: {company.interviewDate}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 統計 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">📊 現在の状況</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {companies.filter(c => c.status === 'interested').length}
                  </div>
                  <div className="text-gray-600">検討中</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    {companies.filter(c => ['applied', 'interview'].includes(c.status)).length}
                  </div>
                  <div className="text-gray-600">選考中</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {companies.filter(c => c.status === 'offer').length}
                  </div>
                  <div className="text-gray-600">内定</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 引き継ぎ準備 */}
        {activeTab === 'handover' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">🤝 引き継ぎタスク</h2>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{handoverProgress}%</div>
                  <div className="text-sm text-gray-500">完了</div>
                </div>
              </div>
              
              <div className="mb-4 bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all"
                  style={{ width: `${handoverProgress}%` }}
                />
              </div>

              <div className="space-y-3">
                {handoverTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`border-2 rounded-lg p-4 ${
                      task.completed 
                        ? 'bg-gray-50 border-gray-300' 
                        : 'bg-white border-blue-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleHandoverTask(task.id)}
                        className="mt-1 mr-3 h-5 w-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                          {task.task}
                        </div>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-blue-600">👤 {task.assignee}</span>
                          <span className="text-red-600">📅 {task.deadline}</span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            {task.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-3">💡 引き継ぎのコツ</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✅ 早めに始めることで、余裕を持って対応できます</li>
                <li>✅ ドキュメント化することで、後任者が困りません</li>
                <li>✅ 感謝の気持ちを忘れずに伝えましょう</li>
                <li>✅ 最後まで責任を持って、気持ちよく送り出してもらいましょう</li>
              </ul>
            </div>
          </div>
        )}

        {/* 楽しむリスト */}
        {activeTab === 'fun' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">🎉 就活を楽しむアクティビティ</h2>
                <div className="text-right">
                  <div className="text-3xl font-bold text-pink-600">{funProgress}%</div>
                  <div className="text-sm text-gray-500">達成</div>
                </div>
              </div>

              <div className="mb-4 bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-pink-400 to-orange-500 h-4 rounded-full transition-all"
                  style={{ width: `${funProgress}%` }}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {funActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`border-2 rounded-xl p-4 transform hover:scale-105 transition-all ${
                      activity.completed 
                        ? 'bg-gray-50 border-gray-300' 
                        : 'bg-gradient-to-r from-pink-50 to-orange-50 border-pink-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={activity.completed}
                        onChange={() => toggleFunActivity(activity.id)}
                        className="mr-3 h-5 w-5 text-pink-600 rounded focus:ring-pink-500"
                      />
                      <div className="text-3xl mr-3">{activity.emoji}</div>
                      <div className={`flex-1 font-medium ${
                        activity.completed ? 'line-through text-gray-400' : ''
                      }`}>
                        {activity.activity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-100 to-green-100 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-3">🌟 就活を楽しむマインドセット</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-green-700 mb-2">✨ ポジティブに考える</h4>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• 新しい出会いのチャンス</li>
                    <li>• 自分を知る機会</li>
                    <li>• 成長できる経験</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-blue-700 mb-2">🎯 楽しむ工夫</h4>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• 面接後のご褒美を決める</li>
                    <li>• 就活仲間と情報交換</li>
                    <li>• 新しい場所を探検</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-12 text-center text-gray-500">
          <p className="text-lg">前向きに、楽しく、責任を持って 🌈</p>
          <p className="mt-2">最高の就活ジャーニーを！</p>
        </footer>
      </div>
    </div>
  );
};

export default JobHunting;