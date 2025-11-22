"use client";
import { useState } from "react";
import HeaderPublic from '../../components/header/HeaderPublic';
import LoginForm from "@/components/login/LoginForm";
import LoginInput from "@/components/login/LoginInput";
import LoginButton from "@/components/login/LoginButton";
import { useRouter } from "next/navigation";
import styles from "./styles.module.scss";
import { Alert, Snackbar } from "@mui/material";
import { loginAPI, loginNecessities } from "@/lib/login";


export default function Page() {
  const router = useRouter();
  const authUrl = process.env.NEXT_PUBLIC_AUTHSERVER;
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error">("error");
  const [data, setData] = useState<loginNecessities>({
    username: "",
    password: "",
  });

  function handleClose() {
    setOpen(false)
    if(severity == "success") {
      router.push("/board");
    }
  }

  function login() {
    const result = loginAPI(data);
    result.then(() => {
      setMessage("Login realizado com sucesso, redirecionando");
      setSeverity("success");
      setOpen(true);
    }).catch(() => {
      setMessage("Username e/ou Senha incorretos");
      setSeverity("error");
      setOpen(true);
    })
  }

  return (
    <div className={styles.pageWrapper} style={{ margin: 0, padding: 0 }}>
      <div className={styles.headerContainer} style={{ marginTop: 0, paddingTop: 0 }}>
        <HeaderPublic />
        <h1 className={styles.projectName}>Taskerize</h1>
      </div>
      <div className={styles.contentContainer}>
        <LoginForm formName="Login">
          <LoginInput
            required
            label="Username"
            value={data.username}
            onChange={(value: string) => {
              setData({
                ...data,
                username: value,
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
          <LoginButton title="Login" color="success" onClick={login} />
          <LoginButton title="Esqueci Minha Senha" variant="text" onClick={() => {}} />
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