import { DynamoDB } from "aws-sdk";
import { randomUUID } from "crypto";
import { respondForError, respondToSuccess } from "../common/response";
import { DYNAMO_DB_Table, DB_KEY } from "../common/constants";

const dynamoDB = new DynamoDB.DocumentClient();
const appKey = `${DB_KEY}#NOTE`;

export const addNote = async (event) => {
  const note = JSON.parse(event.body);
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
};

export const updateNote = async (event) => {
  const { id } = event.pathParameters;
  const body = JSON.parse(event.body);
  const params = {
    TableName: DYNAMO_DB_Table || "",
    Key: {
      appKey: appKey,
      sortKey: `note#${id}`,
    },
    UpdateExpression: `set #title=:title , #content=:content, #updatedDate=:updatedDate`,
    ExpressionAttributeValues: {
      ":updatedDate": new Date().toISOString(),
      ":content": body.content,
      ":title": body.title,
    },
    ExpressionAttributeNames: {
      "#updatedDate": "updatedDate",
      "#content": "content",
      "#title": "title",
    },
    ReturnValues: "UPDATED_NEW",
  };
  const result = await dynamoDB.update(params).promise();
  return respondToSuccess({ message: "this is vimal menon" });
};
