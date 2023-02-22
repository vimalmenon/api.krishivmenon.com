import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayEvent } from 'aws-lambda';

import { dynamoDB } from '../common/awsService';
import { DYNAMO_DB_Table, DB_KEY } from '../common/constants';
import { BaseResponse } from '../common/response';
import { INote } from '../types';

const appKey = `${DB_KEY}#NOTE`;

export const handler = middy(async (event: APIGatewayEvent) => {
  const id = event.pathParameters?.id;
  const body = event.body as unknown as INote;
  const { code } = event.queryStringParameters || {};
  const response = new BaseResponse(code);
  try {
    await dynamoDB
      .update({
        TableName: DYNAMO_DB_Table || '',
        Key: {
          appKey: appKey,
          sortKey: `note#${id}`,
        },
        UpdateExpression: `set #title=:title , #content=:content, #updatedDate=:updatedDate,  #metadata=:metadata`,
        ExpressionAttributeValues: {
          ':updatedDate': new Date().toISOString(),
          ':content': body.content,
          ':title': body.title,
          ':metadata': body.metadata,
        },
        ExpressionAttributeNames: {
          '#updatedDate': 'updatedDate',
          '#content': 'content',
          '#title': 'title',
          '#metadata': 'metadata',
        },
        ReturnValues: 'UPDATED_NEW',
      })
      .promise();
    const params = {
      TableName: DYNAMO_DB_Table || '',
      KeyConditionExpression: '#appKey = :appKey',
      ExpressionAttributeNames: {
        '#appKey': 'appKey',
      },
      ExpressionAttributeValues: {
        ':appKey': appKey,
      },
    };
    const result = await dynamoDB.query(params).promise();
    return response.setData(result.Items).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
