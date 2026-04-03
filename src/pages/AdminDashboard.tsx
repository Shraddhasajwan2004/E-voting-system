import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Vote, Percent, FileText, Download, ShieldCheck, AlertTriangle, MapPin, Edit, CheckCircle, XCircle, Edit2, Settings } from 'lucide-react';

interface Stats {
  totalVoters: number;
  totalVotes: number;
  turnoutPercentage: number;
  pendingComplaints: number;
}

interface Result {
  id: number;
  name: string;
  party_name: string;
  party_symbol: string;
  votes: number;
}

interface Voter {
  id: number;
  name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  aadhaar_last4: string;
  epic_number: string;
  constituency: string;
  polling_station: string;
  has_voted: number;
}

interface Complaint {
  id: number;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

interface Candidate {
  id: number;
  name: string;
  party_name: string;
  party_symbol: string;
  constituency: string;
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'voters' | 'candidates' | 'complaints'>('overview');
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit Voter State
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [editConstituency, setEditConstituency] = useState('');
  const [editPollingStation, setEditPollingStation] = useState('');

  // Timeline State
  const [timelineStart, setTimelineStart] = useState('');
  const [timelineEnd, setTimelineEnd] = useState('');
  const [timelineStatus, setTimelineStatus] = useState('');

  // Edit Profile State
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editMobile, setEditMobile] = useState(user?.mobile || '');
  const [profileStatus, setProfileStatus] = useState('');

