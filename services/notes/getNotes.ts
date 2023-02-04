import { BaseResponse } from "../common/response";
import { DYNAMO_DB_Table, DB_KEY } from "../common/constants";
import { dynamoDB } from "../common/awsService";

import jsonBodyParser from "@middy/http-json-body-parser";

const appKey = `${DB_KEY}#NOTE`;

import middy from "@middy/core";
import { APIGatewayEvent } from "aws-lambda/trigger/api-gateway-proxy";

export const handler = middy(async (event: APIGatewayEvent) => {
  const { code } = event.queryStringParameters || {};
  const response = new BaseResponse(code);
  try {
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
