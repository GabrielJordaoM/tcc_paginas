"use client";
import { useState } from "react";
import Header from '../../components/header/Header';
import LoginForm from "@/components/login/LoginForm";
import LoginInput from "@/components/login/LoginInput";
import LoginButton from "@/components/login/LoginButton";
import { useRouter } from "next/navigation";
import styles from "./styles.module.scss";

interface loginNecessities {
  email: string;
  password: string;
}

export default function Page() {
  const router = useRouter();
  const [data, setData] = useState<loginNecessities>({
    email: "",
    password: "",
  });

  return (
    <div className={styles.pageWrapper} style={{ margin: 0, padding: 0 }}>
      <div className={styles.headerContainer} style={{ marginTop: 0, paddingTop: 0 }}>
        <Header />
        <h1 className={styles.projectName}>Taskerize</h1>
      </div>
      <div className={styles.contentContainer}>
        <LoginForm formName="Login">
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
          <LoginButton title="Login" color="success" onClick={() => {}} />
          <LoginButton title="Esqueci Minha Senha" variant="text" onClick={() => {}} />
        </LoginForm>
      </div>
    </div>
  );
}