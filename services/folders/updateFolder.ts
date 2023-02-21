import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

import { dynamoDB } from '../common/awsService';
import { DYNAMO_DB_Table, DB_KEY } from '../common/constants';
import { BaseResponse } from '../common/response';

const appKey = `${DB_KEY}#FOLDER`;

export const handler = middy(async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  const body = event.body as any;
  const response = new BaseResponse();
  try {
    const params = {
      TableName: DYNAMO_DB_Table || '',
      Key: {
        appKey: appKey,
        sortKey: `folder#${id}`,
      },
      UpdateExpression: `set #label=:label , #metadata=:metadata, #updatedDate=:updatedDate`,
      ExpressionAttributeValues: {
        ':updatedDate': new Date().toISOString(),
        ':label': body.label,
        ':metadata': body.metadata,
      },
      ExpressionAttributeNames: {
        '#updatedDate': 'updatedDate',
        '#label': 'label',
        '#metadata': 'metadata',
      },
      ReturnValues: 'UPDATED_NEW',
    };
    const result = await dynamoDB.update(params).promise();
    return response.setData(result).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
