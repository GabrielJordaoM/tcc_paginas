'use client'
import Title from "@/components/all/Title";
import LoginForm from "@/components/login/LoginForm";
import styles from "./styles.module.scss"
import { useState } from "react";
import LoginInput from "@/components/login/LoginInput";
import LoginButton from "@/components/login/LoginButton";
import { useRouter } from "next/navigation"

interface loginNecessities {
    email: string,
    password: string,
}

export default function Page(){
      const router = useRouter()
    const [data, setData] = useState<loginNecessities>({
        email: "",
        password: ""
    });


    return(
        <div 
        className={styles.contentContainer}
        >
            <Title/>
            <LoginForm formName="Login">
                <LoginInput 
                required
                label="Email"
                value={data.email}
                onChange={(value: string) => {
                    setData({
                        ...data,
                        email: value
                    })
                }}/>
                <LoginInput 
                required
                label="Senha"
                type="password"
                value={data.password}
                onChange={(value: string) => {
                    setData({
                        ...data,
                        password: value
                    })
                }}/>
                <LoginButton title="Login" color="success" onClick={() => {}}/>
                <LoginButton title="Esqueci Minha Senha" variant="text" onClick={() => {}}/>
                    <LoginButton title="Ja Tenho Conta" variant="text" onClick={() => router.push("/register")}/>
            </LoginForm>
        </div>
    )
}