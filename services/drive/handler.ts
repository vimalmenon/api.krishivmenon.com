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
    body: JSON.stringify(data),
  };
};

export const respondForError = (data) => {
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: data,
    }),
  };
};

export const isValidFolder = (folder: string): boolean => {
  return SupportedFolder.includes(folder);
};

export const getFilesFromS3 = async (event) => {
  const { folder } = event.pathParameters;
  if (!isValidFolder(folder)) {
    return respondForError("Not valid folder");
  }
  return respondToSuccess({
    message: "Go Serverless v3.0! Your function executed successfully!",
    S3_Bucket_Name,
    DYNAMO_DB_Table,
    DB_KEY,
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
  const ContentType = event.headers["Content-Type"];
  const params = {
    Bucket: S3_Bucket_Name,
    Key: `${folder}/${file}`,
    Body: buffer,
    ContentType,
  };

  try {
    const result = await s3.putObject(params).promise();
    await dynamoDB
      .putItem({
        TableName: DYNAMO_DB_Table,
        Item: {
          appKey: appKey,
          sortKey: `file#${file}`,
          createdDate: new Date(),
          updatedDate: new Date(),
          path: folder,
          type: ContentType,
          label: file,
          name: file,
        },
      })
      .promise();
    return respondToSuccess({
      folder,
      file,
      ...result,
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
  const result = await s3
    .deleteObject({
      Bucket: S3_Bucket_Name,
      Key: `${folder}/${file}`,
    })
    .promise();

  var params = {
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
};

export const updateS3File = async (event) => {
  const { folder, file } = event.pathParameters;
  if (!isValidFolder(folder)) {
    return respondForError("Not valid folder");
  }
  return respondToSuccess({
    message: "Updated the file metadata from S3",
  });
};
