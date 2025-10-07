import React, { useState, useEffect } from 'react';

interface Attendee {
  id: string;
  name: string;
  email: string;
  status: 'attending' | 'not_attending' | 'maybe';
  message: string;
  submittedAt: string;
}

const Reunion: React.FC = () => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'attending' as Attendee['status'],
    message: ''
  });

  // ローカルストレージからデータを読み込み
  useEffect(() => {
    const saved = localStorage.getItem('reunion-attendees');
    if (saved) {
      setAttendees(JSON.parse(saved));
    }
  }, []);

  // ローカルストレージにデータを保存
  const saveToStorage = (data: Attendee[]) => {
    localStorage.setItem('reunion-attendees', JSON.stringify(data));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('お名前とメールアドレスは必須です');
      return;
    }

    const newAttendee: Attendee = {
      id: Date.now().toString(),
      ...formData,
      submittedAt: new Date().toISOString()
    };

    const updatedAttendees = [...attendees, newAttendee];
    setAttendees(updatedAttendees);
    saveToStorage(updatedAttendees);

    // フォームをリセット
    setFormData({
      name: '',
      email: '',
      status: 'attending',
      message: ''
    });

    alert('出欠のご回答ありがとうございました！');
  };

  const getStatusColor = (status: Attendee['status']) => {
    switch (status) {
      case 'attending':
        return 'bg-green-100 text-green-800';
      case 'not_attending':
        return 'bg-red-100 text-red-800';
      case 'maybe':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Attendee['status']) => {
    switch (status) {
      case 'attending':
        return '参加';
      case 'not_attending':
        return '不参加';
      case 'maybe':
        return '未定';
      default:
        return status;
    }
  };

  const attendingCount = attendees.filter(a => a.status === 'attending').length;
  const notAttendingCount = attendees.filter(a => a.status === 'not_attending').length;
  const maybeCount = attendees.filter(a => a.status === 'maybe').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎓 同窓会のご案内
          </h1>
          <p className="text-xl text-gray-600">
            皆様のご参加をお待ちしております
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 出欠フォーム */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">出欠のご回答</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="山田太郎"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="yamada@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  出欠
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as Attendee['status']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="attending">参加</option>
                  <option value="not_attending">不参加</option>
                  <option value="maybe">未定</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メッセージ（任意）
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="何かメッセージがあればお書きください"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors font-medium"
              >
                出欠を送信
              </button>
            </form>
          </div>

          {/* 参加状況 */}
          <div className="space-y-6">
            {/* 統計 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">参加状況</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{attendingCount}</div>
                  <div className="text-sm text-gray-600">参加</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{notAttendingCount}</div>
                  <div className="text-sm text-gray-600">不参加</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{maybeCount}</div>
                  <div className="text-sm text-gray-600">未定</div>
                </div>
              </div>
            </div>

            {/* 参加者リスト */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">回答者一覧</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {attendees.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">まだ回答がありません</p>
                ) : (
                  attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-gray-900">{attendee.name}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(attendee.status)}`}>
                          {getStatusText(attendee.status)}
                        </span>
                      </div>
                      {attendee.message && (
                        <p className="text-sm text-gray-600 mb-2">{attendee.message}</p>
                      )}
                      <div className="text-xs text-gray-400">
                        {new Date(attendee.submittedAt).toLocaleString('ja-JP')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500">
          <p>同窓会出欠管理システム</p>
          <p className="mt-2">Powered by Expo 2025 Collaborative Platform</p>
        </footer>
      </div>
    </div>
  );
};

export default Reunion;