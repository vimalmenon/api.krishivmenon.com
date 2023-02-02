import middy from "@middy/core";
import httpMultipartBodyParser from "@middy/http-multipart-body-parser";
import { APIGatewayEvent } from "aws-lambda/trigger/api-gateway-proxy";
import { randomUUID } from "crypto";

import { BaseResponse } from "../common/response";
import { isValidFolder } from "./helper";
import { getFolderById, updateFolderFiles } from "../folders/helper";
import { s3, dynamoDB } from "../common/awsService";
import { S3_BUCKET_NAME, DB_KEY, DYNAMO_DB_Table } from "../common/constants";

const appKey = `${DB_KEY}#FILE`;

export const handler = middy(async (event: APIGatewayEvent) => {
  const { data, extension, folderId } = (event.body || {}) as any;
  const { code } = event.queryStringParameters || {};
  const { folder } = event.pathParameters || {};
  const response = new BaseResponse(code);
  if (!isValidFolder(folder || "")) {
    return response.forError("Not a valid folder").response();
  }
  try {
    const uid = randomUUID();
    const fileName = `${uid}.${extension}`;

    const params = {
      Bucket: S3_BUCKET_NAME || "",
      Key: `${folder}/${fileName}`,
      Body: data.content,
      ContentType: data.mimetype,
    };
    await s3.putObject(params).promise();

    await dynamoDB
      .put({
        TableName: DYNAMO_DB_Table || "",
        Item: {
          appKey: appKey,
          sortKey: `file#${fileName}`,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          id: fileName,
          path: folder,
          type: data.mimetype,
          label: fileName,
        },
      })
      .promise();
    const selectedFolder = await getFolderById(folderId);
    await updateFolderFiles(folderId, [
      ...(selectedFolder.Item?.files || []),
      fileName,
    ]);
    const selectedFolderUpdated = await getFolderById(folderId);
    return response.setData(selectedFolderUpdated.Item).response();
  } catch (error) {
    return response.forError(error.message).response();
  }
}).use(httpMultipartBodyParser());
