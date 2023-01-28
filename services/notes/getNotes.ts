import { respondForError, respondToSuccess } from "../common/response";
import { DYNAMO_DB_Table, DB_KEY } from "../common/constants";
import { dynamoDB } from "../common/awsService";

import jsonBodyParser from "@middy/http-json-body-parser";

const appKey = `${DB_KEY}#NOTE`;

import middy from "@middy/core";

export const handler = middy(async (event) => {
  try {
    const params = {
      TableName: DYNAMO_DB_Table || "",
      KeyConditionExpression: "#appKey = :appKey",
      ExpressionAttributeNames: {
        "#appKey": "appKey",
      },
      ExpressionAttributeValues: {
        ":appKey": appKey,
      },
    };
    const result = await dynamoDB.query(params).promise();
    return respondToSuccess({ notes: result.Items });
  } catch (error) {
    return respondForError({ message: error.message });
  }
}).use(jsonBodyParser());
