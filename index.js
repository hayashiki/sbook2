import 'dotenv/config'
import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import normalizePort from 'normalize-port'
import cloneDeep from 'lodash.clonedeep'
import { createMessageAdapter } from '@slack/interactive-messages';
import { createSlackEventAdapter } from '@slack/events-api';
import axios from "axios"
import bot from './src/lib/bot';

const port = normalizePort(process.env.PORT || '3000');
const app = express();
const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/slack/commands', (req, res) => {
  console.log(req.body)
  const { token, text, trigger_id, user_name: userName } = req.body;
  // token check
  const AMAZON_URL = text
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    console.log('Token valid');

    // Start Scraping
    const puppeteer = require('puppeteer');
    (async () => {
      const browser = await puppeteer.launch();
      try {
        const page = await browser.newPage();
        await page.goto(AMAZON_URL);
        let itemPriceSelector="#tmmSwatches .swatchElement.selected span.a-color-base"
        const priceText = await page.evaluate((selector) => {
          return document.querySelector(selector).innerText
        }, itemPriceSelector);

        let itemIsbnSelector="#ASIN"
        let isbn = await page.evaluate((selector) => {
          if(!document.querySelector(selector)) return null
          return document.querySelector(selector).value
        }, itemIsbnSelector);

        if (!isbn) {
          itemIsbnSelector="input[name='ASIN.0']"
          isbn = await page.evaluate((selector) => {
            if(!document.querySelector(selector)) return null
            return document.querySelector(selector).value
          }, itemIsbnSelector);
        }

        let price = Number(((priceText.match(/\d+(.|,)\d+/g) || ["0"])[0]).replace(/,/g, ''));
        let itemTitleSelector="span#productTitle"
        let title = await page.evaluate((selector) => {
          if(!document.querySelector(selector)) return null
          return document.querySelector(selector).innerText
        }, itemTitleSelector);

        if (!title) {
          itemTitleSelector="#ebooksProductTitle"
          title = await page.evaluate((selector) => {
            if(!document.querySelector(selector)) return null
            return document.querySelector(selector).innerText
          }, itemTitleSelector);
        }
        // 取得結果を出力。この結果をGASになげて、spreadsheetを更新
        console.log(priceText)
        console.log(price)
        console.log(isbn)
        console.log(title)
        await browser.close();

        await const res = axios({
          method: 'post',
          url: process.env.GAS_END_POINT,
          headers: {'Authentication': token},
          data: {
            token: token,
            link: AMAZON_URL,
            isbn: isbn,
            price: price,
            title: title,
            userName: userName,
          }
        });

        console.log(res)

      } catch (e) {
        await console.error(e)
        await browser.close();
      }
    })();




    res.send('');
  } else {
    console.error();('Token invalid');
    res.sendStatus(500);
  }
});

http.createServer(app).listen(port, () => {
  console.info(`server listening on port ${port}`);
});
