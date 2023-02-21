import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getFoldersByParent } from './helper';
import { dynamoDB } from '../common/awsService';
import { DYNAMO_DB_Table, DB_KEY } from '../common/constants';
import { BaseResponse } from '../common/response';

const appKey = `${DB_KEY}#FOLDER`;

export const handler = middy(async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  const { code } = event.queryStringParameters || {};
  const response = new BaseResponse(code);
  try {
    const params = {
      TableName: DYNAMO_DB_Table || '',
      Key: {
        appKey: appKey,
        sortKey: `folder#${id}`,
      },
    };
    const item = (await dynamoDB.get(params).promise()).Item as any;
    await dynamoDB.delete(params).promise();
    const result = (await getFoldersByParent(item.parent)) as any;
    return response.setData(result.Items).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
