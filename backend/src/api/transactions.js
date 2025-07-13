const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// このルーターのすべてのルートに認証ミドルウェアを適用
router.use(authMiddleware);

// 新規収支を登録
router.post('/', async (req, res) => {
  const { date, type, amount, description, category_id } = req.body;
  const userId = req.user.id;

  if (!date || !type || !amount) {
    return res.status(400).json({ message: '日付、種別、金額は必須です。' });
  }

  try {
    const newTransaction = await db.query(
      'INSERT INTO transactions (user_id, date, type, amount, description, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, date, type, amount, description, category_id]
    );
    res.status(201).json(newTransaction.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// 収支一覧を取得
router.get('/', async (req, res) => {
  const userId = req.user.id;

  try {
    const transactions = await db.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [userId]);
    res.json(transactions.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// 収支情報を更新
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { date, type, amount, description, category_id } = req.body;

  if (!date || !type || !amount) {
    return res.status(400).json({ message: '日付、種別、金額は必須です。' });
  }

  try {
    const updatedTransaction = await db.query(
      'UPDATE transactions SET date = $1, type = $2, amount = $3, description = $4, category_id = $5, updated_at = NOW() WHERE id = $6 AND user_id = $7 RETURNING *',
      [date, type, amount, description, category_id, id, userId]
    );

    if (updatedTransaction.rows.length === 0) {
      return res.status(404).json({ message: '更新対象の収支が見つからないか、権限がありません。' });
    }

    res.json(updatedTransaction.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// 収支情報を削除
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const deletedTransaction = await db.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (deletedTransaction.rows.length === 0) {
      return res.status(404).json({ message: '削除対象の収支が見つからないか、権限がありません。' });
    }

    res.status(204).send(); // No Content
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

module.exports = router;
