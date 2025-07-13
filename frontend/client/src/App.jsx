import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import AnalysisReport from './components/AnalysisReport'; // AnalysisReportをインポート
import Header from './components/Header';

function App() {
  return (
    <Router>
      <CssBaseline /> {/* MUIのCSSリセット */}
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/transactions/new" element={<TransactionForm />} />
        <Route path="/transactions" element={<TransactionList />} />
        <Route path="/analysis" element={<AnalysisReport />} /> {/* 新しいルートを追加 */}
      </Routes>
    </Router>
  );
}

export default App;