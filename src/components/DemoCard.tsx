'use client';

import React from 'react';
import { Card, CardContent, Typography, Button, IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

type Props = {
  title?: string;
  onPress?: () => void;
};

export default function DemoCard({ title = 'MUI Component!', onPress }: Props) {
  return (
    <Card sx={{ maxWidth: 520, margin: '1.5rem auto', boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          MUI component demo!
        </Typography>

        <Button
          startIcon={<ChatIcon />}
          variant="contained"
          color="primary"
          onClick={onPress}
        >
          Button with Chat Icon!
        </Button>
      </CardContent>
    </Card>
  );
}