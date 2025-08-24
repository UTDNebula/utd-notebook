import type { Metadata } from 'next';
import { Box, Typography, Paper, Container } from '@mui/material';

export const metadata: Metadata = {
  title: 'Dashboard',
  alternates: {
    canonical: 'https://notebook.utdnebula.com/dashboard',
  },
};

const Dashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your UTD Notebook dashboard. Here you can manage your notes and sections.
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dashboard functionality coming soon...
        </Typography>
      </Paper>
    </Container>
  );
};

export default Dashboard;
