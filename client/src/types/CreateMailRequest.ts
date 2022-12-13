export interface CreateMailItemRequest {
  title: string
  content: string
  mailDestination: string
  sendDate: string
  sendWithAttachment: boolean
}
