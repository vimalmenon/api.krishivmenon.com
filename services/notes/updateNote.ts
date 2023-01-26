import { respondForError, respondToSuccess } from "../common/response";
import { DYNAMO_DB_Table, DB_KEY } from "../common/constants";
import { dynamoDB } from "../common/awsService";

import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

const appKey = `${DB_KEY}#NOTE`;

import middy from "@middy/core";

export const handler = middy(async (event: APIGatewayEvent) => {
  try {
    const id = event.pathParameters?.id;
    const body = event.body as any;
    const params = {
      TableName: DYNAMO_DB_Table || "",
      Key: {
        appKey: appKey,
        sortKey: `note#${id}`,
      },
      UpdateExpression: `set #title=:title , #content=:content, #updatedDate=:updatedDate`,
      ExpressionAttributeValues: {
        ":updatedDate": new Date().toISOString(),
        ":content": body.content,
        ":title": body.title,
      },
      ExpressionAttributeNames: {
        "#updatedDate": "updatedDate",
        "#content": "content",
        "#title": "title",
      },
      ReturnValues: "UPDATED_NEW",
    };
    const result = await dynamoDB.update(params).promise();
    return respondToSuccess({ message: "this is vimal menon", result });
  } catch (error) {
    respondForError({ message: error.message });
  }
}).use(jsonBodyParser());
