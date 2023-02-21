import { randomUUID } from "crypto";
import { BaseResponse } from "../common/response";
import { DYNAMO_DB_Table, DB_KEY } from "../common/constants";
import { dynamoDB } from "../common/awsService";

import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

const appKey = `${DB_KEY}#NOTE`;

import middy from "@middy/core";

export const handler = middy(async (event: APIGatewayEvent) => {
  const { code } = event.queryStringParameters || {};
  const note = event.body as any;
  const uid = randomUUID();
  const response = new BaseResponse(code);
  const createdBy = event.requestContext.authorizer?.userEmail;

  try {
    await dynamoDB
      .put({
        TableName: DYNAMO_DB_Table || "",
        Item: {
          appKey: appKey,
          sortKey: `note#${uid}`,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          createdBy,
          id: uid,
          title: note.title || "",
          content: note.content || "",
          metadata: note.metadata || {},
        },
      })
      .promise();
    const result = await dynamoDB
      .query({
        TableName: DYNAMO_DB_Table || "",
        KeyConditionExpression: "#appKey = :appKey",
        ExpressionAttributeNames: {
          "#appKey": "appKey",
        },
        ExpressionAttributeValues: {
          ":appKey": appKey,
        },
      })
      .promise();
    return response.setData(result.Items).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
