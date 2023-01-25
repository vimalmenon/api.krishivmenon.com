import { DynamoDB } from "aws-sdk";
import { randomUUID } from "crypto";
import { respondForError, respondToSuccess } from "../common/response";
import { DYNAMO_DB_Table, DB_KEY } from "../common/constants";

const dynamoDB = new DynamoDB.DocumentClient();
const appKey = `${DB_KEY}#NOTE`;

export const getNotes = async () => {
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
};

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

export const getNote = async (event) => {
  const { id } = event.pathParameters;
  try {
    const params = {
      TableName: DYNAMO_DB_Table || "",
      Key: {
        appKey: appKey,
        sortKey: `note#${id}`,
      },
    };
    const result = await dynamoDB.get(params).promise();
    return respondToSuccess({ note: result.Item });
  } catch (error) {
    respondForError({ message: error.message });
  }
};

export const deleteNote = async (event) => {
  const { id } = event.pathParameters;
  const params = {
    TableName: DYNAMO_DB_Table || "",
    Key: {
      appKey: appKey,
      sortKey: `note#${id}`,
    },
  };
  await dynamoDB.delete(params).promise();
  return respondToSuccess({ message: `${id} note deleted` });
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
