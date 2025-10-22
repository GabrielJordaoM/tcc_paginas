import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import styles from './Header.module.scss';

const Header = () => {
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
          <Button color="inherit" component={Link} href="/register" className={styles.navButton}>
            Cadastro
          </Button>
          <Button color="inherit" component={Link} href="/profile" className={styles.navButton}>
            Profile
          </Button>
          <Button color="inherit" component={Link} href="/board" className={styles.navButton}>
            Board
          </Button>
          <Button color="inherit" component={Link} href="/skills" className={styles.navButton}>
            Skills
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;