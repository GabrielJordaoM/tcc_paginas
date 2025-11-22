"use client";
import { useEffect, useState } from 'react';
import { Box, Button, Grid, Paper, Typography, Modal, TextField, FormControlLabel, Checkbox, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import Header from '../../components/header/Header';
import styles from './styles.module.scss';
import {deleteSkill, getUserSkills, setSkill, Skill} from "@/lib/skills";

const predefinedSkills = [
  'HTML', 'CSS', 'JavaScript', 'SASS', 'React', 'Next.js', 'Python', 'Django',
  'Django Rest', 'Comunicacao', 'Docker', 'SQL', 'PostgreSQL', 'Java',
  'React Native', 'Spring Boot', 'Seguranca', 'ESG'
];


export default function Skills() {
  const [skillList, setSkillList] = useState<Skill[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill>(null);
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState(1);
  const [isLearning, setIsLearning] = useState(false);

  useEffect(() => {
    getUserSkills().then((res) => {
      setSkillList(res);
    }).catch((err) => {
      console.log(`Error fetching skills, because`)
    });
  },[]);

  const handleOpenModal = (skill) => {
    setSelectedSkill(skill);
    setSkillName(skill ? skill.name : predefinedSkills[0]);
    setSkillLevel(skill ? skill.level : 1);
    setIsLearning(skill ? skill.learning : false);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSkill(null);
  };

  const isDuplicateSkill = (name) => {
    return skillList.some(skill => skill.name === name && (!selectedSkill || skill.name !== selectedSkill.name));
  };

  const isSaveDisabled = () => {
    if (!predefinedSkills.includes(skillName)) return true;
    if (selectedSkill) {
      // For editing, disable if no changes are made
      return (
        selectedSkill.name === skillName &&
        selectedSkill.level === skillLevel &&
        selectedSkill.learning === isLearning
      );
    }
    // For adding new, disable if skill already exists
    return isDuplicateSkill(skillName);
  };

  const handleSaveChanges = () => {
    if (!predefinedSkills.includes(skillName) || isDuplicateSkill(skillName)) return;

    if (selectedSkill) {
      const updated_skill = {
        id: selectedSkill.id,
        name: skillName,
        level: skillLevel,
        learning: isLearning
      } as Skill
      setSkill(updated_skill).then((res) => {
        setSkillList(skillList.map((skill) =>
          skill.id === selectedSkill.id
            ? res
            : skill
        ));
      }).catch(() => {
        console.log("Erro ao salvar a skill")
      })
      // Edit existing skill
    } else {
      // Add new skill
      setSkill({id: 0, name: skillName, level: skillLevel, learning: isLearning })
      .then((res) => {
        setSkillList([...skillList, res]);
      }).catch(() => {
        console.log("Erro ao salvar a skill")
      })
    }
    handleCloseModal();
  };

  const handleDeleteSkill = (skillToDelete) => {
    deleteSkill(skillToDelete)
    .then(() => {
      setSkillList(skillList.filter(skill => skill.name !== skillToDelete.name));
    })
    .catch((err) => {
      alert("Falha na exclusão da Habilidade")
      console.error(err)
    })
    .finally(() => {
      handleCloseModal();
    })
  };

  const addSkill = () => {
    setSelectedSkill(null);
    setSkillName(predefinedSkills[0]);
    setSkillLevel(1);
    setIsLearning(false);
    setOpenModal(true);
  };

  // Separate skills into learned and learning
  const learnedSkills = skillList.filter(skill => !skill.learning);
  const learningSkills = skillList.filter(skill => skill.learning);

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Box className={styles.container}>
        <main className={styles.main}>
          <Typography variant="h4" gutterBottom color={"black"}>
            Taskrize
          </Typography>
          <Typography variant="h6" color={"black"}>Skills</Typography>
          <Typography variant="subtitle1" color={"black"}>Habilidades Dominadas</Typography>
          <Grid container spacing={2} className={styles.grid}>
            {learnedSkills.map((skill, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Paper elevation={3} className={styles.skillCard}>
                  <Typography variant="body1">{skill.name}</Typography>
                  <div className={styles.progress}>
                    <div
                      className={styles.progressBar}
                      style={{
                        width: `${skill.level * 10}%`, // Scale 1-10 to 10-100% for display
                        backgroundColor: '#4caf50',
                      }}
                    ></div>
                  </div>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" size="small" onClick={() => handleOpenModal(skill)}>
                      Editar
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteSkill(skill)}
                    >
                      Excluir
                    </Button>
                  </Box>
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
                disabled={skillList.length >= predefinedSkills.length} // Disable if all skills are added
              >
                Adicionar Nova
              </Button>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" sx={{ marginTop: 4 }} color={"black"}>
            Habilidades em Aprendizado
          </Typography>
          <Grid container spacing={2} className={styles.grid}>
            {learningSkills.map((skill, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Paper elevation={3} className={styles.skillCard}>
                  <Typography variant="body1">{skill.name}</Typography>
                  <div className={styles.progress}>
                    <div
                      className={styles.progressBar}
                      style={{
                        width: `${skill.level * 10}%`, // Scale 1-10 to 10-100% for display
                        backgroundColor: '#ab47bc',
                      }}
                    ></div>
                  </div>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" size="small" onClick={() => handleOpenModal(skill)}>
                      Editar
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteSkill(skill)}
                    >
                      Excluir
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </main>
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box className={styles.modal}>
            <Typography variant="h6">{selectedSkill ? 'Editar Habilidade' : 'Adicionar Habilidade'}</Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Nome da Habilidade</InputLabel>
              <Select
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                label="Nome da Habilidade"
              >
                {predefinedSkills.map((skill) => (
                  <MenuItem key={skill} value={skill}>
                    {skill}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Nível (1-10)"
              type="number"
              value={skillLevel}
              onChange={(e) => setSkillLevel(Math.min(10, Math.max(1, Number(e.target.value))))}
              fullWidth
              margin="normal"
              inputProps={{ min: 1, max: 10 }}
            />
            <FormControlLabel
              control={<Checkbox checked={isLearning} onChange={(e) => setIsLearning(e.target.checked)} />}
              label="Estou Aprendendo"
            />
            <Box sx={{ display: 'flex', gap: 1, marginTop: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveChanges}
                disabled={isSaveDisabled()}
              >
                Salvar
              </Button>
              {selectedSkill && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteSkill(selectedSkill)}
                >
                  Excluir
                </Button>
              )}
              <Button variant="outlined" onClick={handleCloseModal}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </div>
  );
}