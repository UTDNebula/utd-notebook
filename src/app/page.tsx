import type { Metadata } from 'next';
import { Box, Typography, Container, Paper, Button } from '@mui/material';
import Link from 'next/link';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://notebook.utdnebula.com',
  },
};

const Home = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to UTD Notebook
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your collaborative space for notes, ideas, and knowledge sharing
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            component={Link}
            href="/dashboard"
            variant="contained"
            size="large"
            sx={{ mr: 2 }}
          >
            Get Started
          </Button>
          <Button
            component={Link}
            href="/about"
            variant="outlined"
            size="large"
          >
            Learn More
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
          <Typography variant="h5" gutterBottom>
            📝 Create Notes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organize your thoughts and ideas in a structured way
          </Typography>
        </Paper>
        
        <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
          <Typography variant="h5" gutterBottom>
            🤝 Collaborate
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Work together with your team on shared documents
          </Typography>
        </Paper>
        
        <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
          <Typography variant="h5" gutterBottom>
            📱 Access Anywhere
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your notes are available on all your devices
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home;
