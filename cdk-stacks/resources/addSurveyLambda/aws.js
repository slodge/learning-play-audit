import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { LambdaClient } from "@aws-sdk/client-lambda";

export const dynamodbClient = new DynamoDBClient({ region: process.env.REGION });
export const lambdaClient = new LambdaClient({ region: process.env.REGION });
