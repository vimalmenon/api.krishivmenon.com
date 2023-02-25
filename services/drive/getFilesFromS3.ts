import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';

import { dynamoDB } from '../common/awsService';
import { DB_KEY, DYNAMO_DB_Table } from '../common/constants';
import { BaseResponse } from '../common/response';

const appKey = `${DB_KEY}#FOLDERS_FILE`;

// const columns = ['id', 'path', 'metadata', 'type', 'label', ...commonTableColumn];

export const handler = middy(async (event: APIGatewayEvent) => {
  const { code } = event.queryStringParameters || {};
  const { folder } = event.pathParameters || {};
  const response = new BaseResponse(code);
  try {
    const params = {
      TableName: DYNAMO_DB_Table || '',
      KeyConditionExpression: '#appKey = :appKey and begins_with(#sortKey, :sortKey)',
      // ProjectionExpression: columns.join(','),
      ExpressionAttributeNames: {
        '#appKey': 'appKey',
        '#sortKey': 'sortKey',
      },
      ExpressionAttributeValues: {
        ':appKey': appKey,
        ':sortKey': folder,
      },
    };
    const result = await dynamoDB.query(params).promise();
    return response.setData(result.Items).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
