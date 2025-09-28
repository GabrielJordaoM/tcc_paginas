import styles from "./styles.module.scss";
import React from "react";

export default function Layout({children}: {children: React.ReactNode}){
    return(
        <div
            className={styles.mainContainer}
        >
            {children}
        </div>
    )
}