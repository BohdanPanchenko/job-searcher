// const axios = require("axios");
// const nodemailer = require("nodemailer");
// const cheerio = require("cheerio");
// const dotenv = require("dotenv");
import express from "express";
import axios from "axios";
import nodemailer from "nodemailer";
import cheerio from "cheerio";
import dotenv from "dotenv";

const app = express();
const port = 3000;
dotenv.config();

import rabotaUaChecker from "./rabotaUaSearcher.js";

const emailConfig = {
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
};
const transporter = nodemailer.createTransport(emailConfig);
const recipientEmail = "logitechchillstream@gmail.com";
const checkInterval = 60000;
const vacanciesData = [
  {
    url: "https://www.work.ua/jobs-front-end/",
    selector: ".job-link a",
    lastVacancyName: "",
  },
  {
    url: "https://www.work.ua/jobs-react/",
    selector: ".job-link a",
    lastVacancyName: "",
  },
  {
    url: "https://www.work.ua/jobs-javascript/",
    selector: ".job-link a",
    lastVacancyName: "",
  },
  {
    url: "https://www.work.ua/jobs-html/",
    selector: ".job-link a",
    lastVacancyName: "",
  },
  {
    url: "https://djinni.co/jobs/?all-keywords=junior&any-of-keywords=&exclude-keywords=&primary_keyword=JavaScript&keywords=junior",
    selector: ".job-list-item__link",
    lastVacancyName: "",
  },
];
function getLastVacancyName(data, selector) {
  const document = cheerio.load(data);
  const lastVacancy = document(selector)[0];
  return {
    name: document(lastVacancy).text().trim(),
    link: document(lastVacancy).attr("href"),
  };
}

async function checkVacanciesAndSendEmail() {
  for (let i = 0; i < vacanciesData.length; i++) {
    try {
      const response = await axios.get(vacanciesData[i].url);

      const data = response.data;
      const { name, link } = getLastVacancyName(
        data,
        vacanciesData[i].selector
      );
      if (vacanciesData[i].lastVacancyName === "") {
        vacanciesData[i].lastVacancyName = name;
        continue;
      }
      if (name !== vacanciesData[i].lastVacancyName) {
        const mailOptions = {
          from: emailConfig.auth.user,
          to: recipientEmail,
          subject: "Найдена новая вакансия!",
          text: `На сайте ${vacanciesData[i].url} обнаружена новая вакансия!\n ${name}.\n Посмотрите срочно! - ${link}`,
        };
        await transporter.sendMail(mailOptions);
        console.log("Message has been sent.");
      } else {
        console.log(
          "Новых вакансий не обнаружено.",
          vacanciesData[i].lastVacancyName
        );
      }
      vacanciesData[i].lastVacancyName = name;
    } catch (error) {
      console.error("Ошибка при проверке вакансий:", error.message);
    }
  }
  if (await rabotaUaChecker()) {
    const mailOptions = {
      from: emailConfig.auth.user,
      to: recipientEmail,
      subject: "Найдена новая вакансия!",
      text: `На сайте rabota.ua обнаружена новая вакансия!\nПосмотрите срочно!`,
    };
    await transporter.sendMail(mailOptions);
    console.log("Message has been sent.");
  }

  const hours = new Date().getHours();
  const minutes = new Date().getMinutes();
  console.log(
    `${hours}:${
      minutes > 9 ? minutes : "0" + minutes
    } \n--------------------------------------\n`
  );
}

// setTimeout(checkVacanciesAndSendEmail, checkInterval);
setInterval(checkVacanciesAndSendEmail, checkInterval);

app.get("/", async (req, res) => {
  try {
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
app.listen(port, () => {
  console.log("Server starting...");
  setInterval(checkVacanciesAndSendEmail, checkInterval);
});

export default app;
