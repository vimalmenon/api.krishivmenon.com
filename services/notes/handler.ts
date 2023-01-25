const DynamoDb = require("aws-sdk/clients/dynamodb");
const { randomUUID } = require("crypto");

const dynamoDB = new DynamoDb();

const DYNAMO_DB_Table = process.env.DYNAMO_DB_Table;
const DB_KEY = process.env.DB_KEY;

const appKey = `${DB_KEY}#NOTE`;

const transformResult = (items) => {
  return items.map((item) => {
    const result = {};
    Object.keys(item).map((key) => {
      result[key] = item[key]["S"];
    });
    return result;
  });
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
  return respondToSuccess({ notes: transformResult(result.Items) });
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

  return respondToSuccess({ message: "this is vimal menon", result });
};
export const createFolder = async () => {
  return null;
};

export const updateFolder = async () => {
  return null;
};

export const deleteFolder = async () => {
  return null;
};
