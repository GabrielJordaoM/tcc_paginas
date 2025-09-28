import { Button } from "@mui/material";
import styles from "./login.module.scss"

interface LoginButtonProps {
    variant?: "contained" | "outlined" | "text",
    color?: "primary" | "warning" | "error" | "success",
    title: string,
    disabled?: boolean
    onClick: () => void,
}

export default function LoginButton({
    variant="contained",
    color='primary',
    title,
    onClick
}: LoginButtonProps){
    return(
        <Button
            style={{
                margin: "10px 6px"
            }}
            className={styles.inputContainer}
            variant={variant}
            color={color}
            onClick={onClick}
        >{title}</Button>
    )
}