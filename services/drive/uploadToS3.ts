import middy from "@middy/core";
import httpMultipartBodyParser from "@middy/http-multipart-body-parser";
import { APIGatewayEvent } from "aws-lambda/trigger/api-gateway-proxy";
import { randomUUID } from "crypto";
import fs from "fs";

import { BaseResponse } from "../common/response";
import { isValidFolder } from "./helper";
import { s3 } from "../common/awsService";
import { S3_BUCKET_NAME } from "../common/constants";

export const handler = middy(async (event: APIGatewayEvent) => {
  const { data, extension } = (event.body || {}) as any;
  const { code } = event.queryStringParameters || {};
  const { folder } = event.pathParameters || {};
  const response = new BaseResponse(code);
  if (!isValidFolder(folder || "")) {
    return response.forError("Not a valid folder").response();
  }
  try {
    const uid = randomUUID();
    const params = {
      Bucket: S3_BUCKET_NAME || "",
      Key: `${folder}/${uid}.${extension}`,
      Body: data.content,
      ContentType: data.mimetype,
    };
    const s3Result = await s3.putObject(params).promise();
    console.log(s3Result, "this is s3 result");
    return response
      .setData({
        message: "read",
      })
      .response();
  } catch (error) {
    return response.forError(error.message).response();
  }
}).use(httpMultipartBodyParser());
