import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getFoldersByParent } from './helper';
import { BaseResponse } from '../common/response';

export const handler = middy(async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  const response = new BaseResponse();
  try {
    const result = await getFoldersByParent(id || '');
    return response.setData(result.Items).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
