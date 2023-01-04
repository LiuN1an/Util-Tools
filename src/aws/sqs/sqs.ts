import AWS from "aws-sdk";
import { fetchImg } from "../utils/fetchImg";

const ACCESS_KEY_ID = "";

const ACCESS_SECRET_ACCESS_KEY = "";

const REGION = "";

const SQS_URL = "";

AWS.config.update({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: ACCESS_SECRET_ACCESS_KEY,
  region: REGION,
});

const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

const task = async () => {
  try {
    const data = await sqs.receiveMessage({ QueueUrl: SQS_URL }).promise();
    const { Messages } = data;
    for (const message of Messages) {
      const { Body, ReceiptHandle } = message;
      const {
        userId,
        url,
        mobile,
        timestamp,
        mode = "prod",
      } = JSON.parse(Body);
      const changeResult = await sqs
        .changeMessageVisibility({
          QueueUrl: SQS_URL,
          ReceiptHandle,
          VisibilityTimeout: 1,
        })
        .promise();
      console.log("sqs-task-change-visible", changeResult);
      const s3 = new AWS.S3({
        region: mode === "development" ? "ap-east-1" : "us-east-1",
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: ACCESS_SECRET_ACCESS_KEY,
      });
      const img = await fetchImg(url, mobile);
      const s3_result = await s3
        .upload({
          Bucket: mode === "development" ? "nextme-dev" : "nextme-master",
          Key: `user/${userId}/fetch/${timestamp}-${encodeURIComponent(
            url
          )}.png`,
          Body: img,
          ContentType: "image/png",
        })
        .promise();
      console.log("s3_result: ", s3_result);
      const data = await sqs
        .deleteMessage({ QueueUrl: SQS_URL, ReceiptHandle })
        .promise();
      console.log("sqs-task-delete-msg", data);
    }
  } catch (e) {}
};
