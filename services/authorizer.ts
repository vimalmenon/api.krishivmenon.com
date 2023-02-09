import { CognitoJwtVerifier } from "aws-jwt-verify";
import { USER_POOL_ID, CLIENT_ID } from "./common/constants";

// Verifier that expects valid access tokens:
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID || "",
  tokenUse: "id",
  clientId: CLIENT_ID || "",
});

export const handler = async (event, context) => {
  try {
    const result = await verifier.verify(event.authorizationToken);
    console.log(result, result["cognito:groups"]?.includes("Admin"));
    if (result["cognito:groups"]?.includes("Admin")) {
      return {
        principalId: "user",
        policyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "execute-api:Invoke",
              Effect: "Allow",
              Resource: event.methodArn,
            },
          ],
        },
      };
    } else {
      return {
        principalId: "user",
        policyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "execute-api:Invoke",
              Effect: "Deny",
              Resource: event.methodArn,
            },
          ],
        },
      };
    }
  } catch (error) {
    throw Error("Unauthorized");
  }
};
