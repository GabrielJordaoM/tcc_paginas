import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import styles from './Header.module.scss';

const HeaderPublic = () => {
  return (
    <AppBar position="static" className={styles.header}>
      <Toolbar className={styles.toolbar}>
        <Typography variant="h6" component={Link} href="/"  className={styles.logo}>
          Taskerize
        </Typography>
        <Box className={styles.navLinks}>
          <Button color="inherit" component={Link} href="/login" className={styles.navButton}>
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderPublic;