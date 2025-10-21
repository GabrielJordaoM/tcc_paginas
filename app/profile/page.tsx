'use client';

import React, { useState } from 'react';
import { Avatar, Button, TextField, Typography, Container, Box } from '@mui/material';
import Link from 'next/link';
import styles from './styles.module.scss';

const ProfilePage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Example user data (replace with API data in production)
  const user = {
    email: 'joao.silva@example.com',
    avatarUrl: 'https://via.placeholder.com/150',
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }
    // Add actual password change logic here (e.g., API call)
    alert('Senha alterada com sucesso!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Container className={styles.profileContainer}>
      <Box className={styles.profileCard}>
        <Avatar
          src={user.avatarUrl}
          alt="Perfil"
          className={styles.avatar}
        />
        <Typography variant="h4" className={styles.title}>
          Perfil
        </Typography>
        <Box className={styles.infoSection}>
          <TextField
            label="Email Cadastrado"
            value={user.email}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
            variant="outlined"
            className={styles.textField}
          />
          <TextField
            label="Senha Atual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            className={styles.textField}
          />
          <TextField
            label="Nova Senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            className={styles.textField}
          />
          <TextField
            label="Confirmar Nova Senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            className={styles.textField}
          />
        </Box>
        <Box className={styles.buttonSection}>
          <Button
            variant="contained"
            color="primary"
            className={styles.actionButton}
            onClick={handleChangePassword}
          >
            Alterar Senha
          </Button>
          <Button
            variant="outlined"
            color="primary"
            className={styles.actionButton}
            component={Link}
            href="/skills"
          >
            Ver Skills
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            className={styles.actionButton}
            onClick={() => alert('Logout clicado')}
          >
            Sair
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ProfilePage;