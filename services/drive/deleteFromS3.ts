import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent } from "aws-lambda/trigger/api-gateway-proxy";

import { BaseResponse } from "../common/response";
import { s3, dynamoDB } from "../common/awsService";
import { S3_BUCKET_NAME, DB_KEY, DYNAMO_DB_Table } from "../common/constants";

const appKey = `${DB_KEY}#FOLDERS_FILE`;

export const handler = middy(async (event: APIGatewayEvent) => {
  const { code } = event.queryStringParameters || {};
  const { folder, file } = event.pathParameters || {};
  const response = new BaseResponse(code);
  try {
    const result = await dynamoDB
      .get({
        TableName: DYNAMO_DB_Table || "",
        Key: {
          appKey: appKey,
          sortKey: `${folder}#${file}`,
        },
      })
      .promise();
    await s3
      .deleteObject({
        Bucket: S3_BUCKET_NAME || "",
        Key: result.Item?.path,
      })
      .promise();

    await dynamoDB
      .delete({
        TableName: DYNAMO_DB_Table || "",
        Key: {
          appKey: appKey,
          sortKey: `${folder}#${file}`,
        },
      })
      .promise();
    return response.setMessage("File has been deleted").response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
