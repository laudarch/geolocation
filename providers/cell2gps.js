const e = require("express");
const puppeteer = require("puppeteer");
const querystring = require("querystring");
const Geolocation = require("./geolocation");

const RE_CELL2GPS = /createPoint\([\d]+,([+\-\d\.]+),([+\-\d\.]+),([\d]+),/i;

module.exports = async (mcc, mnc, lac, cid) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (
      "POST" == request.method() &&
      "http://www.cell2gps.com/" == request.url()
    ) {
      let postData = request.postData();
      let obj = querystring.parse(postData);
      obj.mcc = mcc;
      obj.mnc = mnc;
      obj.lac = lac;
      obj.cellid = cid;
      request.continue({
        postData: querystring.stringify(obj),
      });
    } else if (
      request.url().startsWith("https://www.google.com/recaptcha/") ||
      request.url().startsWith("https://www.gstatic.com/recaptcha/releases/") ||
      "http://www.cell2gps.com/" == request.url()
    ) {
      request.continue();
    } else {
      request.abort();
    }
  });
  await page.goto("http://www.cell2gps.com/");
  // await page.$eval('input[name="mcc"]', (el, value) => (el.value = value), mcc);
  // await page.$eval('input[name="mnc"]', (el, value) => (el.value = value), mnc);
  // await page.$eval('input[name="lac"]', (el, value) => (el.value = value), lac);
  // await page.$eval(
  //   'input[name="cellid"]',
  //   (el, value) => (el.value = value),
  //   cid
  // );
  await page.click('[data-action="submit"]');
  const response = await page.waitForResponse((res) => {
    return (
      "POST" == res.request().method() &&
      "http://www.cell2gps.com/" == res.url()
    );
  });
  const text = await response.text();
  try {
    if (/map\.on\('load',/.test(text)) {
      const groups = RE_CELL2GPS.exec(text);
      if (groups) {
        return new Geolocation(
          "cell2gps",
          Number(groups[1]),
          Number(groups[2]),
          Number(groups[3])
        );
      }
    } else {
      throw new Error("map.on('load') not found");
    }
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
  }
  return null;
};
