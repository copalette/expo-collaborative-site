import React from 'react';
import ContributionHistory from '../components/ContributionHistory';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Expo 2025 協働制作サイト
          </h1>
          <p className="text-xl text-gray-600">
            AIと人間が共に創る未来のデモンストレーション
          </p>
        </header>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">プロジェクト概要</h2>
            <p className="text-gray-600 mb-4">
              このサイトは、Claude Code、Codex、その他のAIツールを使用して
              リアルタイムで開発される協働制作プラットフォームです。
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>AI自動開発モード対応</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>開発履歴の自動記録</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>リアルタイム更新</span>
              </div>
            </div>
          </div>
          
          <ContributionHistory />
        </div>
        
        <footer className="mt-12 text-center text-gray-500">
          <p>© 2025 Expo Collaborative Project</p>
          <p className="mt-2">Powered by AI & Human Collaboration</p>
        </footer>
      </div>
    </div>
  );
};

export default About;