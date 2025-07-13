import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, List, ListItem, ListItemText, Divider, CircularProgress, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8080/transactions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTransactions(response.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'データの取得に失敗しました。');
        // 認証エラーの場合はログインページへリダイレクト
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [navigate]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          収支一覧
        </Typography>
        {transactions.length === 0 ? (
          <Typography variant="body1" color="textSecondary">
            まだ収支データがありません。
          </Typography>
        ) : (
          <List>
            {transactions.map((transaction) => (
              <React.Fragment key={transaction.id}>
                <ListItem secondaryAction={
                    <Button edge="end" aria-label="edit" onClick={() => navigate(`/transactions/edit/${transaction.id}`)}>
                      編集
                    </Button>
                  }>
                  <ListItemText
                    primary={`${new Date(transaction.date).toLocaleDateString()}: ${transaction.description}`}
                    secondary={`金額: ${transaction.amount}円 (${transaction.type === 'income' ? '収入' : '支出'})`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Container>
  );
}

export default TransactionList;