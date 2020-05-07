
const puppeteer = require('puppeteer');
const Cars = require('./cars');

const urlToEngVersion = 'https://auto.am/lang/en';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const cars = new Cars({ page });

  await goToPage(page, urlToEngVersion);
  
  let counter = 150;
  const maxPages = 201;
  
  while (counter < maxPages) {
    await goToListPage(page, counter);

    const pageAds = await getListOfPageAds(page);

    console.log(`====================> PAGE: ${counter}, <====================`);

    if (Array.isArray(pageAds)) {
      for (let i = 0; i < pageAds.length; i += 1) {
        const car = pageAds[i];
        await cars.add(car);
      }
    }

    counter++;
  }
  

  await browser.close();
})();

async function getListOfPageAds(page) {
  return new Promise(async (resolve, reject) => {
    try {
      
      const pageAdsSelector = '#search-result .card';
      const handlePage = await page.$('#search-result');
      const result = await handlePage.$$eval('.card', (nodes) => (
        nodes.map((node) => {
          const dateSelector = '.offer-aded-date';
          const priceSelector = '.price';
          const brandAndYearSelector = '.card-title';

          const price = node.querySelector(priceSelector).textContent.trim();
          const date = node.querySelector(dateSelector).textContent.trim();

          const brandAndYear = node.querySelector(brandAndYearSelector)
            .textContent.trim();

          const year = parseInt(brandAndYear);
          const brand = (() => {
            return brandAndYear
              .split(' ')
              .filter((e, i) => i !== 0)
              .join(' ')
              .trim()
              .replace(/(\r\n|\n|\r)/gm, '');
          })();

          const id = (() => {
            const idArr = node.id.split('-');
            return idArr[idArr.length -1];
          })();

          return {
            id,
            date,
            year,
            brand,
            price,
          };
        })
      ));

      resolve(result);
    } catch (error) {
      console.error(`getListOfPageAds() ==>`, error.message);
      reject(error);
    }
  });
}

async function goToListPage(puppeteerPage, pageNumber) {
  return new Promise(async (resovle, reject) => {
    try {
      const url = `https://auto.am/search/passenger-cars?q={"category":"1","page":"${pageNumber},","sort":"latest","layout":"complist","user":{"dealer":"0","id":""},,"make":["246","386","276","31","156","21","26","46","56"],"year":{"gt":"2000","lt":"2019"},,"usdprice":{"gt":"1000","lt":"100000"},,"custcleared":"1","mileage":{"gt":"10","lt":"1000000"},,"geo":["12"]},`;
      await goToPage(puppeteerPage, url);

      resovle();
    } catch (error) {
      console.error('goToListPage()', error.message);
      reject(error);
    }
  });
}

async function goToPage(puppeteerPage, url) {
  return new Promise(async (resovle, reject) => {
    try {
      console.log(`Открываю страницу: ${url}, ...`);
      await puppeteerPage.goto(url, { waitUntil: 'networkidle2' });
      resovle();
    } catch (error) {
      console.error(`Ошибка открытия страницы ${url},`, error.message);
      reject(error);
    }
  });
}