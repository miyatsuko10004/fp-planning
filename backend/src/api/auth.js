const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

// 新規ユーザー登録
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'すべてのフィールドを入力してください。' });
  }

  try {
    // パスワードのハッシュ化
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // ユーザーをデータベースに保存
    const newUser = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, passwordHash]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === '23505') { // unique_violation
      return res.status(409).json({ message: 'このメールアドレスは既に使用されています。' });
    }
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// ログイン
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'メールアドレスとパスワードを入力してください。' });
  }

  try {
    // ユーザーを検索
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: '認証に失敗しました。' });
    }

    const user = userResult.rows[0];

    // パスワードを比較
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: '認証に失敗しました。' });
    }

    // JWTを生成
    const token = jwt.sign(
      { id: user.id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

module.exports = router;
