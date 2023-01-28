import { DYNAMO_DB_Table, DB_KEY } from "../common/constants";
import { dynamoDB } from "../common/awsService";

const appKey = `${DB_KEY}#FOLDER`;

export const getFoldersByParent = (parentId: string) => {
  const params = {
    TableName: DYNAMO_DB_Table || "",
    KeyConditionExpression: "#appKey = :appKey",
    FilterExpression: "#parent = :parent",
    ExpressionAttributeNames: {
      "#appKey": "appKey",
      "#parent": "parent",
    },
    ExpressionAttributeValues: {
      ":appKey": appKey,
      ":parent": parentId,
    },
  };
  return dynamoDB.query(params).promise();
};

export const getFolderById = (id: string) => {
  const params = {
    TableName: DYNAMO_DB_Table || "",
    Key: {
      appKey: appKey,
      sortKey: `folder#${id}`,
    },
  };
  return dynamoDB.get(params).promise();
};
