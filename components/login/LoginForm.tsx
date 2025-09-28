import { Colors } from "@/consts/colors";
import React from "react";
import styles from './login.module.scss'

interface FormProps {
    formName: string,
    children: React.ReactNode
}

export default function LoginForm(
    {formName, children}: FormProps
){
    return(
        <form
        className={styles.formContainer}
        >
            <h2
            className={styles.formTitle}
            >{formName}</h2>
            {children}
        </form>
    );
}