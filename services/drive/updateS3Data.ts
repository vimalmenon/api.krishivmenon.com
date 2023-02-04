import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent } from "aws-lambda/trigger/api-gateway-proxy";

import { BaseResponse } from "../common/response";
import { s3, dynamoDB } from "../common/awsService";
import { S3_BUCKET_NAME, DB_KEY, DYNAMO_DB_Table } from "../common/constants";

const appKey = `${DB_KEY}#FOLDERS_FILE`;

export const handler = middy(async (event: APIGatewayEvent) => {
  const { fileName, label, metadata } = (event.body || {}) as any;
  const { code } = event.queryStringParameters || {};
  const { folder } = event.pathParameters || {};
  const response = new BaseResponse(code);
  try {
    await dynamoDB
      .update({
        TableName: DYNAMO_DB_Table || "",
        Key: {
          appKey: appKey,
          sortKey: `${folder}#${fileName}`,
        },
        UpdateExpression: `set #label=:label , #metadata=:metadata, #updatedDate=:updatedDate`,
        ExpressionAttributeValues: {
          ":updatedDate": new Date().toISOString(),
          ":label": label,
          ":metadata": metadata,
        },
        ExpressionAttributeNames: {
          "#updatedDate": "updatedDate",
          "#label": "label",
          "#metadata": "metadata",
        },
        ReturnValues: "UPDATED_NEW",
      })
      .promise();
    return response.setMessage("File has been updated").response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