  // Add Candidate State
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    party_name: '',
    party_symbol: '',
    constituency: '',
    city: '',
    state: ''
  });
  const [candidateStatus, setCandidateStatus] = useState('');
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [constituenciesList, setConstituenciesList] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, resultsRes, votersRes, complaintsRes, candidatesRes, timelineRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/results', { headers }),
        fetch('/api/admin/voters', { headers }),
        fetch('/api/admin/complaints', { headers }),
        fetch('/api/admin/candidates', { headers }),
        fetch('/api/settings/timeline', { headers })
      ]);

      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      
      setStats(await statsRes.json());
      setResults(await resultsRes.json());
      setVoters(await votersRes.json());
      setComplaints(await complaintsRes.json());
      setCandidates(await candidatesRes.json());
      
      const timelineData = await timelineRes.json();
      if (timelineData.start) setTimelineStart(timelineData.start.slice(0, 16));
      if (timelineData.end) setTimelineEnd(timelineData.end.slice(0, 16));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings/timeline', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          start: new Date(timelineStart).toISOString(), 
          end: new Date(timelineEnd).toISOString() 
        })
      });
      if (res.ok) {
        setTimelineStatus('Timeline updated successfully!');
        setTimeout(() => setTimelineStatus(''), 3000);
      } else {
        setTimelineStatus('Failed to update timeline.');
      }
    } catch (err) {
      setTimelineStatus('An error occurred.');
    }
  };

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
        // We don't have login in useAuth from AdminDashboard currently, but we can reload
        setTimeout(() => {
          setShowEditProfile(false);
          setProfileStatus('');
          window.location.reload();
        }, 1500);
      } else {
        setProfileStatus(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileStatus('An error occurred.');
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();

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
  }, [user, token, navigate]);

  useEffect(() => {
    if (newCandidate.state) {
      fetch(`/api/auth/cities?state=${newCandidate.state}`)
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
  }, [newCandidate.state]);

  useEffect(() => {
    if (newCandidate.city) {
      fetch(`/api/auth/constituencies?city=${newCandidate.city}&state=${newCandidate.state}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setConstituenciesList(data);
            if (data.length > 0 && !newCandidate.constituency) {
              setNewCandidate(prev => ({ ...prev, constituency: data[0] }));
            }
          } else {
            console.error('Constituencies data is not an array:', data);
            setConstituenciesList([]);
          }
        })
        .catch(err => console.error('Error fetching constituencies:', err));
    } else {
      setConstituenciesList([]);
    }
  }, [newCandidate.city, newCandidate.state]);

  const handleUpdateVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoter) return;
    
    try {
      const res = await fetch(`/api/admin/voters/${editingVoter.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ constituency: editConstituency, polling_station: editPollingStation })
      });
      
      if (!res.ok) throw new Error('Failed to update voter');
      
      setEditingVoter(null);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateComplaint = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/complaints/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) throw new Error('Failed to update complaint');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(newCandidate)
      });
      
      if (res.ok) {
        setCandidateStatus('Candidate added successfully!');
        setNewCandidate({ name: '', party_name: '', party_symbol: '', constituency: '', city: '', state: '' });
        fetchData();
        setTimeout(() => setCandidateStatus(''), 3000);
      } else {
        const data = await res.json();
        setCandidateStatus(data.error || 'Failed to add candidate.');
      }
    } catch (err) {
      setCandidateStatus('An error occurred.');
    }
  };

  const handleDeleteCandidate = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    
    try {
      const res = await fetch(`/api/admin/candidates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete candidate.');
      }
    } catch (err) {
      setError('An error occurred.');
    }
  };

  if (loading && !stats) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6 transition-colors duration-200 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center tracking-tight">
            <ShieldCheck className="w-8 h-8 mr-3 text-orange-600 dark:text-orange-400" />
            Admin Control Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage elections, voters, and view real-time statistics.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <button 
            onClick={() => setShowEditProfile(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
          <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto max-w-full">
            {['overview', 'voters', 'candidates', 'complaints', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-8 text-sm border border-red-200 dark:border-red-800 shadow-sm">
          {error}
        </motion.div>
      )}

      {activeTab === 'overview' && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div whileHover={{ y: -5 }} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-3xl shadow-sm hover:shadow-md border border-orange-100 dark:border-orange-900/30 flex items-center space-x-5 transition-all duration-300">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl shadow-inner">
                <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Voters</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats?.totalVoters.toLocaleString()}</p>
              </div>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-3xl shadow-sm hover:shadow-md border border-green-100 dark:border-green-900/30 flex items-center space-x-5 transition-all duration-300">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl shadow-inner">
                <Vote className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Votes Cast</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats?.totalVotes.toLocaleString()}</p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-3xl shadow-sm hover:shadow-md border border-blue-100 dark:border-blue-900/30 flex items-center space-x-5 transition-all duration-300">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl shadow-inner">
                <Percent className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Turnout</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats?.turnoutPercentage}%</p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-3xl shadow-sm hover:shadow-md border border-red-100 dark:border-red-900/30 flex items-center space-x-5 transition-all duration-300">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-inner">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Complaints</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats?.pendingComplaints}</p>
              </div>
            </motion.div>
          </div>

          {/* Results Table */}
          <motion.div variants={itemVariants} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center transition-colors duration-200">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Live Election Results</h2>
              <span className="px-4 py-1.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 text-xs font-bold rounded-full flex items-center shadow-inner">
                <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Live Updates
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <th className="p-5 font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Candidate Name</th>
                    <th className="p-5 font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Party</th>
                    <th className="p-5 font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs text-right">Votes Received</th>
                    <th className="p-5 font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs text-right">Vote Share</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => {
                    const share = stats?.totalVotes ? ((result.votes / stats.totalVotes) * 100).toFixed(1) : '0.0';
                    return (
                      <motion.tr 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={result.id} 
                        className={`border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${index === 0 ? 'bg-orange-50/30 dark:bg-orange-900/10' : ''}`}
                      >
                        <td className="p-5 flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center font-extrabold text-xl text-gray-500 dark:text-gray-400 shadow-sm border border-gray-200 dark:border-gray-600">
                            {result.party_symbol[0]}
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white text-lg">{result.name}</span>
                          {index === 0 && result.votes > 0 && (
                            <span className="ml-3 px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 text-orange-800 dark:text-orange-400 text-xs font-bold rounded-lg shadow-sm">Leading</span>
                          )}
                        </td>
                        <td className="p-5 text-gray-600 dark:text-gray-400 font-medium">{result.party_name}</td>
                        <td className="p-5 text-right font-extrabold text-gray-900 dark:text-white text-lg">{result.votes.toLocaleString()}</td>
                        <td className="p-5 text-right">
                          <div className="flex items-center justify-end space-x-3">
                            <span className="text-gray-700 dark:text-gray-300 font-bold w-14">{share}%</span>
                            <div className="w-32 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${share}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${index === 0 ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`}
                              ></motion.div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}

      {activeTab === 'voters' && (
        <motion.div variants={itemVariants} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Voter Database</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-400 text-xs uppercase">Name & Contact</th>
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-400 text-xs uppercase">Address & City</th>
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-400 text-xs uppercase">EPIC Number</th>
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-400 text-xs uppercase">Constituency</th>
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-400 text-xs uppercase">Polling Station</th>
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-400 text-xs uppercase">Status</th>
                  <th className="p-4 font-bold text-gray-600 dark:text-gray-400 text-xs uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {voters.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="font-bold text-gray-900 dark:text-white">{v.name}</div>
                      <div className="text-sm text-gray-500">{v.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-900 dark:text-white text-sm">{v.address || 'N/A'}</div>
                      <div className="text-xs font-bold text-gray-500">{v.city || 'N/A'}</div>
                    </td>
                    <td className="p-4 font-mono text-orange-600 dark:text-orange-400 font-bold">{v.epic_number}</td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{v.constituency}</td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{v.polling_station}</td>
                    <td className="p-4">
                      {v.has_voted ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-bold">Voted</span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-bold">Pending</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => {
                          setEditingVoter(v);
                          setEditConstituency(v.constituency);
                          setEditPollingStation(v.polling_station);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'complaints' && (
        <motion.div variants={itemVariants} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Complaints & Issues</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {complaints.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No complaints found.</div>
            ) : complaints.map((c) => (
              <div key={c.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{c.subject}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    c.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    c.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {c.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{c.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>From: {c.user_name} ({c.user_email})</span>
                  <div className="space-x-2">
                    {c.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateComplaint(c.id, 'resolved')} className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg font-bold transition-colors">Resolve</button>
                        <button onClick={() => handleUpdateComplaint(c.id, 'rejected')} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold transition-colors">Reject</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'candidates' && (
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">Register New Candidate</h2>
            {candidateStatus && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${candidateStatus.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {candidateStatus}
              </div>
            )}
            <form onSubmit={handleAddCandidate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Candidate Name</label>
                <input 
                  type="text" 
                  required
                  value={newCandidate.name} 
                  onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Party Name</label>
                <input 
                  type="text" 
                  required
                  value={newCandidate.party_name} 
                  onChange={(e) => setNewCandidate({ ...newCandidate, party_name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g. Indian National Congress"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Party Symbol (Emoji or Icon)</label>
                <input 
                  type="text" 
                  required
                  value={newCandidate.party_symbol} 
                  onChange={(e) => setNewCandidate({ ...newCandidate, party_symbol: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g. ✋ or 🪷"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">State</label>
                <select
                  required
                  value={newCandidate.state}
                  onChange={(e) => setNewCandidate({ ...newCandidate, state: e.target.value, city: '', constituency: '' })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">City</label>
                <select
                  required
                  disabled={!newCandidate.state}
                  value={newCandidate.city}
                  onChange={(e) => {
                    const city = e.target.value;
                    setNewCandidate({ 
                      ...newCandidate, 
                      city, 
                      constituency: '' 
                    });
                  }}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Constituency</label>
                <select
                  required
                  disabled={!newCandidate.city}
                  value={newCandidate.constituency}
                  onChange={(e) => setNewCandidate({ ...newCandidate, constituency: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                >
                  <option value="">Select Constituency</option>
                  {constituenciesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg">
                  Register Candidate
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Existing Candidates</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <th className="p-4 font-bold text-gray-600 dark:text-gray-400 text-xs uppercase">Candidate Name</th>
                    <th className="p-4 font-bold text-gray-600 dark:text-gray-400 text-xs uppercase">Party</th>
                    <th className="p-4 font-bold text-gray-600 dark:text-gray-400 text-xs uppercase">Symbol</th>
                    <th className="p-4 font-bold text-gray-600 dark:text-gray-400 text-xs uppercase">Constituency</th>
                    <th className="p-4 font-bold text-gray-600 dark:text-gray-400 text-xs uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{c.name}</td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">{c.party_name}</td>
                      <td className="p-4 text-2xl">{c.party_symbol}</td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">{c.constituency}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteCandidate(c.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div variants={itemVariants} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex items-center mb-6">
            <Settings className="w-6 h-6 mr-3 text-orange-500" />
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Election Timeline Settings</h2>
          </div>
          
          {timelineStatus && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${timelineStatus.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {timelineStatus}
            </div>
          )}

          <form onSubmit={handleUpdateTimeline} className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Voting Start Time</label>
              <input 
                type="datetime-local" 
                required
                value={timelineStart} 
                onChange={(e) => setTimelineStart(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Voting End Time</label>
              <input 
                type="datetime-local" 
                required
                value={timelineEnd} 
                onChange={(e) => setTimelineEnd(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">
              Update Timeline
            </button>
          </form>
        </motion.div>
      )}

      {/* Edit Voter Modal */}
      <AnimatePresence>
        {editingVoter && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Voter Data</h3>
              <form onSubmit={handleUpdateVoter} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Constituency</label>
                  <input 
                    type="text" 
                    value={editConstituency} 
                    onChange={(e) => setEditConstituency(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Polling Station</label>
                  <input 
                    type="text" 
                    value={editPollingStation} 
                    onChange={(e) => setEditPollingStation(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={() => setEditingVoter(null)} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Admin Profile</h3>
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
