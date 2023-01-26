import { randomUUID } from "crypto";
import { respondForError, respondToSuccess } from "../common/response";
import { DYNAMO_DB_Table, DB_KEY } from "../common/constants";
import { dynamoDB } from "../common/awsService";

import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

const appKey = `${DB_KEY}#NOTE`;

import middy from "@middy/core";

export const handler = middy(async (event: APIGatewayEvent) => {
  try {
    const note = event.body as any;
    const uid = randomUUID();
    const dbResult = await dynamoDB
      .put({
        TableName: DYNAMO_DB_Table || "",
        Item: {
          appKey: appKey,
          sortKey: `note#${uid}`,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          id: uid,
          title: note.title || "",
          content: note.content || "",
        },
      })
      .promise();
    return respondToSuccess({
      id: uid,
      dbResult,
    });
  } catch (error) {
    respondForError({ message: error.message });
  }
}).use(jsonBodyParser());
