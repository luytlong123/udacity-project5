export interface MailItem {
  userId: string
  itemId: string
  title: string
  content: string
  mailDestination: string
  sendDate: string
  sendWithAttachment: boolean
  attachmentUrl: string
  status: string
  presignedUrl?: string
}
