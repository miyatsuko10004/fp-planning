import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, TextField, Button, MenuItem, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function TransactionForm() {
  const { id } = useParams(); // URLからIDを取得
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [formTitle, setFormTitle] = useState('収支入力');

  const transactionTypes = [
    { value: 'income', label: '収入' },
    { value: 'expense', label: '支出' },
  ];

  useEffect(() => {
    if (id) {
      setFormTitle('収支編集');
      const fetchTransaction = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        try {
          const response = await axios.get(`http://localhost:8080/transactions/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const transaction = response.data;
          setDate(new Date(transaction.date).toISOString().split('T')[0]);
          setType(transaction.type);
          setAmount(transaction.amount);
          setDescription(transaction.description || '');
          setCategoryId(transaction.category_id || '');
        } catch (err) {
          console.error(err);
          setError(err.response?.data?.message || '収支データの取得に失敗しました。');
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.removeItem('token');
            navigate('/login');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchTransaction();
    }
  }, [id, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const transactionData = {
      date,
      type,
      amount: parseFloat(amount),
      description,
      category_id: categoryId || null,
    };

    try {
      if (id) {
        // 更新
        await axios.put(`http://localhost:8080/transactions/${id}`, transactionData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccess('収支が正常に更新されました。');
      } else {
        // 新規作成
        await axios.post('http://localhost:8080/transactions', transactionData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccess('収支が正常に保存されました。');
        // フォームをクリア
        setDate(new Date().toISOString().split('T')[0]);
        setType('expense');
        setAmount('');
        setDescription('');
        setCategoryId('');
      }
      navigate('/transactions'); // 収支一覧ページへリダイレクト
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || (id ? '収支の更新に失敗しました。' : '収支の保存に失敗しました。'));
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {formTitle}
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="日付"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            margin="normal"
            fullWidth
            required
          />
          <TextField
            select
            label="種別"
            value={type}
            onChange={(e) => setType(e.target.value)}
            margin="normal"
            fullWidth
            required
          >
            {transactionTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="金額"
            type="number"
            variant="outlined"
            margin="normal"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <TextField
            label="説明"
            variant="outlined"
            margin="normal"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            label="カテゴリ"
            variant="outlined"
            margin="normal"
            fullWidth
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 3, mb: 2 }}>
            保存
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default TransactionForm;
