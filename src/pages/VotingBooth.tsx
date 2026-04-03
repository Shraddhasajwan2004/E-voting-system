import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Camera, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface Candidate {
  id: number;
  name: string;
  party_name: string;
  party_symbol: string;
}

export default function VotingBooth() {
  const { user, token, updateUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Face Auth, 2: Voting, 3: Success
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [identifier, setIdentifier] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [timelineError, setTimelineError] = useState('');

  useEffect(() => {
    if (!user || user.role === 'admin') {
      navigate('/login');
      return;
    }

    if (user.has_voted) {
      navigate('/dashboard');
      return;
    }

    const checkTimelineAndFetchCandidates = async () => {
      try {
        const timelineRes = await fetch('/api/settings/timeline');
        if (timelineRes.ok) {
          const timeline = await timelineRes.json();
          const now = new Date();
          if (timeline.start && new Date(timeline.start) > now) {
            setTimelineError(`Voting has not started yet. It will begin at ${new Date(timeline.start).toLocaleString()}`);
            setLoading(false);
            return;
          }
          if (timeline.end && new Date(timeline.end) < now) {
            setTimelineError(`Voting has ended. It ended at ${new Date(timeline.end).toLocaleString()}`);
            setLoading(false);
            return;
          }
        }

        const response = await fetch('/api/candidates', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setCandidates(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkTimelineAndFetchCandidates();
  }, [user, token, navigate]);

  const handleVoterAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    try {
      const response = await fetch('/api/auth/verify-voter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          identifier, 
          aadhaar_last4: aadhaarLast4, 
          password 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Verification failed');

      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) return;
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidate_id: selectedCandidate }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      updateUser({ ...user!, has_voted: true });
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );

  if (timelineError) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-gray-700">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-orange-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">Voting Unavailable</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{timelineError}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto mt-8"
    >
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-white to-orange-400"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
          
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-90 drop-shadow-md" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow-sm">Secure Electronic Voting Machine</h1>
          <p className="text-orange-100 font-medium tracking-wide uppercase text-sm mt-2">{t('constituency')}: {user?.constituency}</p>
        </div>

        <div className="p-8 md:p-10 min-h-[400px] relative">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-8 text-sm border border-red-200 dark:border-red-800 flex items-center shadow-sm"
            >
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="max-w-md mx-auto py-4"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">Voter Verification</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Please verify your identity to access the ballot.
                  </p>
                </div>

                <form onSubmit={handleVoterAuth} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      EPIC Number or Email
                    </label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:text-white transition-all"
                      placeholder="Enter EPIC Number or Email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Aadhaar Last 4 Digits
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      pattern="\d{4}"
                      value={aadhaarLast4}
                      onChange={(e) => setAadhaarLast4(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:text-white transition-all"
                      placeholder="e.g. 1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:text-white transition-all"
                      placeholder="Enter your password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-200 dark:border-blue-800/30 flex items-start space-x-4 transition-colors duration-200 shadow-sm">
                  <ShieldCheck className="w-7 h-7 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base text-blue-900 dark:text-blue-300 font-bold">Identity Verified Successfully</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">Your vote is secret and encrypted end-to-end.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {candidates.map((candidate, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={candidate.id}
                      onClick={() => setSelectedCandidate(candidate.id)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between ${
                        selectedCandidate === candidate.id
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-md transform scale-[1.02]'
                          : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl flex items-center justify-center shadow-sm transition-colors duration-200">
                          {/* Placeholder for party symbol */}
                          <span className="text-3xl font-bold text-gray-400 dark:text-gray-500">{candidate.party_symbol[0]}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{candidate.name}</h3>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">{candidate.party_name}</p>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedCandidate === candidate.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedCandidate === candidate.id && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 bg-white rounded-full"></motion.div>}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                  <button
                    onClick={handleVote}
                    disabled={!selectedCandidate || isSubmitting}
                    className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/30 flex items-center space-x-3 transform hover:-translate-y-1"
                  >
                    {isSubmitting ? (
                      <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        <span className="text-lg">{t('cast_vote')}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center space-y-8 py-12"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                  className="inline-flex items-center justify-center p-8 bg-green-100 dark:bg-green-900/40 rounded-full transition-colors duration-200 shadow-inner"
                >
                  <CheckCircle className="w-24 h-24 text-green-600 dark:text-green-400" />
                </motion.div>
                <div>
                  <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">{t('vote_cast_success')}</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-10 leading-relaxed">
                    Your vote has been securely recorded and encrypted. Thank you for participating in the democratic process.
                  </p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-10 py-4 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-all shadow-lg transform hover:-translate-y-1"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
