import { DynamoDB, S3 } from "aws-sdk";

export const dynamoDB = new DynamoDB.DocumentClient();
export const s3 = new S3();