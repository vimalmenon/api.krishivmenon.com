import { dynamoDB } from '../common/awsService';
import { DYNAMO_DB_Table, DB_KEY, commonTableColumn } from '../common/constants';

const columns = ['id', 'content', 'metadata', 'title', ...commonTableColumn];

const appKey = `${DB_KEY}#NOTE`;

export const getAllNotes = () => {
  const params = {
    TableName: DYNAMO_DB_Table || '',
    KeyConditionExpression: '#appKey = :appKey',
    ProjectionExpression: columns.join(','),
    ExpressionAttributeNames: {
      '#appKey': 'appKey',
    },
    ExpressionAttributeValues: {
      ':appKey': appKey,
    },
  };
  return dynamoDB.query(params).promise();
};
