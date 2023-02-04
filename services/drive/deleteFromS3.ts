import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent } from "aws-lambda/trigger/api-gateway-proxy";

import { BaseResponse } from "../common/response";
import { isValidFolder } from "./helper";
import { s3, dynamoDB } from "../common/awsService";
import { S3_BUCKET_NAME, DB_KEY, DYNAMO_DB_Table } from "../common/constants";

const appKey = `${DB_KEY}#FOLDERS_FILE`;

export const handler = middy(async (event: APIGatewayEvent) => {
  const { folderId, fileName } = (event.body || {}) as any;
  const { code } = event.queryStringParameters || {};
  const { folder } = event.pathParameters || {};
  const response = new BaseResponse(code);
  if (!isValidFolder(folder || "")) {
    return response.forError("Not a valid folder").response();
  }
  try {
    await s3
      .deleteObject({
        Bucket: S3_BUCKET_NAME || "",
        Key: `${folderId}#${fileName}`,
      })
      .promise();

    await dynamoDB
      .delete({
        TableName: DYNAMO_DB_Table || "",
        Key: {
          appKey: appKey,
          sortKey: `${folderId}#${fileName}`,
        },
      })
      .promise();
    return response.forSuccessMessage("File has been deleted").response();
  } catch (error) {
    return response.forError(error.message).response();
  }
}).use(jsonBodyParser());
