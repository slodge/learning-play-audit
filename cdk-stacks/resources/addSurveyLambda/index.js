require("es6-promise").polyfill();
require("isomorphic-fetch");
const uuid = require("uuid");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { S3RequestPresigner } = require("@aws-sdk/s3-request-presigner");
const { createRequest } = require("@aws-sdk/util-create-request");
const { formatUrl } = require("@aws-sdk/util-format-url");
const { marshall } = require("@aws-sdk/util-dynamodb");

const EXPIRATION = 60 * 60 * 1000;
const STATE_PENDING = "Pending upload";

const s3Client = new S3Client(process.env.REGION);
const dynamodbClient = new DynamoDBClient({ region: process.env.REGION });
const signer = new S3RequestPresigner({ ...s3Client.config });

function storeSurveyResponse(surveyResponse) {
  console.log("storeSurveyResponse", JSON.stringify(surveyResponse));

  var creationDate = new Date().toISOString();

  var params = {
    TableName: process.env.SURVEY_DB_TABLE,
    Item: marshall({
      __typename: "SurveyResponse",
      uploadState: STATE_PENDING,
      createdAt: creationDate,
      updatedAt: creationDate,
      ...surveyResponse,
    }),
  };

  console.log("Adding a new item...", params);
  return dynamodbClient.send(new PutItemCommand(params));
}

function createSignedUploadUrl(bucket, uploadKey) {
  console.log("Creating signed url");

  return createRequest(
    s3Client,
    new PutObjectCommand({ Key: uploadKey, Bucket: bucket })
  )
    .then((request) => {
      console.log("Created request", request);
      const expiration = new Date(Date.now() + EXPIRATION);

      console.log("Creating presigned URL");
      return signer.presign(request, expiration);
    })
    .then((unformattedUrl) => {
      console.log("Formatting presigned URL");
      return formatUrl(unformattedUrl);
    });
}

exports.handler = async (event) => {
  console.log("Incoming request");
  const inputRequest = JSON.parse(event.body);
  console.log(inputRequest);

  const survey = inputRequest.survey;
  const surveyId = uuid.v4();
  const clientSurveyId = inputRequest.uuid;
  console.log("Mapping survey id: " + clientSurveyId + " -> " + surveyId);

  const photos = [];
  const surveyResponse = {
    id: surveyId,
    surveyVersion: inputRequest.surveyVersion,
    surveyResponse: survey,
    schoolName: survey.background.organisation.answer,
    responderName: `${survey.background.firstname.answer} ${survey.background.lastname.answer}`,
    responderEmail: survey.background.email.answer,
    photos,
  };

  const photoUploadUrls = {};
  const PHOTO_BUCKET = process.env.SURVEY_RESOURCES_BUCKET;

  const clientPhotoIds = inputRequest.photoDetails
    ? Object.keys(inputRequest.photoDetails)
    : [];
  console.log(clientPhotoIds);

  const photoS3UploadKeys = {};
  clientPhotoIds.forEach((clientPhotoId) => {
    photoS3UploadKeys[clientPhotoId] = "uploads/" + uuid.v4();
  });

  clientPhotoIds.forEach((clientPhotoId) => {
    const photoId = uuid.v4();
    const photoS3Key = "surveys/" + surveyId + "/photos/" + photoId;
    console.log("Mapping photo id: " + clientPhotoId + " -> " + photoId);

    const imageDescription =
      inputRequest.photoDetails[clientPhotoId].description;

    photos.push({
      bucket: PHOTO_BUCKET,
      description: imageDescription,
      fullsize: {
        key: photoS3Key,
        uploadKey: photoS3UploadKeys[clientPhotoId],
        width: 400,
        height: 300,
      },
    });
  });

  const urlHandling = await Promise.all(
    clientPhotoIds.map((clientPhotoId) => {
      return createSignedUploadUrl(
        PHOTO_BUCKET,
        photoS3UploadKeys[clientPhotoId]
      ).then((signedUrl) => {
        console.log("signed url", signedUrl);
        photoUploadUrls[clientPhotoId] = signedUrl;
        return Promise.resolve(clientPhotoId);
      });
    })
  );

  console.log("store survey", JSON.stringify(surveyResponse));
  const result = await storeSurveyResponse(surveyResponse);
  console.log("store survey result", result);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "OPTIONS,POST",
    },
    body: JSON.stringify({
      result: "Pending upload",
      confirmId: surveyId,
      uploadUrls: photoUploadUrls,
    }),
  };
};
