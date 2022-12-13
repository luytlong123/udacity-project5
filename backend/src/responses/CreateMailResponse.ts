
export interface CreateMailItemResponse {
  itemId: string
  title: string
  content: string
  mailDestination: string
  sendDate: string
  sendWithAttachment: boolean,
  presignedUrl?: string
}
