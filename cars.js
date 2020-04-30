const fs = require('fs');

class Cars {
  constructor(options) {
    this.cars = [];
    this.page = options.page;
  }

  async add(car) {
    this.cars.push(car);

    const linkToCar = this.cars[this.cars.length - 1];
    await this.parseCarPage(linkToCar);

    const newLineChar = process.platform === 'win32' ? '\r\n' : '\n';
    const carJSON = JSON.stringify(linkToCar);
    fs.appendFileSync('cars.txt', `${newLineChar}${carJSON}`);

    console.log(`
      index: ${this.cars.length - 1};
      parsed car: ${carJSON};
    `);
  }

  async parseCarPage(car) {
    const { page } = this;
    const { id } = car;
    const url = `https://auto.am/offer/${id}`;

    await goToPage(page, url);

    const handleDetail = await page.$('.ad-det');
    const result = await handleDetail.$$eval(
      'tr',
      (nodes) => (
        nodes.map((node) => {
          const label = node.querySelector('td:first-child').textContent.trim();
          const value = node.querySelector('td:last-child').textContent.trim();

          return { [`${label}`]: value };
        })
      )
    );

    if (Array.isArray(result)) {
      result.forEach(details => {
        Object.assign(car, details);
      });
    }

    await page.goBack({ waitUntil: 'networkidle2' });
  }
}

async function goToPage(puppeteerPage, url) {
  return new Promise(async (resovle, reject) => {
    try {
      console.log(`Открываю страницу: ${url} ...`);
      await puppeteerPage.goto(url, { waitUntil: 'networkidle2' });
      resovle();
    } catch (error) {
      console.error(`Ошибка открытия страницы ${url}`, error.message);
      reject(error);
    }
  });
}

module.exports = Cars;