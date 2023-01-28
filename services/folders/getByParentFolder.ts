import { respondForError, respondToSuccess } from "../common/response";
import { DYNAMO_DB_Table, DB_KEY } from "../common/constants";
import { dynamoDB } from "../common/awsService";

import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

const appKey = `${DB_KEY}#FOLDER`;

import middy from "@middy/core";

export const handler = middy(async (event: APIGatewayEvent) => {
  const id = event.pathParameters?.id;
  try {
    const params = {
      TableName: DYNAMO_DB_Table || "",
      KeyConditionExpression: "#appKey = :appKey",
      FilterExpression: "#parent = :parent",
      ExpressionAttributeNames: {
        "#appKey": "appKey",
        "#parent": "parent",
      },
      ExpressionAttributeValues: {
        ":appKey": appKey,
        ":parent": id,
      },
    };
    const result = await dynamoDB.query(params).promise();
    return respondToSuccess(result.Items);
  } catch (error) {
    return respondForError({ message: error.message });
  }
}).use(jsonBodyParser());
