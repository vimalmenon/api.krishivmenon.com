import { DYNAMO_DB_Table, DB_KEY } from "../common/constants";
import { dynamoDB } from "../common/awsService";

const appKey = `${DB_KEY}#FOLDER`;

export const getFoldersByParent = async (parentId: string) => {
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
  return await dynamoDB.query(params).promise();
};

export const getFolderById = (id: string) => {};
