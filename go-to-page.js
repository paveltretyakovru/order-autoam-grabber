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

module.exports = goToPage;