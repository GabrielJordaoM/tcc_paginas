"use client";
import { useState } from "react";
import Header from '../../components/header/Header';
import LoginForm from "@/components/login/LoginForm";
import LoginInput from "@/components/login/LoginInput";
import LoginButton from "@/components/login/LoginButton";
import { useRouter } from "next/navigation";
import styles from "./styles.module.scss";
import { createUser, signupNecessities } from "@/lib/user";
import { Alert, Snackbar } from "@mui/material";


export default function CadastroPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error">("error");
  const [data, setData] = useState<signupNecessities>({
    name: "",
    email: "",
    password: "",
  });

  const handleClose = () => {
    setOpen(false)
  }

  const handleRegister = () => {
    createUser(data).then(() => {
      setMessage("usuário criado com sucesso")
      setSeverity("success")
      setOpen(true)
      setData({
        name: "",
        email: "",
        password: "",
      })
    })
    .catch(() => {
      setMessage("Erro na criação de usuário")
      setSeverity("error")
      setOpen(true)
    })
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerContainer}>
        <Header />
        <h1 className={styles.projectName}>Taskerize</h1>
      </div>
      <div className={styles.contentContainer}>
        <LoginForm formName="Cadastro">
          <LoginInput
            required
            label="Nome"
            value={data.name}
            onChange={(value: string) => {
              setData({
                ...data,
                name: value,
              });
            }}
          />
          <LoginInput
            required
            label="Email"
            value={data.email}
            onChange={(value: string) => {
              setData({
                ...data,
                email: value,
              });
            }}
          />
          <LoginInput
            required
            label="Senha"
            type="password"
            value={data.password}
            onChange={(value: string) => {
              setData({
                ...data,
                password: value,
              });
            }}
          />
          <LoginButton title="Cadastrar" color="success" onClick={handleRegister} />
        </LoginForm>
      </div>
      <Snackbar open={open} autoHideDuration={1000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}