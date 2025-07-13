import React from 'react';
import { Box, Typography, Container, TextField, Button, MenuItem } from '@mui/material';

function TransactionForm() {
  const transactionTypes = [
    { value: 'income', label: '収入' },
    { value: 'expense', label: '支出' },
  ];

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          収支入力
        </Typography>
        <TextField
          label="日付"
          type="date"
          defaultValue="2023-01-01"
          InputLabelProps={{
            shrink: true,
          }}
          margin="normal"
          fullWidth
        />
        <TextField
          select
          label="種別"
          defaultValue="expense"
          margin="normal"
          fullWidth
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
        />
        <TextField
          label="説明"
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          rows={3}
        />
        <TextField
          label="カテゴリ"
          variant="outlined"
          margin="normal"
          fullWidth
        />
        <Button variant="contained" color="primary" sx={{ mt: 3, mb: 2 }}>
          保存
        </Button>
      </Box>
    </Container>
  );
}

export default TransactionForm;
