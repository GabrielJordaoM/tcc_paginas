import { TextField } from "@mui/material"
import styles from './login.module.scss'

interface LoginInputProps {
    label: string,
    value: string,
    type?: "text" | "password",
    required?: boolean,
    onChange: (value: string) => void
}

export default function LoginInput({label, value, onChange, type="text", required=false}: LoginInputProps){
    return(
        <div
        className={styles.inputContainer}
        >
            <TextField
                required={required}
                type={type}
                className={styles.input}
                label={label}
                variant="outlined"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
            />
        </div>
    )
}