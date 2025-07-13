import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, CircularProgress, Alert, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

function Dashboard() {
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

  // 棒グラフ用のデータ整形
  const getBarChartData = () => {
    const dailyData = {};
    transactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString(); // 日付のみ取得
      if (!dailyData[date]) {
        dailyData[date] = { date, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        dailyData[date].income += parseFloat(t.amount);
      } else {
        dailyData[date].expense += parseFloat(t.amount);
      }
    });
    return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // 円グラフ用のデータ整形
  const getPieChartData = () => {
    const typeData = { income: 0, expense: 0 };
    transactions.forEach(t => {
      typeData[t.type] += parseFloat(t.amount);
    });
    return [
      { name: '収入', value: typeData.income },
      { name: '支出', value: typeData.expense },
    ];
  };

  const barChartData = getBarChartData();
  const pieChartData = getPieChartData();
  const COLORS = ['#00C49F', '#FF8042']; // 収入と支出の色

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ダッシュボード
        </Typography>

        {transactions.length === 0 ? (
          <Typography variant="h6" color="textSecondary">
            まだ収支データがありません。新しい収支を登録してください。
          </Typography>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h2" gutterBottom>
                日別収支
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" name="収入" fill="#00C49F" />
                  <Bar dataKey="expense" name="支出" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h2" gutterBottom>
                収支内訳
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
}

export default Dashboard;