import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { FileText, Search, Download, PhoneCall, MessageSquare, AlertCircle } from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();

  const services = [
    { title: t('search_voter'), icon: <Search className="w-8 h-8 text-orange-500" />, link: '/search' },
    { title: t('download_epic'), icon: <Download className="w-8 h-8 text-green-600 dark:text-green-400" />, link: '/epic' },
    { title: t('book_blo'), icon: <PhoneCall className="w-8 h-8 text-blue-500" />, link: '/blo' },
    { title: t('download_roll'), icon: <FileText className="w-8 h-8 text-purple-500" />, link: '/roll' },
    { title: t('register_complaint'), icon: <AlertCircle className="w-8 h-8 text-red-500" />, link: '/complaint' },
    { title: t('chatbot'), icon: <MessageSquare className="w-8 h-8 text-teal-500" />, link: '/chat' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-orange-100/50 dark:border-gray-700/50 relative overflow-hidden transition-colors duration-200"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-white dark:via-gray-800 to-green-600"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 px-4">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [-5, 5, -5, 5, 0],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="text-6xl md:text-7xl mb-4 inline-block drop-shadow-lg"
          >
            🙏
          </motion.div>
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-gray-800 to-green-600 dark:from-orange-400 dark:via-gray-100 dark:to-green-400 mb-6 drop-shadow-sm"
          >
            {t('home_title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            {t('home_subtitle')}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Link
              to="/register"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-1"
            >
              {t('register_btn')}
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 font-bold rounded-xl border-2 border-orange-500/30 dark:border-orange-400/30 hover:bg-orange-50 dark:hover:bg-gray-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              {t('login_btn')}
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Services Grid */}
      <section>
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-10 text-center tracking-tight"
        >
          {t('services_title')}
        </motion.h2>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Link
                to={service.link}
                className="block bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700/80 hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-500/50 transition-all duration-300 flex items-center space-x-5 group transform hover:-translate-y-1"
              >
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 group-hover:scale-110 transition-all duration-300">
                  {service.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {service.title}
                </h3>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Information Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-3xl p-10 border border-green-200/50 dark:border-green-800/30 transition-colors duration-200 shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-extrabold text-green-800 dark:text-green-400 mb-6">{t('sir_title')}</h2>
          <p className="text-lg text-green-700 dark:text-green-300 mb-8 leading-relaxed">
            {t('sir_desc')}
          </p>
          <button className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1">
            {t('check_revision')}
          </button>
        </div>
      </motion.section>
    </div>
  );
}
