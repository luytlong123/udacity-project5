import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { MailItemAccess } from '../dataLayer/mailsAcess'
import { MailItem } from '../models/MailItem'
import { CreateMailItemRequest } from '../requests/CreateMailRequest'
import { generatePresignedUrl, getAttachmentUrl } from '../dataLayer/attachmentUtils'
import { CreateMailItemResponse } from '../responses/CreateMailResponse'
import { sendEmail, verifyEmailAddress } from '../dataLayer/mailService'
import { UpdateMailRequest } from '../requests/UpdateMailRequest'
import { MailUpdate } from '../models/MailUpdate'


const mailItemAccess = new MailItemAccess();
const logger = createLogger("mailItems")

export async function getAllMailItemsByUser(userId:string): Promise<MailItem[]> {
  return mailItemAccess.getAllMailItems(userId);
}

export async function searchMailItemsByUser(userId:string,keyword:string): Promise<MailItem[]> {
  return mailItemAccess.search(userId,keyword);
}

export async function createMail(
  request: CreateMailItemRequest,
  userId: string
): Promise<CreateMailItemResponse> {

  //verify email - under sanbox -> cannot send mail to unverify email
  const exist= mailItemAccess.getAllMailByEmail(request.mailDestination)
  if((await exist).length==0){
    logger.info(`New email address, going to verify this  email`)
    await verifyEmailAddress(request.mailDestination);
  }


  var attachmenturl = "";
  var presignedUrl ="";

  if(request.sendWithAttachment){
    //generate signed url for attachment
    const imageUid=uuid.v4();
    logger.info(`Start generate presigned url for attachment`)
    presignedUrl = generatePresignedUrl(imageUid);
    attachmenturl= getAttachmentUrl(imageUid)
    logger.info(`Generate presigned url success, attachmentURL : ${attachmenturl}`)
  }

  const itemId = uuid.v4();
  const saved = await mailItemAccess.createMail({
    userId:userId,
    itemId:itemId,
    title:request.title,
    content:request.content,
    mailDestination:request.mailDestination,
    sendDate:request.sendDate,
    sendWithAttachment:request.sendWithAttachment,
    attachmentUrl:attachmenturl,
    status:"PENDING"
  })

  if (presignedUrl!=""){
    return {
      ...saved,
      presignedUrl:presignedUrl,
    }
  }
  return {
    ...saved
  }
}

export async function deleteMail(
  itemId :string,
  userId: string
) {
    const item = mailItemAccess.getTodoById(itemId,userId)
    logger.info(`Start delete item :${JSON.stringify(item)}`)
    if((await item).userId!==userId){
      logger.error(`User ${userId} cannot perform this action`)
      throw new Error(`User ${userId} cannot perform this action`)
    }
    await mailItemAccess.deleteMail(itemId,userId);
}


export async function getMailById(
  itemId :string,
  userId: string
) {
    return mailItemAccess.getTodoById(itemId,userId)
}


export async function sendMailPending() {
  logger.info("Start get all pending email in 5 minutes")
  try {
    const mail = await mailItemAccess.getAllMailItemsByTime(new Date(Date.now()+7*60*60*1000))
    for (let i = 0; i < mail.length; i++) {
      if(mail[i].status=="SUCCESS"){
        continue
      }
      try {
        logger.info(`Start send mail : ${JSON.stringify(mail[i])}`)
        await sendEmail(mail[i].mailDestination,mail[i].title,mail[i].content,mail[i].attachmentUrl,mail[i].sendWithAttachment)
        await mailItemAccess.updateMailStatus(mail[i].itemId,mail[i].userId,"SUCCESS")
      } catch (mailErr) {
        logger.error(`Fail to to send mail : ${JSON.stringify(mail[i])}, error ${mailErr}`)
        await mailItemAccess.updateMailStatus(mail[i].itemId,mail[i].userId,"FAILED")
      }
    }
  } catch (error) {
    logger.error(`Fail to get mail pending in 5 minutes, error ${error}`)
    throw new Error(`Fail to get mail pending in 5 minutes, error ${error}`)
  }
}

export async function updateMail(
  itemId :string,
  userId: string,
  updatedItem :UpdateMailRequest
) {
    const item = mailItemAccess.getTodoById(itemId,userId)
    logger.info(`Update item :${JSON.stringify(item)}`)
    if((await item).userId!==userId){
      logger.error(`User ${userId} cannot perform this action`)
      throw new Error(`User ${userId} cannot perform this action`)
    }
    await mailItemAccess.updateItem(itemId,userId,updatedItem as MailUpdate)
}