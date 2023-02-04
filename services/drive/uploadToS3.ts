import middy from "@middy/core";
import httpMultipartBodyParser from "@middy/http-multipart-body-parser";
import { APIGatewayEvent } from "aws-lambda/trigger/api-gateway-proxy";
import { randomUUID } from "crypto";

import { BaseResponse } from "../common/response";
import { s3, dynamoDB } from "../common/awsService";
import {
  S3_BUCKET_NAME,
  DB_KEY,
  DYNAMO_DB_Table,
  FileTypeExtensionMapping,
  DriveFolderMapping,
} from "../common/constants";

const appKey = `${DB_KEY}#FOLDERS_FILE`;

export const handler = middy(async (event: APIGatewayEvent) => {
  const { data } = (event.body || {}) as any;
  const { code } = event.queryStringParameters || {};
  const { folder } = event.pathParameters || {};
  const response = new BaseResponse(code);
  try {
    const extension = FileTypeExtensionMapping[data.mimetype];
    const uid = randomUUID();
    const fileName = `${uid}.${extension}`;
    const imageFolder = DriveFolderMapping[data.mimetype];
    if (!data.mimetype) {
      return response
        .setMessage("This format is not support")
        .withError()
        .response();
    }
    const params = {
      Bucket: S3_BUCKET_NAME || "",
      Key: `${imageFolder}/${fileName}`,
      Body: data.content,
      ContentType: data.mimetype,
    };
    await s3.putObject(params).promise();

    await dynamoDB
      .put({
        TableName: DYNAMO_DB_Table || "",
        Item: {
          appKey: appKey,
          sortKey: `${folder}#${fileName}`,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          id: fileName,
          path: `${imageFolder}/${fileName}`,
          type: data.mimetype,
          metadata: {},
          label: fileName,
        },
      })
      .promise();

    return response.setMessage("File has been uploaded").response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(httpMultipartBodyParser());
