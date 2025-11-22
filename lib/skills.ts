"use server"

import instance from "./api";
import { AxiosResponse } from "axios";

const skillsUrl = process.env.SKILLS_SERVER

export interface Skill{
    id: number
    name: string,
    level: number,
    learning: boolean
}

export async function getUserSkills(): Promise<Skill[]> {
    const response = await instance.get(`${skillsUrl}/api/skill`)
    
    if(response.status != 200) {
        return Promise.reject("Failure to request skill")
    }

    const data = response.data as any[]
    const skills = data.map((value) => {
        return {
            id: value.id,
            name: value.skill,
            learning: value.aprendendo,
            level: value.proeficiencia
        } as Skill
    });
    return Promise.resolve(skills);
}

export async function setSkill(skill: Skill): Promise<Skill> {
    let response: AxiosResponse

    if(skill.id == 0) {
        console.warn("Saving new skill")
        response = await instance.post(`${skillsUrl}/api/skill/create/`, {
            skill: skill.name,
            proeficiencia: skill.level,
            aprendendo: skill.learning
        })
        console.error(response.data)
    }else {
        console.warn("patching skill")
        response = await instance.patch(`${skillsUrl}/api/skill/patch/${skill.id}`, {
            skill: skill.name,
            proeficiencia: skill.level,
            aprendendo: skill.learning
        });
    }
    
    if(response.status != 200 && response.status != 201) {
        console.error(`Erro persistindo ${response}`)
        return Promise.reject("Erro persistindo skill no banco de dados")
    }

    const data = response.data;
    console.warn(data)
    const newSkill: Skill = {
        id: data.id,
        name: data.skill,
        learning: data.aprendendo,
        level: data.proeficiencia
    }

    return Promise.resolve(newSkill);
}

export async function deleteSkill(skill: Skill): Promise<void> {
    const response = await instance.delete(`${skillsUrl}/api/skill/delete/${skill.id}`)

    if(response.status == 204) {
        return Promise.resolve();
    }

    return Promise.reject("Falha em deletar a habilidade");
}