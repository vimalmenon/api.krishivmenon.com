import { dynamoDB } from '../common/awsService';
import { DB_KEY, DYNAMO_DB_Table } from '../common/constants';

export const appKey = `${DB_KEY}#FOLDERS_FILE`;

export const getAllFileDataById = (id: string) => {
  const params = {
    TableName: DYNAMO_DB_Table || '',
    KeyConditionExpression: '#appKey = :appKey',
    FilterExpression: '#id = :id',
    ExpressionAttributeNames: {
      '#appKey': 'appKey',
      '#id': 'id',
    },
    ExpressionAttributeValues: {
      ':appKey': appKey,
      ':id': id,
    },
  };
  return dynamoDB.query(params).promise();
};
