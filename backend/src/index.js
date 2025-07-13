const express = require('express');
const cors = require('cors');
const authRouter = require('./api/auth'); // auth.jsをインポート
const transactionsRouter = require('./api/transactions'); // transactions.jsをインポート

const app = express();
const port = 8080;

// ミドルウェア
app.use(cors());
app.use(express.json()); // JSONリクエストボディをパース

// APIルート
app.use('/auth', authRouter); // /authプレフィックスでルーターを適用
app.use('/transactions', transactionsRouter); // /transactionsプレフィックスでルーターを適用

// ルートパスへのGETリクエストハンドラ
app.get('/', (req, res) => {
  res.send('Hello World');
});

// サーバーを起動
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
