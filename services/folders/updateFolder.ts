import { respondForError, respondToSuccess } from "../common/response";
import { DYNAMO_DB_Table, DB_KEY } from "../common/constants";
import { dynamoDB } from "../common/awsService";

import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

const appKey = `${DB_KEY}#FOLDER`;

import middy from "@middy/core";

export const handler = middy(async (event: APIGatewayEvent) => {
  const id = event.pathParameters?.id;
  const body = event.body as any;
  try {
    const params = {
      TableName: DYNAMO_DB_Table || "",
      Key: {
        appKey: appKey,
        sortKey: `folder#${id}`,
      },
      UpdateExpression: `set #label=:label , #metadata=:metadata, #updatedDate=:updatedDate`,
      ExpressionAttributeValues: {
        ":updatedDate": new Date().toISOString(),
        ":label": body.label,
        ":metadata": body.metadata,
      },
      ExpressionAttributeNames: {
        "#updatedDate": "updatedDate",
        "#label": "label",
        "#metadata": "metadata",
      },
      ReturnValues: "UPDATED_NEW",
    };
    const result = await dynamoDB.update(params).promise();
    return respondToSuccess(result);
  } catch (error) {
    return respondForError({ message: error.message });
  }
}).use(jsonBodyParser());
