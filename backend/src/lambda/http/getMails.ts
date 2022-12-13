import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from '../utils';
import { getAllMailItemsByUser } from '../../businessLogic/mailItems';
import { createLogger } from '../../utils/logger';

const logger = createLogger("getAllMail")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId=getUserId(event);
    try{
      const mailItems =await getAllMailItemsByUser(userId);
  
      return {
        statusCode: 200,
        body: JSON.stringify({
          items:mailItems
        })
      }
    }catch(err){
      logger.error(`Fail to get all mail items by user ${userId},error ${err}`)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error : err
        })
      }
    }
})

handler.use(
  cors({
    credentials: true
  })
)
