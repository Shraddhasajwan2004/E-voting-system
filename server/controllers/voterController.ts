import { pool } from '../config/db.js';

export const getCandidates = async (req: any, res: any) => {
  try {
    const [voters]: any = await pool.query('SELECT constituency FROM voters WHERE user_id = ? LIMIT 1', [req.user.id]);
    const voter = voters[0];
    if (!voter) return res.status(404).json({ error: 'Voter not found' });

    const [candidates] = await pool.query('SELECT id, name, party_name, party_symbol FROM candidates WHERE constituency = ?', [voter.constituency]);
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};

export const castVote = async (req: any, res: any) => {
  const { candidate_id } = req.body;

  try {
    const [voters]: any = await pool.query('SELECT id, has_voted FROM voters WHERE user_id = ? LIMIT 1', [req.user.id]);
    const voter = voters[0];
    
    if (!voter) return res.status(404).json({ error: 'Voter record not found' });
    if (voter.has_voted) return res.status(400).json({ error: 'You have already voted' });

    const [candidates]: any = await pool.query('SELECT id FROM candidates WHERE id = ? LIMIT 1', [candidate_id]);
    const candidate = candidates[0];
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('INSERT INTO votes (candidate_id) VALUES (?)', [candidate_id]);
      await connection.query('UPDATE voters SET has_voted = 1 WHERE id = ?', [voter.id]);
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
    
    res.json({ message: 'Vote cast successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cast vote' });
  }
};

export const submitComplaint = async (req: any, res: any) => {
  const { subject, description } = req.body;
  
  if (!subject || !description) {
    return res.status(400).json({ error: 'Subject and description are required' });
  }

  try {
    await pool.query('INSERT INTO complaints (user_id, subject, description) VALUES (?, ?, ?)', [req.user.id, subject, description]);
    res.json({ message: 'Complaint submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
};

export const getTimeline = async (req: any, res: any) => {
  try {
    const [startRows]: any = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ? LIMIT 1', ['voting_start']);
    const [endRows]: any = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ? LIMIT 1', ['voting_end']);
    
    res.json({ 
      start: startRows.length > 0 ? startRows[0].setting_value : null, 
      end: endRows.length > 0 ? endRows[0].setting_value : null 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
};

export const updateProfile = async (req: any, res: any) => {
  const { name, mobile } = req.body;
  if (!name || !mobile) return res.status(400).json({ error: 'Name and mobile are required' });

  try {
    await pool.query('UPDATE users SET name = ?, mobile = ? WHERE id = ?', [name, mobile, req.user.id]);
    
    const [users]: any = await pool.query(`
      SELECT u.id, u.name, u.email, u.mobile, u.role, v.epic_number, v.constituency, v.has_voted
      FROM users u
      LEFT JOIN voters v ON u.id = v.user_id
      WHERE u.id = ? LIMIT 1
    `, [req.user.id]);
    
    res.json({ message: 'Profile updated successfully', user: users[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getFaceImage = async (req: any, res: any) => {
  try {
    const [rows]: any = await pool.query('SELECT face_descriptor FROM face_data WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [req.user.id]);
    
    if (rows.length > 0 && rows[0].face_descriptor) {
      res.json({ face_data: rows[0].face_descriptor });
    } else {
      res.status(404).json({ error: 'No face image found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch face image' });
  }
};
