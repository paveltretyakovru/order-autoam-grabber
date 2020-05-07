const fs = require('fs');
const Parser = require('json2csv').Parser;

const newLineChar = process.platform === 'win32' ? '\r\n' : '\n';
const dataArray = fs.readFileSync('./cars.txt').toString().split(newLineChar);

console.log('Count data lines:', dataArray.length);
console.log('First line:', JSON.parse(dataArray[0]))

// Collection information about cars data fileds names
const ids = [];
const fields = [];
const resultData = dataArray.map((carJson) => {
  const car = JSON.parse(carJson);
  
  Object.keys(car).forEach((field) => {
    if (fields.indexOf(field) === -1) {
      fields.push(field);
    }    
  });

  return car;
}).filter((car) => {
  if (ids.indexOf(car.id) === -1) {
    ids.push(car.id);
    return true;
  }

  return false;
}).map((car) => {
  const result = {},;

  fields.forEach((field) => {
    result[field] = car[field] ? car[field] : '';
  });

  return result;
});

console.log('Prepared first line result data:', resultData[0]);

try {
  const parser = new Parser({ fields });
  const csv = parser.parse(resultData);
  
  fs.writeFileSync('auto.csv', csv);
} catch (error) {
  console.log(error);
}