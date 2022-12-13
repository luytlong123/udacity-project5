import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { MailItem } from '../models/MailItem';
import { MailUpdate } from '../models/MailUpdate';

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('MailsAccess')

export class MailItemAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly mailsTable = process.env.MAILS_TABLE) {
    }

    async getTodoById(itemId: String, userId: String): Promise<MailItem> {
        logger.info("Get mail item by id from dynamodb");

        const result = await this.docClient.get({
            TableName: this.mailsTable,
            Key: {
                "itemId": itemId,
                "userId": userId
            },
        }).promise()

        if (!result.Item) {
            throw new Error(`Mail Item not found with id ${itemId}`)
        }

        const items = result.Item
        return items as MailItem
    }

    async getAllMailItems(userId: string): Promise<MailItem[]> {
        logger.info("Get all mail items from dynamodb");

        const result = await this.docClient.query({
            TableName: this.mailsTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as MailItem[]
    }

    async getAllMailItemsByTime(dateTime: Date): Promise<MailItem[]> {
        logger.info("Get all mail items that still not send from dynamodb");
        logger.info(`Start time : ${dateTime.toISOString()}`)
        const ft = new Date(dateTime.getTime() + 5 * 60 * 1000) // add 5 minutes

        const result = await this.docClient.scan({
            TableName: this.mailsTable,
            FilterExpression: 'sendDate between :date1 and :date2',
            ExpressionAttributeValues: {
                ':date1': dateTime.toISOString().replace('.000', ''),
                ':date2': ft.toISOString().replace('.000', '')
            }
        }).promise()

        const items = result.Items
        return items as MailItem[]
    }


    async search(userId: string, keyword: string): Promise<MailItem[]> {
        logger.info(`Search mail items : ${userId}, key: ${keyword}`);

        const result = await this.docClient.query({
            TableName: this.mailsTable,
            KeyConditionExpression: 'userId = :userId',
            FilterExpression: ' contains(content, :key) or contains (title, :key) or contains (mailDestination,:key)',
            ExpressionAttributeValues: {
                ':key': keyword,
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as MailItem[]
    }

    async getAllMailByEmail(mailReceive: string): Promise<MailItem[]> {

        const result = await this.docClient.scan({
            TableName: this.mailsTable,
            FilterExpression: '#mailDestination = :mail',
            ExpressionAttributeValues: {
                ':mail': mailReceive,
            },
            ExpressionAttributeNames: {
                '#mailDestination': 'mailDestination'
            }
        }).promise()

        const items = result.Items
        return items as MailItem[]
    }


    async updateItem(itemId: String,userId :String, item: MailUpdate) {
        logger.info(`Update mail item to dynamodb ${itemId}`, item);
        await this.docClient.update({
            TableName: this.mailsTable,
            Key: {
                "itemId": itemId,
                "userId": userId
            },
            UpdateExpression: "set title = :title , content = :content",
            ExpressionAttributeValues: {
                ":title": item.title,
                ":content": item.content,
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

        return 
    }

    async createMail(mail: MailItem): Promise<MailItem> {
        logger.info("Save mail item to dynamodb", JSON.stringify(mail));
        try {
            const date = new Date(mail.sendDate)
            if(date<=new Date()){
                logger.error(`sendDate must after current time`)
                throw new Error(`sendDate must after current time`)
            }
            mail.sendDate = date.toISOString().replace('.000', '')
        } catch (error) {
            throw new Error(`Invalid sendDate , error ${error}`)
        }
        await this.docClient.put({
            TableName: this.mailsTable,
            Item: mail
        }).promise()

        return mail
    }



    async updateMailStatus(mailId: string, userId: string, status: string) {
        logger.info(`Update mail status ${mailId}`);
        await this.docClient.update({
            TableName: this.mailsTable,
            Key: {
                "itemId": mailId,
                "userId": userId
            },
            UpdateExpression: "set #status = :status",
            ExpressionAttributeValues: {
                ":status": status,
            },
            ExpressionAttributeNames: {
                "#status": "status"
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

        return
    }

    async deleteMail(itemId: string, userId: String) {
        logger.info(`Start delete mail item from dynamodb `)
        await this.docClient.delete({
            TableName: this.mailsTable,
            Key: {
                "itemId": itemId,
                "userId": userId
            }
        }).promise();
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}
