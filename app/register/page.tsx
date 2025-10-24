"use client";
import { useState } from "react";
import Header from '../../components/header/Header';
import LoginForm from "@/components/login/LoginForm";
import LoginInput from "@/components/login/LoginInput";
import LoginButton from "@/components/login/LoginButton";
import { useRouter } from "next/navigation";
import styles from "./styles.module.scss";

interface signupNecessities {
  name: string;
  email: string;
  password: string;
}

export default function CadastroPage() {
  const router = useRouter();
  const [data, setData] = useState<signupNecessities>({
    name: "",
    email: "",
    password: "",
  });

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
          <LoginButton title="Cadastrar" color="success" onClick={() => {}} />
          <LoginButton title="Já Tenho Conta" variant="text" onClick={() => router.push("/login")} />
        </LoginForm>
      </div>
    </div>
  );
}