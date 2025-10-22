"use client";
import React, { useState, useEffect } from 'react';
import { Container, Grid, Avatar, Typography, TextField, Button, Paper, Alert } from '@mui/material';
import Header from '../../components/header/Header';
import styles from './styles.module.scss';

interface User {
  name: string;
  email: string;
  avatar: string;
  password?: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch user data on mount (mock API)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/user');
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError('Error loading user data');
      }
    };
    fetchUser();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setError(null); // Clear error on input change
  };

  // Handle avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!user.name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      setError('Invalid email format');
      return;
    }
    if (user.password && user.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      // Replace with actual API endpoint
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      alert('Profile updated successfully!');
    } catch (err) {
      setError('Error updating profile');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Container maxWidth="md" className={styles.profileContainer}>
        <Paper elevation={3} className={styles.profilePaper}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4} className={styles.avatarSection}>
              <Avatar
                src={user.avatar}
                alt={user.name}
                className={styles.avatar}
                aria-label="User avatar"
              />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                onChange={handleAvatarUpload}
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="contained"
                  color="primary"
                  component="span"
                  className={styles.uploadButton}
                  aria-label="Upload new avatar"
                >
                  Upload New Avatar
                </Button>
              </label>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography variant="h4" gutterBottom>
                Profile Settings
              </Typography>
              <form className={styles.form} onSubmit={handleSubmit}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  className={styles.textField}
                  error={!user.name.trim()}
                  helperText={!user.name.trim() ? 'Name is required' : ''}
                  aria-label="Full name"
                />
                <TextField
                  label="Email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  className={styles.textField}
                  error={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)}
                  helperText={
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email) ? 'Invalid email format' : ''
                  }
                  aria-label="Email address"
                />
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={user.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  className={styles.textField}
                  error={!!user.password && user.password.length < 6}
                  helperText={
                    user.password && user.password.length < 6
                      ? 'Password must be at least 6 characters'
                      : ''
                  }
                  aria-label="New password"
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  className={styles.saveButton}
                  aria-label="Save profile changes"
                >
                  Save Changes
                </Button>
              </form>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </div>
  );
};

export default ProfilePage;