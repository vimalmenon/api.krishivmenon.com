"use strict";

const S3 = require("aws-sdk/clients/s3");
const { randomUUID } = require("crypto");
const DynamoDb = require("aws-sdk/clients/dynamodb");

const s3 = new S3();
const dynamoDB = new DynamoDb();

const S3_Bucket_Name = process.env.S3_BUCKET_NAME;
const DYNAMO_DB_Table = process.env.DYNAMO_DB_Table;
const DB_KEY = process.env.DB_KEY;

const SupportedFolder = ["images", "files", "videos"];
const appKey = `${DB_KEY}#FILE`;

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

export const isValidFolder = (folder: string): boolean => {
  return SupportedFolder.includes(folder);
};

const transformResult = (items) => {
  return items.map((item) => {
    const result = {};
    Object.keys(item).map((key) => {
      result[key] = item[key]["S"];
    });
    return result;
  });
};
export const getFilesFromS3 = async (event) => {
  const { folder } = event.pathParameters;
  if (!isValidFolder(folder)) {
    return respondForError("Not valid folder");
  }
  const params = {
    TableName: DYNAMO_DB_Table,
    KeyConditionExpression: "#appKey = :appKey",
    FilterExpression: "#path = :path",
    ExpressionAttributeNames: {
      "#appKey": "appKey",
      "#path": "path",
    },
    ExpressionAttributeValues: {
      ":appKey": { S: appKey },
      ":path": { S: folder },
    },
  };
  const result = await dynamoDB.query(params).promise();
  return respondToSuccess({
    result: transformResult(result.Items),
    uid: randomUUID(),
  });
};

export const uploadToS3 = async (event) => {
  const { folder, file } = event.pathParameters;
  if (!isValidFolder(folder)) {
    return respondForError("Not valid folder");
  }
  //get the image data from upload
  const buffer = Buffer.from(
    event.body.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  const ContentType = event.headers["content-type"];
  const params = {
    Bucket: S3_Bucket_Name,
    Key: `${folder}/${file}`,
    Body: buffer,
    ContentType,
  };

  try {
    const s3Result = await s3.putObject(params).promise();
    const dbResult = await dynamoDB
      .putItem({
        TableName: DYNAMO_DB_Table,
        Item: {
          appKey: { S: appKey },
          sortKey: { S: `file#${file}` },
          createdDate: { S: new Date().toISOString() },
          updatedDate: { S: new Date().toISOString() },
          path: { S: folder },
          type: { S: ContentType || "" },
          label: { S: file },
          name: { S: file },
        },
      })
      .promise();
    console.log(dbResult, s3Result);
    return respondToSuccess({
      folder,
      file,
    });
  } catch (error) {
    return respondForError(error.message);
  }
};

export const deleteFromS3 = async (event) => {
  const { folder, file } = event.pathParameters;
  if (!isValidFolder(folder)) {
    return respondForError("Not valid folder");
  }

  try {
    const result = await s3
      .deleteObject({
        Bucket: S3_Bucket_Name,
        Key: `${folder}/${file}`,
      })
      .promise();
    const params = {
      TableName: DYNAMO_DB_Table,
      Key: {
        appKey: appKey,
        sortKey: `file#${file}`,
      },
    };
    await dynamoDB.deleteItem(params).promise();
    return respondToSuccess({
      message: "this is delete from S3",
      ...result,
    });
  } catch (error) {
    return respondForError(error.message);
  }
};

export const updateS3File = async (event) => {
  const { folder, file } = event.pathParameters;
  if (!isValidFolder(folder)) {
    return respondForError("Not valid folder");
  }
  try {
    const params = {
      TableName: DYNAMO_DB_Table,
      Key: {
        appKey: appKey,
        sortKey: `file#${file}`,
      },
      UpdateExpression: `set #updatedDate=:updatedDate , #label=:label`,
      ExpressionAttributeValues: {
        ":updatedDate": new Date().toISOString(),
        ":lable": event.body.label,
      },
      ExpressionAttributeNames: {
        "#updatedDate": "updatedDate",
        "#label": "label",
      },
      ReturnValues: "UPDATED_NEW",
    };
    const result = await dynamoDB.update(params).promise();
    return respondToSuccess({
      message: "Updated the file metadata from S3",
      result,
    });
  } catch (error) {
    respondForError(error.message);
  }
};
