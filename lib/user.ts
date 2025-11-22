"use server"

import { cornersOfRectangle } from "@dnd-kit/core/dist/utilities/algorithms/helpers";
import instance from "./api";
import { cookies } from "next/headers";
import { getValueAndVerify } from "./jwt";

const userUrl = process.env.USER_SERVER

export interface signupNecessities {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

interface singupRequest {
    username: string,
    first_name: string,
    last_name: string,
    email: string,
    lideranca: boolean,
    password: string,
    cargo: string
}

export async function createUser(data: signupNecessities): Promise<void> {
    const names = data.name.split(" ");
    const first_name = names[0];
    const last_name = names.slice(1).join(" ");

    const request: singupRequest = {
        email: data.email,
        username: data.email,
        first_name,
        last_name,
        lideranca: false,
        password: data.password,
        cargo: "default"
    }

    console.log(`creating user at url ${userUrl}`)

    const response = await instance.post(`${userUrl}/api/`, request)

    console.log(response.status)
    console.log(response.data)

    if(response.status == 201) {
        return Promise.resolve();
    }
    return Promise.reject();
}

export async function getUser(): Promise<User> {
    const cookieStore = await cookies();
    const cookie_token = cookieStore.get("token")
    if(cookie_token == null) {
        return Promise.reject("Null token");
    }

    const payload = getValueAndVerify(cookie_token.value)

    if(payload == null) {
        return Promise.reject("Invalid JWT");
    }

    const uuid = payload.user_id;

    const response = await instance.get(`${userUrl}/api/get/${uuid}`)

    if(response.status == 200) {
        const data = response.data
        const user = {
            id: data.id,
            name: `${data.first_name} ${data.last_name}`,
            email: data.email,
        } as User
        return Promise.resolve(user)
    }else {
        return Promise.reject("Request has failed")
    }
}

export async function getAllUsers(): Promise<User[]> {
    const response = await instance.get(`${userUrl}/api/get`)

    if(response.status != 200){
        return Promise.reject("Erro na solicitação dos usuário")
    }

    const list = response.data as any[]

    return list.map((data) => ({
            id: data.id,
            name: `${data.first_name} ${data.last_name}`,
            email: data.email,
    }as User))
}