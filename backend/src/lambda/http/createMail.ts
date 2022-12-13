import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils';
import { createMail } from '../../businessLogic/mailItems'
import { createLogger } from '../../utils/logger'
import { CreateMailItemRequest } from '../../requests/CreateMailRequest';


const logger = createLogger("createMail")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateMailItemRequest = JSON.parse(event.body)
    

    const userId=getUserId(event);
    logger.info(`User ${userId} create new mail item ${newTodo}`)
    try {
      const item =await createMail(newTodo,userId)
      return {
        statusCode: 201,
        body: JSON.stringify({item:item})
      }
    } catch (err) {
      logger.error(`Fail to create new mail , error ${err}`)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error : `Fail to create new mail , error ${err}`
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
