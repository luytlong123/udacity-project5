import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteMail } from '../../businessLogic/mailItems'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger("deleteMail")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const itemId = event.pathParameters.itemId
    if(!itemId||itemId.trim()===""){
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Invalid todo id`
        })
      }
    }

    try {
      const userId = getUserId(event);
      await deleteMail(itemId,userId);
    } catch (err) {
      logger.error(`Fail to delete Mail ${itemId}, error ${err}`)
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: `Fail to delete Mail ${itemId}, error ${err}`
        })
      }
    }

    return{
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
