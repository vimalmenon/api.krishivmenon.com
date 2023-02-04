import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { randomUUID } from "crypto";

import { BaseResponse } from "../common/response";
import { DYNAMO_DB_Table, DB_KEY } from "../common/constants";
import { dynamoDB } from "../common/awsService";
import { getFoldersByParent } from "./helper";

const appKey = `${DB_KEY}#FOLDER`;

export const handler = middy(async (event: APIGatewayEvent) => {
  const { code } = event.queryStringParameters || {};
  const response = new BaseResponse(code);
  try {
    const folder = event.body as any;
    const uid = randomUUID();

    await dynamoDB
      .put({
        TableName: DYNAMO_DB_Table || "",
        Item: {
          appKey: appKey,
          sortKey: `folder#${uid}`,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          id: uid,
          label: folder.label || "",
          parent: folder.parent || "",
          childNode: 0,
          metadata: {},
        },
      })
      .promise();
    const result = await getFoldersByParent(folder.parent);
    return response.setData(result.Items).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
