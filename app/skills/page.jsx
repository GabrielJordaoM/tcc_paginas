"use client";
import { useState } from 'react';
import { Box, Button, Grid, Paper, Typography, Modal, TextField, FormControlLabel, Checkbox } from '@mui/material';
import Header from '../../components/header/Header';
import styles from './styles.module.scss';

const initialSkills = [
  { name: 'HTML', level: 90, learning: false },
  { name: 'CSS', level: 85, learning: false },
  { name: 'JavaScript', level: 80, learning: false },
  { name: 'SASS', level: 75, learning: false },
  { name: 'React', level: 90, learning: false },
  { name: 'Next.js', level: 85, learning: false },
  { name: 'Python', level: 70, learning: false },
  { name: 'Django', level: 65, learning: false },
  { name: 'Django Rest', level: 60, learning: false },
  { name: 'Comunicacao', level: 80, learning: false },
  { name: 'Docker', level: 70, learning: false },
  { name: 'SQL', level: 75, learning: false },
  { name: 'PostgreSQL', level: 70, learning: false },
  { name: 'Java', level: 65, learning: false },
  { name: 'React Native', level: 60, learning: false },
  { name: 'Spring Boot', level: 55, learning: false },
  { name: 'Seguranca', level: 50, learning: false },
  { name: 'ESG', level: 45, learning: false },
];

export default function Skills() {
  const [skillList, setSkillList] = useState(initialSkills);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState(0);
  const [isLearning, setIsLearning] = useState(false);

  const handleOpenModal = (skill) => {
    setSelectedSkill(skill);
    setSkillName(skill ? skill.name : '');
    setSkillLevel(skill ? skill.level : 0);
    setIsLearning(skill ? skill.learning : false);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSkill(null);
  };

  const handleSaveChanges = () => {
    if (selectedSkill) {
      // Edit existing skill
      setSkillList(skillList.map((skill) =>
        skill.name === selectedSkill.name
          ? { ...skill, name: skillName, level: skillLevel, learning: isLearning }
          : skill
      ));
    } else {
      // Add new skill
      setSkillList([...skillList, { name: skillName, level: skillLevel, learning: isLearning }]);
    }
    handleCloseModal();
  };

  const addSkill = () => {
    setSelectedSkill(null);
    setSkillName('');
    setSkillLevel(0);
    setIsLearning(false);
    setOpenModal(true);
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Box className={styles.container}>
        <main className={styles.main}>
          <Typography variant="h4" gutterBottom>
            Taskrize
          </Typography>
          <Typography variant="h6">Skills</Typography>
          <Typography variant="subtitle1">As suas habilidades</Typography>
          <Grid container spacing={2} className={styles.grid}>
            {skillList.map((skill, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Paper elevation={3} className={styles.skillCard}>
                  <Typography variant="body1">{skill.name}</Typography>
                  <div className={styles.progress}>
                    <div
                      className={styles.progressBar}
                      style={{
                        width: `${skill.level}%`,
                        backgroundColor: skill.learning ? '#ab47bc' : '#4caf50',
                      }}
                    ></div>
                  </div>
                  <Button variant="outlined" size="small" onClick={() => handleOpenModal(skill)}>
                    Editar
                  </Button>
                </Paper>
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={addSkill}
                className={styles.addButton}
              >
                Adicionar Nova
              </Button>
            </Grid>
          </Grid>
        </main>
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box className={styles.modal}>
            <Typography variant="h6">Editar Habilidade</Typography>
            <TextField
              label="Nome da Habilidade"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Nível (0-100)"
              type="number"
              value={skillLevel}
              onChange={(e) => setSkillLevel(Math.min(100, Math.max(0, Number(e.target.value))))}
              fullWidth
              margin="normal"
            />
            <FormControlLabel
              control={<Checkbox checked={isLearning} onChange={(e) => setIsLearning(e.target.checked)} />}
              label="Estou Aprendendo"
            />
            <Button variant="contained" color="primary" onClick={handleSaveChanges}>
              Salvar
            </Button>
            <Button variant="outlined" onClick={handleCloseModal} style={{ marginLeft: '10px' }}>
              Cancelar
            </Button>
          </Box>
        </Modal>
      </Box>
    </div>
  );
}