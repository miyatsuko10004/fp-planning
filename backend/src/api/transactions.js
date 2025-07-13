const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// カテゴリIDを取得または作成するヘルパー関数
async function getOrCreateCategoryId(categoryName, userId) {
  if (!categoryName) {
    return null; // カテゴリ名がない場合はnullを返す
  }
  // 既存のカテゴリを検索
  let categoryResult = await db.query(
    'SELECT id FROM categories WHERE name = $1 AND user_id = $2',
    [categoryName, userId]
  );

  if (categoryResult.rows.length > 0) {
    return categoryResult.rows[0].id; // 既存のカテゴリIDを返す
  } else {
    // 新しいカテゴリを作成
    let newCategoryResult = await db.query(
      'INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING id',
      [categoryName, userId]
    );
    return newCategoryResult.rows[0].id; // 新しく作成されたカテゴリIDを返す
  }
}

// このルーターのすべてのルートに認証ミドルウェアを適用
router.use(authMiddleware);

// 新規収支を登録
router.post('/', async (req, res) => {
  const { date, type, amount, description, category_name } = req.body; // category_idをcategory_nameに変更
  const userId = req.user.id;

  if (!date || !type || !amount) {
    return res.status(400).json({ message: '日付、種別、金額は必須です。' });
  }

  try {
    const categoryId = await getOrCreateCategoryId(category_name, userId); // カテゴリIDを取得または作成

    const newTransaction = await db.query(
      'INSERT INTO transactions (user_id, date, type, amount, description, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, date, type, amount, description, categoryId]
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
  const { startDate, endDate } = req.query;

  let query = 'SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.user_id = $1';
  const params = [userId];
  let paramIndex = 2;

  if (startDate) {
    query += ` AND t.date >= ${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }
  if (endDate) {
    query += ` AND t.date <= ${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  query += ' ORDER BY t.date DESC';

  try {
    const transactions = await db.query(query, params);
    res.json(transactions.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// 特定の収支を取得
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const transaction = await db.query('SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.id = $1 AND t.user_id = $2', [id, userId]);
    if (transaction.rows.length === 0) {
      return res.status(404).json({ message: '収支が見つからないか、権限がありません。' });
    }
    res.json(transaction.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// 収支情報を更新
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { date, type, amount, description, category_name } = req.body; // category_idをcategory_nameに変更

  if (!date || !type || !amount) {
    return res.status(400).json({ message: '日付、種別、金額は必須です。' });
  }

  try {
    const categoryId = await getOrCreateCategoryId(category_name, userId); // カテゴリIDを取得または作成

    const updatedTransaction = await db.query(
      'UPDATE transactions SET date = $1, type = $2, amount = $3, description = $4, category_id = $5, updated_at = NOW() WHERE id = $6 AND user_id = $7 RETURNING *',
      [date, type, amount, description, categoryId, id, userId]
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
