import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

import { dynamoDB } from '../common/awsService';
import { DYNAMO_DB_Table, DB_KEY } from '../common/constants';
import { BaseResponse } from '../common/response';

const appKey = `${DB_KEY}#NOTE`;
const columns = ['content', 'metadata', 'title', 'updatedDate', 'createdDate', 'id'];

export const handler = middy(async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  const { code } = event.queryStringParameters || {};
  const response = new BaseResponse(code);
  try {
    const params = {
      TableName: DYNAMO_DB_Table || '',
      ProjectionExpression: columns.join(','),
      Key: {
        appKey: appKey,
        sortKey: `note#${id}`,
      },
    };
    const result = await dynamoDB.get(params).promise();
    return response.setData(result).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
