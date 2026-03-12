require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '3051', // put your mysql password
  database: 'leboearn'
});

db.connect((err) => {
  if (err) {
    console.error('DB error:', err);
  } else {
    console.log('MySQL Connected');
  }
});

// Register route

app.post('/api/register', async (req, res) => {
  const { name, email, password, referral } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  const referralCode = Math.random().toString(36).substring(2,8);

  db.query(
    `INSERT INTO users (name, email, password, referral_code, referred_by)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, hashed, referralCode, referral || null],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'User registered successfully' });
    }
  );
});

// login route

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0)
        return res.status(404).json({ message: 'User not found' });

      const user = results[0];

      const valid = await bcrypt.compare(password, user.password);
      if (!valid)
        return res.status(401).json({ message: 'Invalid password' });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      res.json({ token });
    }
  );
});

// earn from video

app.post('/api/earn/video', (req, res) => {
  const userId = req.body.userId;

  db.query(
    'UPDATE users SET wallet = wallet + 5 WHERE id = ?',
    [userId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Earned 5 KES' });
    }
  );
});

// Registration Payment

app.post('/api/pay-registration', (req, res) => {
  const userId = req.body.userId;

  db.query(
    'UPDATE users SET registration_paid = TRUE WHERE id = ?',
    [userId],
    (err) => {
      if (err) return res.status(500).json(err);

      db.query(
        'SELECT referred_by FROM users WHERE id = ?',
        [userId],
        (err, result) => {
          if (result[0].referred_by) {
            db.query(
              'UPDATE users SET wallet = wallet + 52.5 WHERE referral_code = ?',
              [result[0].referred_by]
            );
          }
        }
      );

      res.json({ message: 'Registration activated' });
    }
  );
});

// Withdrawal Route

app.post('/api/withdraw', (req, res) => {
  const { userId, amount, phone } = req.body;

  db.query(
    'SELECT wallet FROM users WHERE id = ?',
    [userId],
    (err, result) => {
      if (result[0].wallet < amount)
        return res.status(400).json({ message: 'Insufficient balance' });

      db.query(
        'UPDATE users SET wallet = wallet - ? WHERE id = ?',
        [amount, userId]
      );

      db.query(
        'INSERT INTO withdrawals (user_id, amount, phone) VALUES (?, ?, ?)',
        [userId, amount, phone]
      );

      res.json({ message: 'Withdrawal submitted' });
    }
  );
});


// start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(express.static('public'));

