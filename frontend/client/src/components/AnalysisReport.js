import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, CircularProgress, Alert, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

function AnalysisReport() {
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
        // 仮の期間指定 (例: 過去1年間のデータ)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 1);

        const response = await axios.get('http://localhost:8080/transactions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { // バックエンドに期間を渡すための仮のパラメータ
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          }
        });
        setTransactions(response.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'データの取得に失敗しました。');
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

  // 月別収支推移棒グラフ用のデータ整形
  const getMonthlySummaryData = () => {
    const monthlyData = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyData[monthKey].income += parseFloat(t.amount);
      } else {
        monthlyData[monthKey].expense += parseFloat(t.amount);
      }
    });
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  // カテゴリ別支出円グラフ用のデータ整形
  const getCategoryExpenseData = () => {
    const categoryData = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const categoryName = t.category_id || '未分類'; // category_idが未定義の場合を考慮
      if (!categoryData[categoryName]) {
        categoryData[categoryName] = 0;
      }
      categoryData[categoryName] += parseFloat(t.amount);
    });
    return Object.keys(categoryData).map(name => ({ name, value: categoryData[name] }));
  };

  // 残高推移折れ線グラフ用のデータ整形
  const getBalanceTrendData = () => {
    const dailyBalance = {};
    let currentBalance = 0;

    // 日付でソート
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedTransactions.forEach(t => {
      const dateKey = new Date(t.date).toISOString().split('T')[0];
      if (t.type === 'income') {
        currentBalance += parseFloat(t.amount);
      } else {
        currentBalance -= parseFloat(t.amount);
      }
      // 同じ日付の最後の残高を記録
      dailyBalance[dateKey] = currentBalance;
    });

    return Object.keys(dailyBalance).map(date => ({
      date,
      balance: dailyBalance[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const monthlySummaryData = getMonthlySummaryData();
  const categoryExpenseData = getCategoryExpenseData();
  const balanceTrendData = getBalanceTrendData();

  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF199D'];

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
          分析・レポート
        </Typography>

        {transactions.length === 0 ? (
          <Typography variant="h6" color="textSecondary">
            まだ収支データがありません。新しい収支を登録してください。
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {/* 月別収支推移棒グラフ */}
            <Grid item xs={12}>
              <Typography variant="h5" component="h2" gutterBottom>
                月別収支推移
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySummaryData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" name="収入" fill="#00C49F" />
                  <Bar dataKey="expense" name="支出" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </Grid>

            {/* 残高推移折れ線グラフ */}
            <Grid item xs={12}>
              <Typography variant="h5" component="h2" gutterBottom>
                残高推移
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={balanceTrendData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="balance" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </Grid>

            {/* カテゴリ別支出円グラフ */}
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h2" gutterBottom>
                カテゴリ別支出内訳
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryExpenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryExpenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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

export default AnalysisReport;
