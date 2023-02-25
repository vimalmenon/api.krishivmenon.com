import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';

import { dynamoDB } from '../common/awsService';
import { verifier } from '../common/cognitoVerifier';
import { commonTableColumn, DB_KEY, DYNAMO_DB_Table } from '../common/constants';
import { BaseResponse } from '../common/response';

const appKey = `${DB_KEY}#PROFILE`;

const columns = ['#name', 'email', '#role', 'provider', 'avatar', ...commonTableColumn];

export const handler = middy(async (event: APIGatewayEvent) => {
  const { code } = event.queryStringParameters || {};
  const response = new BaseResponse(code);
  const { userEmail, token } = event.requestContext.authorizer || {};
  try {
    const params = {
      TableName: DYNAMO_DB_Table || '',
      ProjectionExpression: columns.join(','),
      ExpressionAttributeNames: {
        '#name': 'name',
        '#role': 'role',
      },
      Key: {
        appKey: appKey,
        sortKey: userEmail,
      },
    };
    const result = await dynamoDB.get(params).promise();

    if (!result.Item) {
      const tokenResult = await verifier.verify(token);
      const provider = (tokenResult.identities as any)?.providerName;
      await dynamoDB
        .put({
          TableName: DYNAMO_DB_Table || '',
          Item: {
            appKey: appKey,
            sortKey: userEmail,
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            createdBy: userEmail,
            name: tokenResult.given_name,
            email: userEmail,
            role: 'Admin',
            provider,
            avatar: tokenResult.picture,
          },
        })
        .promise();
      const result = await dynamoDB.get(params).promise();
      return response.setData(result.Item).response();
    } else {
      return response.setData(result.Item).response();
    }
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
