import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          FP Planning App
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/">ダッシュボード</Button>
          <Button color="inherit" component={Link} to="/transactions/new">収支入力</Button>
          <Button color="inherit" component={Link} to="/transactions">収支一覧</Button>
          <Button color="inherit" component={Link} to="/login">ログイン</Button>
          <Button color="inherit" component={Link} to="/register">新規登録</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
