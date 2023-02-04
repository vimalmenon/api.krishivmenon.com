import { BaseResponse } from "../common/response";
import { DYNAMO_DB_Table, DB_KEY } from "../common/constants";
import { dynamoDB } from "../common/awsService";

import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

const appKey = `${DB_KEY}#FOLDER`;

import middy from "@middy/core";
import { getFoldersByParent } from "./helper";

export const handler = middy(async (event: APIGatewayEvent) => {
  const id = event.pathParameters?.id;
  const { code } = event.queryStringParameters || {};
  const body = event.body as any;
  const response = new BaseResponse(code);
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
    await dynamoDB.update(params).promise();
    const result = await getFoldersByParent(body.parent);
    return response.setData(result.Items).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
