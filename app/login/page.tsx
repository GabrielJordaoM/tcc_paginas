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
    <div className={styles.pageWrapper}>
      <Header />
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
          <LoginButton title="Não Tenho Conta" variant="text" onClick={() => router.push("/cadastro")} />
        </LoginForm>
      </div>
    </div>
  );
}