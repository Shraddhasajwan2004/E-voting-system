import { motion } from 'motion/react';
import { useEffect } from 'react';

export default function IntroScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 dark:bg-orange-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-green-500/10 dark:bg-green-500/5 blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotateX: 45, y: 50 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0, y: 0 }}
        transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
        className="text-center relative z-10 perspective-1000"
      >
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [-5, 5, -5, 5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="text-8xl md:text-9xl mb-6 drop-shadow-2xl"
        >
          🙏
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-green-600 drop-shadow-sm tracking-tight"
        >
          Apna Mat
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-gray-500 dark:text-gray-400 mt-4 text-lg md:text-xl tracking-[0.2em] uppercase font-medium"
        >
          Welcome to E-Voting
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
