import { apiEndpoint } from '../config'
import { MailItem } from '../types/Mail';
import { CreateMailItemRequest } from '../types/CreateMailRequest';
import Axios from 'axios'
import { UpdateMailRequest } from '../types/UpdateMailRequest';

export async function getAllMail(idToken: string): Promise<MailItem[]> {
  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/mail-items`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Todos:', response.data)
  return response.data.items
}

export async function searchItems(idToken: string,keyword:string): Promise<MailItem[]> {
  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/mail-items/search?keyword=${keyword}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Todos:', response.data)
  return response.data.items
}

export async function getItemById(idToken: string,itemId:string): Promise<MailItem> {
  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/mail-items/${itemId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Todos:', response.data)
  return response.data.item
}

export async function createMailItem(
  idToken: string,
  newTodo: CreateMailItemRequest
): Promise<MailItem> {
  const response = await Axios.post(`${apiEndpoint}/mail-items`,  JSON.stringify(newTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchMailItem(
  idToken: string,
  itemId: string,
  updated: UpdateMailRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/mail-items/${itemId}`, JSON.stringify(updated), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteMailItem(
  idToken: string,
  itemId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/mail-items/${itemId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}


export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
