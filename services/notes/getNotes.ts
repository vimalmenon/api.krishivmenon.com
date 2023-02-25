import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';

import { getAllNotes } from './common';
import { BaseResponse } from '../common/response';

export const handler = middy(async (event: APIGatewayEvent) => {
  const { code } = event.queryStringParameters || {};
  const response = new BaseResponse(code);
  try {
    const result = await getAllNotes();
    return response.setData(result.Items).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
