import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { BaseResponse } from "../common/response";
import { DB_KEY } from "../common/constants";
import { getFoldersByParent } from "./helper";

const appKey = `${DB_KEY}#FOLDER`;

export const handler = middy(async (event: APIGatewayEvent) => {
  const id = event.pathParameters?.id;
  const response = new BaseResponse();
  try {
    const result = await getFoldersByParent(id || "");
    return response.setData(result.Items).response();
  } catch (error) {
    return response.setMessage(error.message).withError().response();
  }
}).use(jsonBodyParser());
