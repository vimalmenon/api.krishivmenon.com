import { randomUUID } from 'crypto';

import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getAllNotes } from './common';
import { dynamoDB } from '../common/awsService';
import { DYNAMO_DB_Table, DB_KEY } from '../common/constants';
import { BaseResponse } from '../common/response';
import { INote } from '../types';

const appKey = `${DB_KEY}#NOTE`;

export const handler = middy(async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const { code } = event.queryStringParameters || {};
  const note = event.body as unknown as INote;
  const uid = randomUUID();
  const response = new BaseResponse(code);
  const createdBy = event.requestContext.authorizer?.userEmail;

  try {
    await dynamoDB
      .put({
        TableName: DYNAMO_DB_Table || '',
        Item: {
          appKey: appKey,
          sortKey: `note#${uid}`,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          createdBy,
          id: uid,
          title: note.title || '',
          content: note.content || '',
          metadata: note.metadata || {},
        },
      })
      .promise();
    const result = await getAllNotes();
    return response.setData(result.Items).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
