'use server'
import instance from "@/lib/api"
import { cookies } from "next/headers";

const authUrl = process.env.AUTH_SERVER;

export interface loginNecessities {
  username: string;
  password: string;
}

export async function loginAPI(data: loginNecessities): Promise<void> {
    const cookieStore = await cookies();
    console.log(`Realizando login na rota ${authUrl}`)
    const response = await instance.post(`${authUrl}/api/token/`, data);

    if(response.status == 200) {
        console.log(response.data)
        cookieStore.set("token", response.data.access)//Expires in 1h
        cookieStore.set("refresh", response.data.refresh)//Expires in 1 day
        return Promise.resolve();
    }
    return Promise.reject();
}