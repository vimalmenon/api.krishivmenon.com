const DynamoDb = require("aws-sdk/clients/dynamodb");
const { randomUUID } = require("crypto");

const dynamoDB = new DynamoDb();

const S3_Bucket_Name = process.env.S3_BUCKET_NAME;
const DYNAMO_DB_Table = process.env.DYNAMO_DB_Table;
const DB_KEY = process.env.DB_KEY;

const appKey = `${DB_KEY}#FILE`;

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

export const getNote = async (event) => {
  const { id } = event.pathParameters;

  return respondToSuccess({ message: "this is vimal menon" });
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
