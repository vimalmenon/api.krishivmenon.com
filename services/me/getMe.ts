import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';

import { dynamoDB } from '../common/awsService';
import { DB_KEY, DYNAMO_DB_Table } from '../common/constants';
import { BaseResponse } from '../common/response';

const appKey = `${DB_KEY}#PROFILE`;

export const handler = middy(async (event: APIGatewayEvent) => {
  const { code } = event.queryStringParameters || {};
  const response = new BaseResponse(code);
  const createdBy = event.requestContext.authorizer?.userEmail;
  try {
    const params = {
      TableName: DYNAMO_DB_Table || '',
      KeyConditionExpression: '#appKey = :appKey and begins_with(#sortKey, :sortKey)',
      ExpressionAttributeNames: {
        '#appKey': 'appKey',
        '#sortKey': 'sortKey',
      },
      ExpressionAttributeValues: {
        ':appKey': appKey,
        ':sortKey': createdBy,
      },
    };
    const result = await dynamoDB.query(params).promise();
    if (result.Items?.length === 0) {
    }
    return response.setData(result.Items).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
