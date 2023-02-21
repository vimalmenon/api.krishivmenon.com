import { CognitoJwtVerifier } from 'aws-jwt-verify';

import { USER_POOL_ID, CLIENT_ID } from './constants';

// Verifier that expects valid access tokens:
export const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID || '',
  tokenUse: 'id',
  clientId: CLIENT_ID || '',
});
