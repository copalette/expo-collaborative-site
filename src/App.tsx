import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  return (
    <Router>
      <nav className="fixed top-0 right-0 p-4 z-50">
        <div className="flex gap-4">
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            About
          </Link>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;