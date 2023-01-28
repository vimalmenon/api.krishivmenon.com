import { randomUUID } from "crypto";
import { respondForError, respondToSuccess } from "../common/response";
import { DYNAMO_DB_Table, DB_KEY } from "../common/constants";
import { dynamoDB } from "../common/awsService";

import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import middy from "@middy/core";

const appKey = `${DB_KEY}#FOLDER`;

export const handler = middy(async (event: APIGatewayEvent) => {
  try {
    const folder = event.body as any;
    const uid = randomUUID();

    const dbResult = await dynamoDB
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
          metadata: {},
          content: [],
        },
      })
      .promise();
    return respondToSuccess({
      id: uid,
      dbResult,
    });
  } catch (error) {
    return respondForError({ message: error.message });
  }
}).use(jsonBodyParser());
