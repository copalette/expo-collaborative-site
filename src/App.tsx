import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Reunion from './pages/Reunion';
import LifePlan from './pages/LifePlan';
import ExpoFinal from './pages/ExpoFinal';
import SchoolYear from './pages/SchoolYear';
import JobHunting from './pages/JobHunting';

function App() {
  return (
    <Router>
      <nav className="fixed top-0 right-0 p-4 z-50 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 rounded-bl-3xl shadow-2xl">
        <div className="flex gap-2 flex-wrap">
          <Link 
            to="/" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-yellow-200 shadow-lg"
          >
            🏠 ホーム
          </Link>
          <Link 
            to="/school-year" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-pink-200 shadow-lg"
          >
            📅 学校カレンダー
          </Link>
          <Link 
            to="/about" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-blue-200 shadow-lg"
          >
            ℹ️ このサイト
          </Link>
          <Link 
            to="/reunion" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-green-200 shadow-lg"
          >
            🎓 同窓会
          </Link>
          <Link 
            to="/life-plan" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-purple-200 shadow-lg"
          >
            🌅 人生計画
          </Link>
          <Link 
            to="/expo-final" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-orange-200 shadow-lg"
          >
            🎪 万博
          </Link>
          <Link 
            to="/job-hunting" 
            className="bg-white px-4 py-2 rounded-full text-lg font-bold hover:scale-110 transform transition-all hover:bg-cyan-200 shadow-lg"
          >
            💼 就活
          </Link>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/school-year" element={<SchoolYear />} />
        <Route path="/reunion" element={<Reunion />} />
        <Route path="/life-plan" element={<LifePlan />} />
        <Route path="/expo-final" element={<ExpoFinal />} />
        <Route path="/job-hunting" element={<JobHunting />} />
      </Routes>
    </Router>
  );
}

export default App;