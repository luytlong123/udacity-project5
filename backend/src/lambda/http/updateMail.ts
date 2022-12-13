import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils';
import {  updateMail } from '../../businessLogic/mailItems'
import { createLogger } from '../../utils/logger'
import { UpdateMailRequest } from '../../requests/UpdateMailRequest';


const logger = createLogger("createMail")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const updated: UpdateMailRequest = JSON.parse(event.body)
    const itemId = event.pathParameters.itemId
    if(!itemId||itemId.trim()===""){
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Invalid todo id`
        })
      }
    }

    const userId=getUserId(event);
    logger.info(`User ${userId} update mail item ${itemId}`)
    try {
      const item =await updateMail(itemId,userId,updated)
      return {
        statusCode: 201,
        body: JSON.stringify({item:item})
      }
    } catch (err) {
      logger.error(`Fail to update mail , error ${err}`)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error : `Fail to update mail , error ${err}`
        })
      }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
