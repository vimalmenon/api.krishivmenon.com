import {
  BaseResponse,
} from "../common/response";
import { DYNAMO_DB_Table, DB_KEY } from "../common/constants";
import { dynamoDB } from "../common/awsService";

import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

const appKey = `${DB_KEY}#NOTE`;

import middy from "@middy/core";

export const handler = middy(async (event: APIGatewayEvent) => {
  const id = event.pathParameters?.id;
  const { code } = event.queryStringParameters || {};
  const response = new BaseResponse(code);
  try {
    dynamoDB
      .delete({
        TableName: DYNAMO_DB_Table || "",
        Key: {
          appKey: appKey,
          sortKey: `note#${id}`,
        },
      })
      .promise();
    const params = {
      TableName: DYNAMO_DB_Table || "",
      KeyConditionExpression: "#appKey = :appKey",
      ExpressionAttributeNames: {
        "#appKey": "appKey",
      },
      ExpressionAttributeValues: {
        ":appKey": appKey,
      },
    };
    const result = await dynamoDB.query(params).promise();
    return response.setData(result.Items).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
