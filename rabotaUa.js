import cheerio from "cheerio";
import puppeteer from "puppeteer";

function Vacancies() {
  this.list = [];
  this.maxSize = 10;
}
Vacancies.prototype.push = function (vacancy) {
  if (this.list.length >= this.maxSize) {
    this.list.pop();
  }
  this.list.shift(vacancy);
};
let vacancies = new Vacancies();
// let jobList = [];
let jobLink = "";
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
    const vacanciesCollection = Array.from(document(selector));
    const lastJobLink = document(vacanciesCollection[0]).attr("href");
    // for (let i = 0; i < vacanciesCollection.length; i++) {
    //   const vacancy = document(vacanciesCollection[i]).text().trim();
    //   vacancies.push(vacancy);
    // }
    if (jobLink === "") {
      jobLink = lastJobLink;
      return false;
    }
    if (jobLink !== lastJobLink) {
      jobLink = lastJobLink;
      return true;
    }

    return false;
  } catch (err) {
    console.log(err);
  }
}
// function includesAllValues(arr1, arr2) {
//   for (let i = 0; i < arr2.length; i++) {
//     if (!arr1.includes(arr2[i])) return false;
//   }
//   return true;
// }

export default rabotaUaChecker;
