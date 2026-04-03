import { pool } from '../config/db.js';

export const getResults = async (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  
  try {
    const [results] = await pool.query(`
      SELECT c.id, c.name, c.party_name, c.party_symbol, COUNT(v.id) as votes
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidate_id
      GROUP BY c.id
      ORDER BY votes DESC
    `);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

export const getStats = async (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  
  try {
    const [totalVoters]: any = await pool.query('SELECT COUNT(*) as count FROM voters');
    const [totalVotes]: any = await pool.query('SELECT COUNT(*) as count FROM votes');
    const [pendingComplaints]: any = await pool.query('SELECT COUNT(*) as count FROM complaints WHERE status = ?', ['pending']);
    
    const vCount = totalVoters[0].count;
    const voteCount = totalVotes[0].count;
    const cCount = pendingComplaints[0].count;

    res.json({
      totalVoters: vCount,
      totalVotes: voteCount,
      turnoutPercentage: vCount > 0 ? ((voteCount / vCount) * 100).toFixed(2) : 0,
      pendingComplaints: cCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const getVoters = async (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  
  try {
    const [voters] = await pool.query(`
      SELECT u.id, u.name, u.email, u.mobile, u.address, u.city, u.aadhaar_last4, v.epic_number, v.constituency, v.polling_station, v.has_voted
      FROM users u
      JOIN voters v ON u.id = v.user_id
      ORDER BY u.created_at DESC
    `);
    res.json(voters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch voters' });
  }
};

export const updateVoter = async (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  
  const { constituency, polling_station } = req.body;
  const userId = req.params.id;

  try {
    await pool.query('UPDATE voters SET constituency = ?, polling_station = ? WHERE user_id = ?', [constituency, polling_station, userId]);
    res.json({ message: 'Voter updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update voter' });
  }
};

export const getComplaints = async (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  
  try {
    const [complaints] = await pool.query(`
      SELECT c.id, c.subject, c.description, c.status, c.created_at, u.name as user_name, u.email as user_email
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `);
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

export const updateComplaint = async (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  
  const { status } = req.body;
  const complaintId = req.params.id;

  try {
    await pool.query('UPDATE complaints SET status = ? WHERE id = ?', [status, complaintId]);
    res.json({ message: 'Complaint updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update complaint' });
  }
};

export const getCandidates = async (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  
  try {
    const [candidates] = await pool.query('SELECT * FROM candidates');
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};

export const addCandidate = async (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  
  const { name, party_name, party_symbol, constituency } = req.body;

  try {
    await pool.query('INSERT INTO candidates (name, party_name, party_symbol, constituency) VALUES (?, ?, ?, ?)', [name, party_name, party_symbol, constituency]);
    res.json({ message: 'Candidate added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add candidate' });
  }
};

export const deleteCandidate = async (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  
  const candidateId = req.params.id;

  try {
    await pool.query('DELETE FROM candidates WHERE id = ?', [candidateId]);
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
};

export const updateTimeline = async (req: any, res: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const { start, end } = req.body;
  
  try {
    await pool.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [start, 'voting_start']);
    await pool.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [end, 'voting_end']);
    res.json({ message: 'Timeline updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update timeline' });
  }
};
