const DynamoDb = require("aws-sdk/clients/dynamodb");
const { randomUUID } = require("crypto");

const dynamoDB = new DynamoDb();

const DYNAMO_DB_Table = process.env.DYNAMO_DB_Table;
const DB_KEY = process.env.DB_KEY;

const appKey = `${DB_KEY}#NOTE`;

const transformItem = (item) => {
  const result = {};
  Object.keys(item).map((key) => {
    result[key] = item[key]["S"];
  });
  return result;
};

const transformItems = (items) => {
  return items.map((item) => transformItem(item));
};

export const respondToSuccess = (data) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(data),
  };
};

export const respondForError = (data) => {
  return {
    statusCode: 500,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      message: data,
    }),
  };
};

export const getNotes = async () => {
  const params = {
    TableName: DYNAMO_DB_Table,
    KeyConditionExpression: "#appKey = :appKey",
    ExpressionAttributeNames: {
      "#appKey": "appKey",
    },
    ExpressionAttributeValues: {
      ":appKey": { S: appKey },
    },
  };
  const result = await dynamoDB.query(params).promise();
  return respondToSuccess({ notes: transformItems(result.Items) });
};

export const addNote = async (event) => {
  const note = JSON.parse(event.body);
  const uid = randomUUID();
  const dbResult = await dynamoDB
    .putItem({
      TableName: DYNAMO_DB_Table,
      Item: {
        appKey: { S: appKey },
        sortKey: { S: `note#${uid}` },
        createdDate: { S: new Date().toISOString() },
        updatedDate: { S: new Date().toISOString() },
        id: { S: uid },
        title: { S: note.title || "" },
        content: { S: note.content || "" },
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
  const params = {
    TableName: DYNAMO_DB_Table,
    Key: {
      appKey: { S: appKey },
      sortKey: { S: `note#${id}` },
    },
  };
  const result = await dynamoDB.getItem(params).promise();
  const note = transformItem(result.Item);
  return respondToSuccess({ note });
};

export const deleteNote = async (event) => {
  const { id } = event.pathParameters;
  const params = {
    TableName: DYNAMO_DB_Table,
    Key: {
      appKey: { S: appKey },
      sortKey: { S: `note#${id}` },
    },
  };
  await dynamoDB.deleteItem(params).promise();
  return respondToSuccess({ message: `${id} note deleted` });
};

export const updateNote = async (event) => {
  const { id } = event.pathParameters;
  const body = JSON.parse(event.body);
  const params = {
    TableName: DYNAMO_DB_Table,
    Key: {
      appKey: { S: appKey },
      sortKey: { S: `note#${id}` },
    },
    UpdateExpression: `set #title=:title , #content=:content, #updatedDate=:updatedDate`,
    ExpressionAttributeValues: {
      ":updatedDate": { S: new Date().toISOString() },
      ":content": { S: body.content },
      ":title": { S: body.title },
    },
    ExpressionAttributeNames: {
      "#updatedDate": "updatedDate",
      "#content": "content",
      "#title": "title",
    },
    ReturnValues: "UPDATED_NEW",
  };
  const result = await dynamoDB.updateItem(params).promise();
  return respondToSuccess({ message: "this is vimal menon" });
};
