import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SESClient } from "@aws-sdk/client-ses";

export const dynamodbClient = new DynamoDBClient({
  region: process.env.REGION,
});
export const emailClient = new SESClient({ region: process.env.REGION });
