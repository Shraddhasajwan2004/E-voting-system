import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Mail, Camera, User } from 'lucide-react';
import Webcam from 'react-webcam';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'face' | 'admin'>('password');
  
  const [cameraActive, setCameraActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.user);
      
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = useCallback(async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setCameraActive(false);
      setIsVerifying(true);
      setError('');
      
      try {
        const faceResponse = await fetch('/api/auth/face-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, face_data: imageSrc }),
        });

        const faceData = await faceResponse.json();

        if (!faceResponse.ok) {
          throw new Error(faceData.error || 'Face verification failed');
        }

        login(faceData.token, faceData.user);
        
        if (faceData.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } catch (err: any) {
        setError(err.message);
        setIsVerifying(false);
        setCapturedImage(null);
        setCameraActive(true);
      }
    }
  }, [email, login, navigate, webcamRef]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto mt-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-200"
    >
      <div className="text-center mb-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="inline-flex items-center justify-center p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4 shadow-inner"
        >
          <ShieldCheck className="w-10 h-10 text-orange-600 dark:text-orange-400" />
        </motion.div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t('secure_login')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">{t('login_desc')}</p>
      </div>

      <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl mb-8">
        <button
          onClick={() => setLoginMethod('password')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
            loginMethod === 'password' 
              ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Voter (Password)
        </button>
        <button
          onClick={() => setLoginMethod('face')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
            loginMethod === 'face' 
              ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Voter (Face)
        </button>
        <button
          onClick={() => {
            setLoginMethod('admin');
            setEmail('admin@eci.gov.in');
            setPassword('admin123');
          }}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
            loginMethod === 'admin' 
              ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Admin
        </button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm border border-red-200 dark:border-red-800 flex items-center shadow-sm"
        >
          {error}
        </motion.div>
      )}

      {loginMethod === 'password' || loginMethod === 'admin' ? (
        <form onSubmit={handlePasswordLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              {loginMethod === 'admin' ? 'Admin Email' : t('email_address')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white shadow-sm"
                placeholder={loginMethod === 'admin' ? "admin@eci.gov.in" : "voter@india.gov.in"}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('password')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white shadow-sm"
                placeholder="••••••••"
              />
            </div>
            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-orange-600 hover:text-orange-500 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-70 flex justify-center items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
              loginMethod === 'admin' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
            }`}
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              loginMethod === 'admin' ? 'Access Admin Portal' : t('login_securely')
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('email_address')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white shadow-sm"
                placeholder="voter@india.gov.in"
              />
            </div>
          </div>

          {!cameraActive && !isVerifying ? (
            <button
              type="button"
              onClick={() => {
                if (!email) {
                  setError('Please enter your email first');
                  return;
                }
                setError('');
                setCameraActive(true);
              }}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-8 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex flex-col justify-center items-center border-2 border-dashed border-gray-300 dark:border-gray-600"
            >
              <Camera className="w-10 h-10 mb-3 text-gray-400" />
              <span>Start Face Scan</span>
            </button>
          ) : cameraActive ? (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden max-w-sm mx-auto border-4 border-orange-500 shadow-lg">
                {/* @ts-expect-error react-webcam types are overly strict */}
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 border-2 border-dashed border-white/50 m-8 rounded-full pointer-events-none"></div>
              </div>
              <div className="flex justify-center space-x-4">
                <button 
                  type="button" 
                  onClick={() => setCameraActive(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleFaceLogin}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-md flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Verify Face</span>
                </button>
              </div>
            </div>
          ) : isVerifying ? (
            <div className="space-y-4 text-center py-4">
              <div className="relative rounded-xl overflow-hidden max-w-sm mx-auto border-4 border-orange-500 shadow-lg">
                {capturedImage ? (
                  <img src={capturedImage} alt="Captured face" className="w-full h-auto filter brightness-75" />
                ) : (
                  <div className="bg-gray-200 dark:bg-gray-700 w-full aspect-video flex items-center justify-center">
                    <User className="w-20 h-20 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-1 bg-orange-400 absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(249,115,22,0.8)]"></div>
                </div>
              </div>
              <p className="text-orange-600 dark:text-orange-400 font-bold animate-pulse">Verifying Biometrics...</p>
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        {t('no_account')}{' '}
        <a href="/register" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-bold transition-colors">
          {t('register_form6')}
        </a>
      </div>
    </motion.div>
  );
}
