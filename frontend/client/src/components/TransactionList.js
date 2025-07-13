import React from 'react';
import { Box, Typography, Container, List, ListItem, ListItemText, Divider } from '@mui/material';

function TransactionList() {
  // 仮のデータ
  const transactions = [
    { id: 1, date: '2023-07-01', description: '食費', amount: -5000, type: 'expense' },
    { id: 2, date: '2023-07-05', description: '給料', amount: 200000, type: 'income' },
    { id: 3, date: '2023-07-10', description: '交通費', amount: -1200, type: 'expense' },
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          収支一覧
        </Typography>
        <List>
          {transactions.map((transaction) => (
            <React.Fragment key={transaction.id}>
              <ListItem>
                <ListItemText
                  primary={`${transaction.date}: ${transaction.description}`}
                  secondary={`金額: ${transaction.amount}円 (${transaction.type === 'income' ? '収入' : '支出'})`}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Container>
  );
}

export default TransactionList;
