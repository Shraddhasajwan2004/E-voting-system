import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { User, MapPin, CheckCircle, AlertTriangle, FileText, Download, MessageSquare, Edit2 } from 'lucide-react';

export default function Dashboard() {
  const { user, token, login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintStatus, setComplaintStatus] = useState('');

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editMobile, setEditMobile] = useState(user?.mobile || '');
  const [profileStatus, setProfileStatus] = useState('');
  
  const [faceImage, setFaceImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin') {
      navigate('/admin');
    } else {
      setLoading(false);
      setEditName(user.name || '');
      setEditMobile(user.mobile || '');
      
      // Fetch face image
      const fetchFaceImage = async () => {
        try {
          const res = await fetch('/api/users/face', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.face_data) {
              setFaceImage(data.face_data);
            }
          }
        } catch (err) {
          console.error('Failed to fetch face image', err);
        }
      };
      
      fetchFaceImage();
    }
  }, [user, navigate, token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name: editName, mobile: editMobile })
      });
      const data = await res.json();
      if (res.ok) {
        setProfileStatus('Profile updated successfully!');
        login(token!, data.user); // Update context
        setTimeout(() => {
          setShowEditProfile(false);
          setProfileStatus('');
        }, 1500);
      } else {
        setProfileStatus(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileStatus('An error occurred.');
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ subject: complaintSubject, description: complaintDesc })
      });
      if (res.ok) {
        setComplaintStatus('Complaint submitted successfully!');
        setTimeout(() => {
          setShowComplaintModal(false);
          setComplaintStatus('');
          setComplaintSubject('');
          setComplaintDesc('');
        }, 2000);
      } else {
        setComplaintStatus('Failed to submit complaint.');
      }
    } catch (err) {
      setComplaintStatus('An error occurred.');
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto mt-8 space-y-8"
    >
      <motion.div variants={itemVariants} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 transition-colors duration-200">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-700 pb-8">
          <div className="flex items-center space-x-6">
            {faceImage ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-100 dark:border-orange-900/50 shadow-md">
                <img src={faceImage} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-full flex items-center justify-center shadow-inner">
                <User className="w-12 h-12 text-orange-600 dark:text-orange-400" />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {t('welcome')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">{user.name}</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg mt-1">EPIC No: <span className="font-mono font-semibold text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md ml-1">{user.epic_number}</span></p>
            </div>
          </div>
          <button 
            onClick={() => setShowEditProfile(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-orange-500" />
              {t('voting_details')}
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-600 space-y-4 transition-colors duration-200 shadow-sm hover:shadow-md">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">{t('constituency')}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{user.constituency}</p>
              </div>
              <div className="w-full h-px bg-gray-200 dark:bg-gray-600"></div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">{t('polling_station')}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">Booth 42, Govt School</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
              {t('voting_status')}
            </h2>
            <div className={`p-6 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${user.has_voted ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border-green-200 dark:border-green-800/30' : 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 border-orange-200 dark:border-orange-800/30'}`}>
              {user.has_voted ? (
                <div className="text-center space-y-4">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-900/40 rounded-full shadow-inner"
                  >
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <h3 className="text-2xl font-extrabold text-green-800 dark:text-green-400 tracking-tight">{t('vote_cast_success')}</h3>
                  <p className="text-green-700 dark:text-green-300 font-medium">{t('thank_you_voting')}</p>
                  <button className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow font-bold mt-4">
                    <Download className="w-5 h-5" />
                    <span>{t('download_receipt')}</span>
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center justify-center p-4 bg-orange-100 dark:bg-orange-900/40 rounded-full shadow-inner"
                  >
                    <AlertTriangle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                  </motion.div>
                  <h3 className="text-2xl font-extrabold text-orange-800 dark:text-orange-400 tracking-tight">{t('pending_vote')}</h3>
                  <p className="text-orange-700 dark:text-orange-300 font-medium">{t('pending_vote_desc')}</p>
                  <button
                    onClick={() => navigate('/vote')}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mt-4"
                  >
                    {t('enter_voting_booth')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-500/50 transition-all cursor-pointer group transform hover:-translate-y-1">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{t('form8_title')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t('form8_desc')}</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-green-200 dark:hover:border-green-500/50 transition-all cursor-pointer group transform hover:-translate-y-1">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
            <Download className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{t('download_epic')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t('download_epic_desc')}</p>
        </motion.div>
        
        <motion.div variants={itemVariants} onClick={() => setShowComplaintModal(true)} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-red-200 dark:hover:border-red-500/50 transition-all cursor-pointer group transform hover:-translate-y-1">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Raise Complaint</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Report issues related to voting, polling station, or voter list.</p>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showComplaintModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Submit a Complaint</h3>
              {complaintStatus && (
                <div className={`p-3 rounded-lg mb-4 text-sm font-bold ${complaintStatus.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {complaintStatus}
                </div>
              )}
              <form onSubmit={handleSubmitComplaint} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={complaintSubject} 
                    onChange={(e) => setComplaintSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="E.g., Name missing from list"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea 
                    required
                    value={complaintDesc} 
                    onChange={(e) => setComplaintDesc(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none h-32 resize-none"
                    placeholder="Provide details about your issue..."
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={() => setShowComplaintModal(false)} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600">Submit</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditProfile && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h3>
              {profileStatus && (
                <div className={`p-3 rounded-lg mb-4 text-sm font-bold ${profileStatus.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {profileStatus}
                </div>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input 
                    type="text" 
                    required
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mobile Number</label>
                  <input 
                    type="tel" 
                    required
                    value={editMobile} 
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={() => setShowEditProfile(false)} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
