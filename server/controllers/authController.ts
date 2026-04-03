import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-voting-app';

export const register = async (req: any, res: any) => {
  const { name, email, mobile, aadhaar_last4, password, face_data, address, city, state } = req.body;
  
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const [result]: any = await pool.query(
      'INSERT INTO users (name, email, mobile, aadhaar_last4, password_hash, address, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, mobile, aadhaar_last4, password_hash, address || '', city || '', state || '']
    );
    const newUserId = result.insertId;
    
    const epic_number = 'IND' + Math.floor(1000000 + Math.random() * 9000000);
    
    // Assign constituency based on city and state
    const [constituencyRecord]: any = await pool.query('SELECT name FROM constituencies WHERE LOWER(city) = LOWER(?) AND LOWER(state) = LOWER(?) LIMIT 1', [city || '', state || '']);
    let constituency = 'Unassigned Region';
    
    if (constituencyRecord && constituencyRecord.length > 0) {
      constituency = constituencyRecord[0].name;
    } else if (city && state) {
      // Create a default constituency if none exists for the city
      constituency = `${city} Central`;
      // Optionally insert it into constituencies table for future use
      try {
        await pool.query('INSERT INTO constituencies (name, city, state) VALUES (?, ?, ?)', [constituency, city, state]);
      } catch (e) {
        // Ignore if already exists
      }
    }

    await pool.query(
      'INSERT INTO voters (user_id, epic_number, constituency, polling_station) VALUES (?, ?, ?, ?)',
      [newUserId, epic_number, constituency, `${city || 'Local'} Primary School`]
    );

    if (face_data) {
      await pool.query('INSERT INTO face_data (user_id, face_descriptor) VALUES (?, ?)', [newUserId, face_data]);
    }

    res.status(201).json({ message: 'Registration successful', epic_number });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email already registered' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
};

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  
  try {
    // Find user by email or epic_number
    const [users]: any = await pool.query(`
      SELECT u.*, v.epic_number, v.constituency, v.has_voted 
      FROM users u 
      LEFT JOIN voters v ON u.id = v.user_id 
      WHERE u.email = ? OR v.epic_number = ?
      LIMIT 1
    `, [email, email]);

    const user = users[0];
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        epic_number: user.epic_number,
        constituency: user.constituency,
        has_voted: user.has_voted
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const faceLogin = async (req: any, res: any) => {
  const { email, face_data } = req.body;
  
  if (!face_data) {
    return res.status(400).json({ error: 'Face data is required' });
  }

  try {
    // Find user by email or epic_number
    const [users]: any = await pool.query(`
      SELECT u.*, v.epic_number, v.constituency, v.has_voted 
      FROM users u 
      LEFT JOIN voters v ON u.id = v.user_id 
      WHERE u.email = ? OR v.epic_number = ?
      LIMIT 1
    `, [email, email]);

    const user = users[0];
    if (!user) return res.status(400).json({ error: 'User not found' });

    const [storedFaceData]: any = await pool.query('SELECT face_descriptor FROM face_data WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [user.id]);
    
    if (!storedFaceData || storedFaceData.length === 0) {
      return res.status(400).json({ error: 'No face data registered for this user' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        epic_number: user.epic_number,
        constituency: user.constituency,
        has_voted: user.has_voted
      } 
    });
  } catch (error) {
    console.error('Face login error:', error);
    res.status(500).json({ error: 'Face login failed' });
  }
};

export const verifyVoter = async (req: any, res: any) => {
  const { identifier, aadhaar_last4, password } = req.body;
  
  if (!identifier || !aadhaar_last4 || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Find user by email or epic_number
    const [users]: any = await pool.query(`
      SELECT u.*, v.epic_number 
      FROM users u 
      LEFT JOIN voters v ON u.id = v.user_id 
      WHERE u.email = ? OR v.epic_number = ?
    `, [identifier, identifier]);

    if (!users || users.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if it matches the logged in user
    if (user.id !== req.user.id) {
      return res.status(403).json({ error: 'Verification failed for the current user' });
    }

    // Verify Aadhaar last 4
    if (user.aadhaar_last4 !== aadhaar_last4) {
      return res.status(400).json({ error: 'Invalid Aadhaar last 4 digits' });
    }

    // Verify Password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    res.json({ success: true, message: 'Voter verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

export const resetPassword = async (req: any, res: any) => {
  const { name, email, mobile, aadhaar_last4, city, state, address, newPassword } = req.body;

  if (!name || !email || !mobile || !aadhaar_last4 || !city || !state || !address || !newPassword) {
    return res.status(400).json({ error: 'All fields are required for verification' });
  }

  try {
    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE email = ? AND name = ? AND mobile = ? AND aadhaar_last4 = ? AND city = ? AND state = ? AND address = ? LIMIT 1',
      [email, name, mobile, aadhaar_last4, city, state, address]
    );

    const user = users[0];
    if (!user) {
      return res.status(400).json({ error: 'Verification failed. Details do not match our records.' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, user.id]);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

export const getStates = async (req: any, res: any) => {
  try {
    const [states]: any = await pool.query('SELECT DISTINCT state FROM constituencies ORDER BY state ASC');
    res.json(states.map((s: any) => s.state));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch states' });
  }
};

export const getCities = async (req: any, res: any) => {
  const { state } = req.query;
  try {
    const [cities]: any = await pool.query('SELECT DISTINCT city FROM constituencies WHERE state = ? ORDER BY city ASC', [state]);
    res.json(cities.map((c: any) => c.city));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
};

export const getConstituencies = async (req: any, res: any) => {
  const { city, state } = req.query;
  try {
    let query = 'SELECT name FROM constituencies WHERE city = ?';
    const params = [city];
    
    if (state) {
      query += ' AND state = ?';
      params.push(state);
    }
    
    query += ' ORDER BY name ASC';
    
    const [constituencies]: any = await pool.query(query, params);
    res.json(constituencies.map((c: any) => c.name));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch constituencies' });
  }
};
