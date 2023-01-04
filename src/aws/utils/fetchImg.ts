import puppeteer from "puppeteer";

const { Page, devices } = puppeteer;

let browser;

async function getPage() {
  if (!browser) {
    browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      args: ["--no-sandbox", "--disabled-setupid-sandbox"],
    });
  }
  //   const options = {
  //     args: chrome.args,
  //     executablePath: await chrome.executablePath,
  //     headless: chrome.headless,
  //   }
  //   const browser = await launch(options)
  const _page = await browser.newPage();
  return _page;
}

export const fetchImg = async (url, mobile = 0) => {
  const page = await getPage();
  await page.emulate(devices[mobile == 1 ? "iPhone X" : "iPad Pro"]);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, 1500);
  });
  const file = await page.screenshot({ fullPage: false });
  return file;
};
