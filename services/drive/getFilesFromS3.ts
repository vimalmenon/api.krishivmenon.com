import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent } from "aws-lambda/trigger/api-gateway-proxy";

import { BaseResponse } from "../common/response";
import { s3, dynamoDB } from "../common/awsService";
import { S3_BUCKET_NAME, DB_KEY, DYNAMO_DB_Table } from "../common/constants";

const appKey = `${DB_KEY}#FOLDERS_FILE`;

export const handler = middy(async (event: APIGatewayEvent) => {
  const { code } = event.queryStringParameters || {};
  const { folder } = event.pathParameters || {};
  const response = new BaseResponse(code);
  try {
    const params = {
      TableName: DYNAMO_DB_Table || "",
      KeyConditionExpression:
        "#appKey = :appKey and begins_with(#sortKey, :sortKey)",
      ExpressionAttributeNames: {
        "#appKey": "appKey",
        "#sortKey": "sortKey",
      },
      ExpressionAttributeValues: {
        ":appKey": appKey,
        ":sortKey": folder,
      },
    };
    const result = await dynamoDB.query(params).promise();
    return response.setData(result.Items).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
