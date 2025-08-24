import type { Metadata } from 'next';
import { Box, Typography, Paper, Container, Grid } from '@mui/material';

export const metadata: Metadata = {
  title: 'About',
  alternates: {
    canonical: 'https://notebook.utdnebula.com/about',
  },
};

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About UTD Notebook
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          A modern, collaborative notebook application designed for the UTD community.
        </Typography>
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h5" gutterBottom>
            Features
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Create and organize notes in sections
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Collaborative editing capabilities
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Modern, responsive interface
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Built with Next.js and Material-UI
          </Typography>
        </Paper>
        
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h5" gutterBottom>
            Technology Stack
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Next.js 15 with App Router
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Material-UI (MUI) for components
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • TypeScript for type safety
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Drizzle ORM with PostgreSQL
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default About;
