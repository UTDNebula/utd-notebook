'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Paper,
} from '@mui/material';
import { useRouter } from 'next/navigation';
export default function UploadNoteForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [prefix, setPrefix] = useState('');
  const [courseNumber, setCourseNumber] = useState('');
  const [sectionCode, setSectionCode] = useState('');
  const [professor, setProfessor] = useState('');
  const [term, setTerm] = useState('');
  const [year, setYear] = useState('');

  const termOptions = ['Spring', 'Summer', 'Fall'];

  const handleUpload = async () => {
    type UploadResponse =
      | { error: string }
      | { message: string; data?: unknown };

    if (!file) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('prefix', prefix);
    formData.append('courseNumber', courseNumber);
    formData.append('sectionCode', sectionCode);
    formData.append('professor', professor);
    formData.append('term', term);
    formData.append('year', year);

    try {
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      const json = (await res.json()) as UploadResponse;

      if (!res.ok && 'error' in json) {
        alert(json.error || 'Upload failed');
      } else {
        setFile(null);
        setPrefix('');
        setCourseNumber('');
        setSectionCode('');
        setProfessor('');
        setTerm('');
        setYear('');
        alert('Upload successful');
      }
    } catch (error) {
      alert('Upload failed');
      console.log(error);
      return;
    }
    router.refresh();
  };

  return (
    <Paper sx={{ p: 3, mt: 3, backgroundColor: '#1E1E1E' }}>
      <Typography variant="h6" color="white" gutterBottom>
        Upload a New Note
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <Button variant="contained" component="label">
          {file ? file.name : 'Choose File'}
          <input
            type="file"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </Button>

        <TextField
          label="Prefix (e.g. CS)"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
        />

        <TextField
          label="Course Number (e.g. 1337)"
          value={courseNumber}
          onChange={(e) => setCourseNumber(e.target.value)}
        />

        <TextField
          label="Section Code (e.g. 001)"
          value={sectionCode}
          onChange={(e) => setSectionCode(e.target.value)}
        />

        <TextField
          label="Professor"
          value={professor}
          onChange={(e) => setProfessor(e.target.value)}
        />

        <TextField
          select
          label="Term"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        >
          {termOptions.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={() => void handleUpload()}
        >
          Upload Note
        </Button>
      </Box>
    </Paper>
  );
}
