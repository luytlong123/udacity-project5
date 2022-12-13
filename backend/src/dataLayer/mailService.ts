import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import mailcomposer from 'mailcomposer';

const XAWS = AWSXRay.captureAWS(AWS)


const ses = new XAWS.SES({
    apiVersion: '2010-12-01'
})

const FROM_EMAIL = process.env.FROM_EMAIL_ADDRESS

const logger = createLogger(`mailService`)

export const sendEmail = async (to: string, subject: string, message: string, attachmentURL: string, attachment: boolean) => {
    if (attachment) {
        const mail = mailcomposer({
            from: FROM_EMAIL,
            to: to,
            subject: subject,
            text: message,
            attachments: [
                {
                    path: attachmentURL
                },
            ],
        });
        
        mail.build((err:any, messageData:any) => {
            if (err) {
              logger.error(`Error sending raw email: ${err}`);
              throw new Error(`Error sending raw email: ${err}`)
            }
            ses.sendRawEmail({RawMessage: {Data: messageData}}).promise();
            logger.info(`Sendddd....`)
        });
        return
    }


    const params = {
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Body: {
                Text: {
                    Charset: "UTF-8",
                    Data: message
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
        },
        ReturnPath: FROM_EMAIL,
        Source: FROM_EMAIL,
    };

    const res = await ses.sendEmail(params).promise();
    if (res.$response.error) {
        logger.error(`Send mail fail with error ${res.$response.error}`)
    } else {
        logger.info(`Send mail success!`)
    }
};


export const verifyEmailAddress = async (email: string) => {
    const res = await ses.verifyEmailAddress({
        EmailAddress: email
    }).promise();

    if (res.$response.error) {
        logger.error(`Verify email address fail with error ${res.$response.error}`)
    } else {
        logger.info(`Verify email address success!`)
    }
}