import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { UserPlus, FileText, Camera, CheckCircle, AlertCircle, RefreshCw, MapPin } from 'lucide-react';
import Webcam from 'react-webcam';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    aadhaar_last4: '',
    address: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [epicNumber, setEpicNumber] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  const webcamRef = useRef<Webcam>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/auth/states')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStates(data);
        } else {
          console.error('States data is not an array:', data);
          setStates([]);
        }
      })
      .catch(err => console.error('Error fetching states:', err));
  }, []);

  useEffect(() => {
    if (formData.state) {
      fetch(`/api/auth/cities?state=${formData.state}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCities(data);
          } else {
            console.error('Cities data is not an array:', data);
            setCities([]);
          }
        })
        .catch(err => console.error('Error fetching cities:', err));
    } else {
      setCities([]);
    }
  }, [formData.state]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setCameraActive(false);
    }
  }, [webcamRef]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setFormData({ ...formData, state: value, city: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.aadhaar_last4.length !== 4) {
      return setError('Aadhaar must be exactly 4 digits');
    }

    if (!capturedImage) {
      return setError('Please complete face authentication setup');
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, face_data: capturedImage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setEpicNumber(data.epic_number);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="max-w-md mx-auto mt-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-green-100 dark:border-green-800/30 text-center transition-colors duration-200"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
          className="inline-flex items-center justify-center p-5 bg-green-100 dark:bg-green-900/40 rounded-full mb-6 shadow-inner"
        >
          <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
        </motion.div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">Registration Successful!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">Your voter registration application (Form 6) has been submitted successfully.</p>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-600 mb-8 transition-colors duration-200 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-bold uppercase tracking-wider">Your EPIC Number (Voter ID)</p>
          <p className="text-3xl font-mono font-bold text-orange-600 dark:text-orange-400 tracking-widest">{epicNumber}</p>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg transform hover:-translate-y-1"
        >
          Proceed to Login
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto mt-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-200"
    >
      <div className="flex items-center space-x-5 mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
        <motion.div 
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-2xl shadow-inner"
        >
          <FileText className="w-10 h-10 text-orange-600 dark:text-orange-400" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t('register_form6')}</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Application for inclusion of name in electoral roll</p>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-8 text-sm border border-red-200 dark:border-red-800 flex items-center shadow-sm"
        >
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name (As per Aadhaar)</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white shadow-sm"
              placeholder="Ramesh Kumar"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('email_address')}</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white shadow-sm"
              placeholder="ramesh@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              required
              pattern="[0-9]{10}"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white shadow-sm"
              placeholder="9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Aadhaar (Last 4 Digits)</label>
            <input
              type="text"
              name="aadhaar_last4"
              required
              maxLength={4}
              pattern="[0-9]{4}"
              value={formData.aadhaar_last4}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white shadow-sm"
              placeholder="1234"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Residential Address</label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white shadow-sm"
              placeholder="123, Main Street, Apartment 4B"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">State</label>
            <div className="relative">
              <select
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white shadow-sm appearance-none"
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">City</label>
            <div className="relative">
              <select
                name="city"
                required
                disabled={!formData.state}
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white shadow-sm appearance-none disabled:opacity-50"
              >
                <option value="">Select City</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('password')}</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={6}
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white shadow-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Face Capture */}
        <div className="mt-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center bg-gray-50/50 dark:bg-gray-800/30 transition-colors duration-200">
          {!cameraActive && !capturedImage ? (
            <>
              <div className="inline-flex items-center justify-center p-5 bg-white dark:bg-gray-700 rounded-full shadow-sm mb-4">
                <Camera className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Face Authentication Setup</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto font-medium">
                For secure voting, we need to capture your face data. This will be used to verify your identity before you cast your vote.
              </p>
              <button 
                type="button" 
                onClick={() => setCameraActive(true)}
                className="px-8 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                Start Camera
              </button>
            </>
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
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Position your face within the circle</p>
              <div className="flex justify-center space-x-4 mt-4">
                <button 
                  type="button" 
                  onClick={() => setCameraActive(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={capture}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-md"
                >
                  Capture Face
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden max-w-sm mx-auto border-4 border-green-500 shadow-lg">
                <img src={capturedImage!} alt="Captured face" className="w-full h-auto" />
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-green-600 dark:text-green-400">Face Data Captured Successfully</h3>
              <button 
                type="button" 
                onClick={() => {
                  setCapturedImage(null);
                  setCameraActive(true);
                }}
                className="flex items-center justify-center mx-auto space-x-2 px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake Photo</span>
              </button>
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-70 flex justify-center items-center space-x-3 shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
            ) : (
              <>
                <UserPlus className="w-6 h-6" />
                <span className="text-lg">Submit Registration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
