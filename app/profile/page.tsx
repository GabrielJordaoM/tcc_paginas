"use client";
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Avatar, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  Box,
  Tabs,
  Tab,
  AppBar,
  Divider
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Header from '../../components/header/Header';
import styles from './styles.module.scss';

interface User {
  name: string;
  email: string;
  avatar: string;
  password?: string;
}

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [value, setValue] = useState(0);
  const [user, setUser] = useState<User>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150',
    password: '',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setError(null);
  };

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

  // Handle profile form input changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setError(null);
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

  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user.name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      setError('Invalid email format');
      return;
    }

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, password: undefined }),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      alert('Profile updated successfully!');
    } catch (err) {
      setError('Error updating profile');
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok) throw new Error('Failed to change password');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password changed successfully!');
    } catch (err) {
      setError('Error changing password');
    }
  };

  // Changed route from /profile/skills to /skills
  const handleSkillsNav = () => {
    router.push('/skills');
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Container maxWidth={false} disableGutters className={styles.fullContainer}>
        <Paper elevation={3} className={styles.profilePaper}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} className={styles.alert}>
              {error}
            </Alert>
          )}
          <AppBar position="static" className={styles.tabAppBar}>
            <Tabs value={value} onChange={handleTabChange} centered>
              <Tab label="Profile" />
              <Tab label="Password" />
              <Tab label="Skills" onClick={handleSkillsNav} />
            </Tabs>
          </AppBar>
          <Divider />
          <TabPanel value={value} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4} className={styles.avatarSection}>
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
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
                    component="span"
                    fullWidth
                    aria-label="Upload new avatar"
                  >
                    Upload New Avatar
                  </Button>
                </label>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                  Profile Information
                </Typography>
                <form onSubmit={handleProfileSubmit} className={styles.form}>
                  <TextField
                    label="Full Name"
                    name="name"
                    value={user.name}
                    onChange={handleProfileChange}
                    fullWidth
                    margin="normal"
                    error={!user.name.trim()}
                    helperText={!user.name.trim() ? 'Name is required' : ''}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={user.email}
                    onChange={handleProfileChange}
                    fullWidth
                    margin="normal"
                    error={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)}
                    helperText={
                      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email) ? 'Invalid email format' : ''
                    }
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Save Profile
                  </Button>
                </form>
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Typography variant="h5" gutterBottom>
              Change Password
            </Typography>
            <form onSubmit={handlePasswordChange} className={styles.form}>
              <TextField
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                margin="normal"
                error={newPassword.length > 0 && newPassword.length < 6}
                helperText={newPassword.length > 0 && newPassword.length < 6 ? 'At least 6 characters' : ''}
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                margin="normal"
                error={confirmPassword && newPassword !== confirmPassword}
                helperText={confirmPassword && newPassword !== confirmPassword ? "Passwords don't match" : ''}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Change Password
              </Button>
            </form>
          </TabPanel>
          <TabPanel value={value} index={2}>
            <Typography variant="h5" gutterBottom>
              Skills Management
            </Typography>
            <Button
              variant="contained"
              onClick={handleSkillsNav}
              fullWidth
              sx={{ mt: 2 }}
            >
              Go to Skills Page
            </Button>
          </TabPanel>
        </Paper>
      </Container>
    </div>
  );
};

export default ProfilePage;