"use strict";

const S3 = require("aws-sdk/clients/s3");
const DynamoDb = require("aws-sdk/clients/dynamodb");

const s3 = new S3();
const dynamoDB = new DynamoDb();

const S3_Bucket_Name = process.env.S3_BUCKET_NAME;
const DYNAMO_DB_Table = process.env.DYNAMO_DB_Table;
const DB_KEY = process.env.DB_KEY;

export const sendForSuccess = (data) => {
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
export const sendForError = (data) => {
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: JSON.stringify(data),
    }),
  };
};

const SupportedFolder = ["images", "files", "videos"];

export const uploadToS3 = async (event, context) => {
  const { folder, file } = event.pathParameters;
  //get the image data from upload
  const buffer = Buffer.from(
    event.body.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  const params = {
    Bucket: S3_Bucket_Name,
    Key: `${folder}/${file}`,
    Body: buffer,
    ContentType: event.headers["Content-Type"],
  };

  try {
    const result = await s3.putObject(params).promise();
    console.log(result);
    return sendForSuccess({
      message: "this is uploaded to S3",
      folder,
      file,
    });
  } catch (error) {
    return sendForError(error.message);
  }
};

export const deleteFromS3 = async (event, context) => {
  return sendForSuccess({
    message: "this is delete from S3",
  });
};

export const getFilesFromS3 = async (event) => {
  await dynamoDB
    .putItem({
      TableName: DYNAMO_DB_Table,
      Item: {
        appKey: { S: "APP#KM#FILES" },
        sortKey: { S: "file#test" },
      },
    })
    .promise();
  return sendForSuccess({
    message: "Go Serverless v3.0! Your function executed successfully!",
    S3_Bucket_Name,
    DYNAMO_DB_Table,
    DB_KEY
  });
};

export const updateS3File = async () => {
  return sendForSuccess({
    message: "Updated the file metadata from S3",
  });
};
