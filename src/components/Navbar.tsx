import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Vote, User, LogOut, Moon, Sun, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangOpen(false);
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`sticky top-0 z-40 transition-all duration-300 border-t-4 border-orange-500 ${
        scrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md py-2' 
          : 'bg-white dark:bg-gray-800 shadow-sm py-3'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 300 }}>
              <Vote className="h-8 w-8 text-orange-500 group-hover:text-orange-600 transition-colors" />
            </motion.div>
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-green-600 dark:from-orange-400 dark:to-green-400 tracking-tight">
              {t('app_name')}
            </span>
          </Link>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Language Toggle */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 font-medium p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Globe className="h-5 w-5" />
                <span className="uppercase hidden sm:inline">{i18n.language.split('-')[0]}</span>
              </button>
              
              {langOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-32 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl py-2 z-50 border border-gray-100 dark:border-gray-700"
                >
                  <button
                    onClick={() => changeLanguage('en')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('hi')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    हिंदी
                  </button>
                  <button
                    onClick={() => changeLanguage('ta')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    தமிழ்
                  </button>
                </motion.div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              aria-label="Toggle theme"
            >
              <motion.div whileTap={{ scale: 0.9, rotate: 180 }} transition={{ duration: 0.3 }}>
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </motion.div>
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>

            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 font-medium hidden sm:block transition-colors">
                    {t('admin_dashboard')}
                  </Link>
                ) : (
                  <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 font-medium hidden sm:block transition-colors">
                    {t('my_dashboard')}
                  </Link>
                )}
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/80 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                  <User className="h-4 w-4" />
                  <span className="font-semibold text-sm">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title={t('logout')}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">{t('logout')}</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 font-medium px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {t('register_btn')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
