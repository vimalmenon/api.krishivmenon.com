"use strict";

import { DynamoDB, S3 } from "aws-sdk";
import { randomUUID } from "crypto";
import { respondForError, respondToSuccess } from "../common/response";
import { DYNAMO_DB_Table, DB_KEY, S3_BUCKET_NAME } from "../common/constants";

const s3 = new S3();
const dynamoDB = new DynamoDB.DocumentClient();

const SupportedFolder = ["images", "files", "videos"];
const appKey = `${DB_KEY}#FILE`;

export const isValidFolder = (folder: string): boolean => {
  return SupportedFolder.includes(folder);
};

export const getFilesFromS3 = async (event) => {
  const { folder } = event.pathParameters;
  if (!isValidFolder(folder)) {
    return respondForError("Not valid folder");
  }
  const params = {
    TableName: DYNAMO_DB_Table || "",
    KeyConditionExpression: "#appKey = :appKey",
    FilterExpression: "#path = :path",
    ExpressionAttributeNames: {
      "#appKey": "appKey",
      "#path": "path",
    },
    ExpressionAttributeValues: {
      ":appKey": appKey,
      ":path": folder,
    },
  };
  const result = await dynamoDB.query(params).promise();
  return respondToSuccess({
    result: result.Items,
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
    Bucket: S3_BUCKET_NAME || "",
    Key: `${folder}/${file}`,
    Body: buffer,
    ContentType,
  };

  try {
    const s3Result = await s3.putObject(params).promise();
    const dbResult = await dynamoDB
      .put({
        TableName: DYNAMO_DB_Table || "",
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
        Bucket: S3_BUCKET_NAME || "",
        Key: `${folder}/${file}`,
      })
      .promise();
    const params = {
      TableName: DYNAMO_DB_Table || "",
      Key: {
        appKey: appKey,
        sortKey: `file#${file}`,
      },
    };
    await dynamoDB.delete(params).promise();
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
  const body = JSON.parse(event.body);
  if (!isValidFolder(folder)) {
    return respondForError("Not valid folder");
  }
  try {
    const params = {
      TableName: DYNAMO_DB_Table || "",
      Key: {
        appKey: appKey,
        sortKey: `file#${file}`,
      },
      UpdateExpression: `set #updatedDate=:updatedDate , #label=:label`,
      ExpressionAttributeValues: {
        ":updatedDate": new Date().toISOString(),
        ":lable": body.label,
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
