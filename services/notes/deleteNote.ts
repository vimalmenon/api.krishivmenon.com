import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getAllNotes } from './common';
import { dynamoDB } from '../common/awsService';
import { DYNAMO_DB_Table, DB_KEY } from '../common/constants';
import { BaseResponse } from '../common/response';

const appKey = `${DB_KEY}#NOTE`;

export const handler = middy(async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  const { code } = event.queryStringParameters || {};
  const response = new BaseResponse(code);
  try {
    await dynamoDB
      .delete({
        TableName: DYNAMO_DB_Table || '',
        Key: {
          appKey: appKey,
          sortKey: `note#${id}`,
        },
      })
      .promise();
    const result = await getAllNotes();
    return response.setData(result.Items).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
