import React, { useEffect, useState } from 'react';
import contributionsData from '../data/contributions.json';

interface Contribution {
  timestamp: string;
  contributor: string;
  type: string;
  summary: string;
  description: string;
  files: string[];
  commit: string | null;
}

const ContributionHistory: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);

  useEffect(() => {
    // 実際の実装では、APIやWebSocketで最新のcontributions.jsonを取得
    setContributions(contributionsData.contributions);
  }, []);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      feat: 'bg-green-100 text-green-800',
      fix: 'bg-red-100 text-red-800',
      docs: 'bg-blue-100 text-blue-800',
      style: 'bg-purple-100 text-purple-800',
      refactor: 'bg-yellow-100 text-yellow-800',
      test: 'bg-orange-100 text-orange-800',
      chore: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">開発履歴</h2>
      <div className="space-y-4">
        {contributions.slice(0, 10).map((contribution, index) => (
          <div
            key={index}
            className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                    contribution.type
                  )}`}
                >
                  {contribution.type}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {contribution.contributor}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(contribution.timestamp)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {contribution.summary}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{contribution.description}</p>
            <div className="flex flex-wrap gap-2">
              {contribution.files.slice(0, 3).map((file, fileIndex) => (
                <span
                  key={fileIndex}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {file}
                </span>
              ))}
              {contribution.files.length > 3 && (
                <span className="text-xs text-gray-500">
                  他{contribution.files.length - 3}件
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          合計 {contributionsData.metadata.totalContributions} 件の貢献
        </p>
      </div>
    </div>
  );
};

export default ContributionHistory;