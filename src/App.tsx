/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VotingBooth from './pages/VotingBooth';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import IntroScreen from './components/IntroScreen';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          {showIntro ? (
            <IntroScreen onComplete={() => setShowIntro(false)} />
          ) : (
            <motion.div
              key="main-app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200 selection:bg-orange-500 selection:text-white relative overflow-hidden"
            >
              {/* Subtle background mesh/gradient */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-400/10 dark:bg-orange-500/5 blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-400/10 dark:bg-green-500/5 blur-3xl"></div>
              </div>

              <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/vote" element={<VotingBooth />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Routes>
                </main>
                <footer className="bg-green-800 dark:bg-green-900 text-white py-6 text-center border-t border-green-700 dark:border-green-800 transition-colors duration-200">
                  <p>&copy; 2026 Election Commission of India. All rights reserved.</p>
                </footer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}
