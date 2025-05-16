import bcrypt from 'bcryptjs';
import { connectToDB } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import redis from '@/lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const cacheKey = `user:${email.toLowerCase().trim()}:${role.toLowerCase().trim()}`;

    // Try to get user from Redis cache
    const cachedUser = await redis.get(cacheKey);

    let user;

    if (cachedUser) {
      console.log('Cache hit');
      user = JSON.parse(cachedUser);
    } else {
      console.log('Cache miss');

      const connection = await connectToDB();

      const [rows] = await connection.execute(
        'SELECT * FROM employee WHERE email = ? AND role = ?',
        [email.toLowerCase().trim(), role.toLowerCase().trim()]
      );

      if (rows.length === 0) {
        connection.release();
        return res.status(401).json({ message: 'Invalid credentials: User not found' });
      }

      user = rows[0];

      // Cache the user (without password)
      const { password: pw, ...userToCache } = user;
      await redis.set(cacheKey, JSON.stringify(userToCache), 'EX', 3600); // cache for 1 hour

      connection.release();
    }

    const isPasswordValid = await bcrypt.compare(password.trim(), user.password || '');

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials: Password mismatch' });
    }

    const token = generateToken(user);
    const { password: _, ...userData } = user;

    res.status(200).json({
      token,
      user: userData,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
