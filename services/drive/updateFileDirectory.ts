import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';

import { getAllFileDataById } from './helper';
import { dynamoDB } from '../common/awsService';
import { DYNAMO_DB_Table, DB_KEY } from '../common/constants';
import { BaseResponse } from '../common/response';
import { IFile } from '../types';

const appKey = `${DB_KEY}#FOLDERS_FILE`;

export const handler = middy(async (event: APIGatewayEvent) => {
  const { code } = event.queryStringParameters || {};
  const { folder } = event.pathParameters || {};
  const createdBy = event.requestContext.authorizer?.userEmail;
  const response = new BaseResponse(code);
  try {
    const files = event.body as unknown as IFile;
    const result = await getAllFileDataById(files.id);

    if (result.Items?.length) {
      const file = result.Items[0];
      const [, fileName] = file.path.split('/');
      const params = {
        TableName: DYNAMO_DB_Table || '',
        Key: {
          appKey: appKey,
          sortKey: result.Items[0].sortKey,
        },
      };
      await dynamoDB.delete(params).promise();
      await dynamoDB
        .put({
          TableName: DYNAMO_DB_Table || '',
          Item: {
            ...file,
            appKey: appKey,
            sortKey: `${folder}#${fileName}`,
            updatedDate: new Date().toISOString(),
            createdBy,
          },
        })
        .promise();
      return response.setMessage('File has been moved').response();
    } else {
      return response.setMessage("Id doesn't exists").withError().response();
    }
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
