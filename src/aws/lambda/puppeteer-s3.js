const chromium = require("chrome-aws-lambda");
const AWS = require("aws-sdk");
const path = require("path");
const fs = require("fs");

/**
 * 需要增加两个Layer
 * - fonts的layer，存在微软雅黑字体的ttf文件
 * - chrome-aws-lambda和puppeteer-core的layer
 */

const s3 = new AWS.S3({
  accessKeyId: "xxx",
  secretAccessKey: "xxx",
  region: "xxx",
});

const screenshot = async (browser, url, isMobile = false) => {
  const page = await browser.newPage();
  await page.emulate(
    chromium.puppeteer.devices[isMobile ? "iPhone X" : "iPad Pro"]
  );
  await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const file = await page.screenshot({ fullPage: false });
  // await browser.close();
  return file;
};

const s3Put = async (props, file) => {
  const { env, userId, url, isMobile, retry } = props;
  const key = `user/${userId}/fetch/${url}.png${
    isMobile ? "?mobile=true" : ""
  }`;
  if (retry) {
    await s3
      .upload({
        Bucket: env === "production" ? "xxx" : "xxx",
        Key: key,
        Body: file,
        ContentType: "image/png",
      })
      .promise();
    console.log("retry is true");
  } else {
    try {
      await s3
        .headObject({
          Bucket: env === "production" ? "xxx" : "xxx",
          Key: key,
        })
        .promise();
      console.log("retry is false, has object: ", key);
    } catch (e) {
      await s3
        .upload({
          Bucket: env === "production" ? "xxx" : "xxx",
          Key: key,
          Body: file,
          ContentType: "image/png",
        })
        .promise();
    }
  }
};

exports.handler = async (event) => {
  console.log("event: ", event.Records[0].Sns);
  if (event.Records && event.Records[0] && event.Records[0].Sns) {
    const { Message } = event.Records[0].Sns;
    const { url, userId, retry, env } = JSON.parse(Message);
    await chromium.font("/opt/fonts/weiruanyahei.ttf");
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    await s3Put(
      { env, userId, url, retry },
      await screenshot(browser, url)
    );
    await s3Put(
      { env, userId, url, retry, isMobile: true },
      await screenshot(browser, url, true)
    );

    return {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,POST,PUT",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "X-Requested-With": "*",
      },
      body: "File uploaded successfully",
    };
  }
  // console.log("current: ", fs.readdirSync("/opt"));
};
