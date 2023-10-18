import cheerio from "cheerio";
import puppeteer from "puppeteer";

let jobLinks = [];
async function rabotaUaChecker() {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = "https://robota.ua/ru/zapros/javascript/ukraine";
    const selector = ".card";
    await page.goto(url);

    await page.waitForSelector(selector);

    const html = await page.content();

    await browser.close();

    const document = cheerio.load(html);
    let vacancies = Array.from(document(selector));
    vacancies = vacancies.map((el) => document(el).attr("href"));

    if (jobLinks.length === 0) {
      jobLinks = [...vacancies];
      return false;
    }
    if (!includesAllValues(jobLinks, vacancies)) {
      jobLinks = Array.from(new Set([...vacancies, ...jobLinks]));
      if (jobLinks.length > 10) jobLinks.pop();

      return true;
    }
    // console.log(jobLinks.length, jobLinks);
    return false;
  } catch (err) {
    console.log(err);
  }
}
function includesAllValues(arr1, arr2) {
  for (let i = 0; i < arr2.length; i++) {
    if (!arr1.includes(arr2[i])) return false;
  }
  return true;
}

export default rabotaUaChecker;
module.exports = [puppeteer, cheerio];
