"use client";
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  Box,
  Tabs,
  Tab,
  AppBar,
  Divider,
  Skeleton
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Header from '../../components/header/Header';
import styles from './styles.module.scss';
import Avatar from 'boring-avatars';
import { getUser, User } from '@/lib/user';


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
    id: '0',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setError(null);
  };

  useEffect(() => {
    getUser().then((res) => {
      setUser(res)
    }).catch((err) => {
      console.log(err)
    }).finally(() => {
      setLoading(false)
    })

  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setError(null);
  };

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
        body: JSON.stringify({ name: user.name, email: user.email }),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      alert('Profile updated successfully!');
    } catch (err) {
      setError('Error updating profile');
    }
  };

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

  const handleSkillsNav = () => {
    router.push('/skills');
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Container maxWidth={false} disableGutters className={styles.fullContainer}>
        <Paper elevation={3} className={styles.profilePaper}>
          {error && (
            <Alert severity="error" className={styles.alert}>
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
          {loading?
          <Skeleton variant='rounded' sx={{margin: "20px", height:"400px"}}></Skeleton>:
          <>
          <TabPanel value={value} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4} className={styles.avatarSection}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  {/* Avatar */}
                  <Box
                    sx={{
                      width: 150,
                      height: 150,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '5px solid #fff',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      mb: 1.5,
                    }}
                  >
                    <Avatar
                      name={user.name || 'User'}
                      variant="beam"
                      size={150}
                      colors={["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"]}
                    />
                  </Box>

                  {/* Texto ABAIXO do avatar */}
                  <Typography
                    variant="caption"
                    align="center"
                    color="text.secondary"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                    }}
                  >
                    Avatar gerado automaticamente
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom fontWeight={600}>
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
                      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)
                        ? 'Invalid email format'
                        : ''
                    }
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2, py: 1.5, fontWeight: 600 }}
                  >
                    Save Profile
                  </Button>
                </form>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Senha e Skills (inalterados) */}
          <TabPanel value={value} index={1}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
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
                helperText={
                  newPassword.length > 0 && newPassword.length < 6
                    ? 'At least 6 characters'
                    : ''
                }
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                margin="normal"
                error={confirmPassword && newPassword !== confirmPassword}
                helperText={
                  confirmPassword && newPassword !== confirmPassword
                    ? "Passwords don't match"
                    : ''
                }
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2, py: 1.5, fontWeight: 600 }}
              >
                Change Password
              </Button>
            </form>
          </TabPanel>

          <TabPanel value={value} index={2}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Skills Management
            </Typography>
            <Button
              variant="contained"
              onClick={handleSkillsNav}
              fullWidth
              sx={{ mt: 2, py: 1.5, fontWeight: 600 }}
            >
              Go to Skills Page
            </Button>
          </TabPanel>
          </>
          }
        </Paper>
      </Container>
    </div>
  );
};

export default ProfilePage;