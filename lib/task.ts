"use server"

import { cornersOfRectangle } from "@dnd-kit/core/dist/utilities/algorithms/helpers";
import instance from "./api";
import { getAllUsers, User } from "./user";
import { AxiosResponse } from "axios";

const taskUrl = process.env.TASK_SERVER
const userUrl = process.env.USER_SERVER

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  assignee: User;
  technologies: string[];
  mode?: "aprendizado" | "efetivo";
};

export type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

export type AiChoice = {
  user: User,
  reason: string,
  hoursToComplete: number,
}

export async function getTasks(): Promise<Column[]> {
    const responseTask = await instance.get(`${taskUrl}/api/task/`)
    const responseUsers = await instance.get(`${userUrl}/api/get`);

    if(responseTask.status != 200) {
        return Promise.reject("Erro na solicitação de tasks")
    }

    if(responseUsers.status != 200) {
        return Promise.reject("Erro na solicitação de Users")
    }

    const taskData = responseTask.data as any[];
    const usersData = responseUsers.data as any[];

    console.log(usersData)

    const usersMap = new Map<String, User>(
      usersData.map((item) => {
        const u = {
          email: item.email,
          id: item.id,
          name: `${item.first_name} ${item.last_name}`
        } as User

        return [item.id, u]
      })
    )

    let i = 0
    const columnsMap: Record<string, Column> = taskData.reduce((acc, item) => {
      const task = {
        id: item.id,
        assignee: usersMap.get(item.id_user),
        description: item.descricao,
        dueDate: item.prazo,
        title: item.titulo,
        technologies: item.skills,
      } as Task;

      const status = item.status

      if(!acc[status]) {
        acc[status] = {
          id: `${i++}`,
          title: item.status,
          tasks: []
        } as Column
      }

      acc[status].tasks.push(task);

      return acc;
    } ,{} as Record<string, Column>)

    const columnsList = Object.values(columnsMap)

    console.log(columnsList)

    return Promise.resolve(columnsList)
}

export async function setTask(task: Task, column: Column): Promise<Task> {
  let response: AxiosResponse

  const responseUsers = await instance.get(`${userUrl}/api/get`);
  if(responseUsers.status != 200) {
      return Promise.reject("Erro na solicitação de Users")
  }

  const usersData = responseUsers.data as any[];
  const usersMap = new Map<String, User>(
    usersData.map((item) => {
      const u = {
        email: item.email,
        id: item.id,
        name: `${item.first_name} ${item.last_name}`
      } as User

      return [item.id, u]
    })
  )

  if(task.id == "0"){
    console.warn("Saving new skill")
    response = await instance.post(`${taskUrl}/api/task/create/`, {
      id_user: task.assignee?.id,
      titulo: task.title,
      descricao: task.description,
      skills: task.technologies,
      prazo: task.dueDate,
      status: column.title
    })
  }else {
    console.warn("Patching skill")
    response = await instance.patch(`${taskUrl}/api/task/patch/${task.id}/`, {
      id_user: task.assignee?.id,
      titulo: task.title,
      descricao: task.description,
      skills: task.technologies,
      prazo: task.dueDate,
      status: column.title
    })
  }
  
  if(response.status != 200 && response.status != 201) {
    console.log(`Falha em salvar Task: ${response.data}`)
    return Promise.reject("Falha em persistir no banco de dados") 
  }
  
  const data = response.data;

  const returnTask = {
    id: data.id,
    assignee: usersMap.get(data.id_user),
    description: data.descricao,
    dueDate: data.prazo,
    title: data.titulo,
    technologies: data.skills,
  } as Task

  return Promise.resolve(returnTask)
}

export async function deleteTask(task: Task): Promise<void> {
  const response = await instance.delete(`${taskUrl}/api/task/deletar/${task.id}/`)

  if(response.status == 204) {
    return Promise.resolve()
  }

  return Promise.reject("Erro na deleção da task")
}

export async function setTaskIA(task: Task, mode: "proficiency" | "knowledge"): Promise<AiChoice> {
  let users: User[]
  try{
    users = await getAllUsers();
  }catch(err){
    return Promise.reject()
  }

  const response = await instance.get(`${taskUrl}/api/task/selectUser/${task.id}/?mode=${mode}`) 

  if(response.status != 200) {
    return Promise.reject("Falha na solcitação da IA")
  }

  const data = response.data
  const topChoice = data.topChoice as string
  const hoursToComplete = data.hoursToCompleteTask as number
  const reason = data.reasonWhyTopChoiceIsBetter as string

  const user = users.find((u) => u.id === topChoice)

  reason.replaceAll(topChoice, user.name)

  return Promise.resolve({
    hoursToComplete,
    reason,
    user
  } as AiChoice)
}