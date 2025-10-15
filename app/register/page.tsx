'use client'
import Title from "@/components/all/Title"
import LoginForm from "@/components/login/LoginForm"
import styles from "./styles.module.scss"
import { useState } from "react"
import LoginInput from "@/components/login/LoginInput"
import LoginButton from "@/components/login/LoginButton"

interface registerNecessities {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function Page() {
  const [data, setData] = useState<registerNecessities>({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  return (
    <div className={styles.contentContainer}>
      <Title />
      <LoginForm formName="Cadastro">
        <LoginInput
          required
          label="Nome Completo"
          value={data.name}
          onChange={(value: string) => {
            setData({ ...data, name: value })
          }}
        />
        <LoginInput
          required
          label="Email"
          value={data.email}
          onChange={(value: string) => {
            setData({ ...data, email: value })
          }}
        />
        <LoginInput
          required
          label="Senha"
          type="password"
          value={data.password}
          onChange={(value: string) => {
            setData({ ...data, password: value })
          }}
        />
        <LoginInput
          required
          label="Confirmar Senha"
          type="password"
          value={data.confirmPassword}
          onChange={(value: string) => {
            setData({ ...data, confirmPassword: value })
          }}
        />
        <LoginButton
          title="Cadastrar"
          color="success"
          onClick={() => {
            console.log("Cadastro:", data)
          }}
        />
        <LoginButton
          title="Já tenho conta"
          variant="text"
          onClick={() => {}}
        />
      </LoginForm>
    </div>
  )
}