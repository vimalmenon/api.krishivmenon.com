import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { dynamoDB } from '../common/awsService';
import { DYNAMO_DB_Table, DB_KEY, commonTableColumn } from '../common/constants';

const appKey = `${DB_KEY}#FOLDER`;

const columns = [
  'id',
  'label',
  'metadata',
  'parent',
  'canCreateFolder',
  'canUploadFile',
  'canDeleteFolder',
  ...commonTableColumn,
];

export const getFoldersByParent = (parentId: string): Promise<DocumentClient.QueryOutput> => {
  const params = {
    TableName: DYNAMO_DB_Table || '',
    KeyConditionExpression: '#appKey = :appKey',
    FilterExpression: '#parent = :parent and #isPrivate = :isPrivate',
    ProjectionExpression: columns.join(','),
    ExpressionAttributeNames: {
      '#appKey': 'appKey',
      '#parent': 'parent',
      '#isPrivate': 'isPrivate',
    },
    ExpressionAttributeValues: {
      ':appKey': appKey,
      ':parent': parentId,
      ':isPrivate': false,
    },
  };
  return dynamoDB.query(params).promise();
};

export const getFolderById = (id: string) => {
  const params = {
    TableName: DYNAMO_DB_Table || '',
    Key: {
      appKey: appKey,
      sortKey: `folder#${id}`,
    },
  };
  return dynamoDB.get(params).promise();
};

export const updateFolderFiles = async (id: string, files: string[]) => {
  const updateParams = {
    TableName: DYNAMO_DB_Table || '',
    Key: {
      appKey: appKey,
      sortKey: `folder#${id}`,
    },
    UpdateExpression: `set #files=:files, #updatedDate=:updatedDate`,
    ExpressionAttributeValues: {
      ':updatedDate': new Date().toISOString(),
      ':files': files,
    },
    ExpressionAttributeNames: {
      '#updatedDate': 'updatedDate',
      '#files': 'files',
    },
    ReturnValues: 'UPDATED_NEW',
  };
  await dynamoDB.update(updateParams).promise();
};
