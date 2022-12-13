import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from '../utils';
import { getMailById } from '../../businessLogic/mailItems';
import { createLogger } from '../../utils/logger';

const logger = createLogger("getById")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const itemId = event.pathParameters.itemId
    if (!itemId || itemId.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Invalid todo id`
        })
      }
    }
    const userId = getUserId(event);
    try {
      const mailItem = await getMailById(itemId,userId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          item: mailItem
        })
      }
    } catch (err) {
      logger.error(`Fail to get mail items by user ${userId} and uid ,error ${err}`)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        })
      }
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
