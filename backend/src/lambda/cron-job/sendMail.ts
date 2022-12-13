import { sendMailPending } from "../../businessLogic/mailItems"
import { createLogger } from "../../utils/logger"



const logger = createLogger("sendMailHandler")

export const handler = async () => {
    logger.info(`Start Handler send mail `)
    await sendMailPending()
    logger.info(`Finish Handler send mail `)
}