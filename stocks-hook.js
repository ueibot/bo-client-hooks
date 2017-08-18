const request = require('request');
const _ = require('lodash');

module.exports = (query, res) => {
  let promise;
  switch(query.action) {
    case 'stock.info':
      promise = findByCompany(query.parameters['company']);
    break;  
  }
  res.setHeader('Content-Type', 'application/json');
  promise.then((output) => {
    res.send(JSON.stringify({ 'speech': output, 'displayText': output }));  
  }, (err) => {
    res.send(JSON.stringify({ 'speech': err, 'displayText': err }));  
  });
  
}

function findByCompany(company) {
  return new Promise((resolve, reject) => {
    request.get(`http://autoc.finance.yahoo.com/autoc?query=${company}&region=EU&lang=en-GB`, (error, response, body) => {
      let data = JSON.parse(body);
      let nasdaq = _.filter(data.ResultSet.Result, { exch: 'NAS', type: 'S'});
      let stock = nasdaq[0];
      console.log(stock);
      if (stock) {
        request.get(`http://marketdata.websol.barchart.com/getQuote.json?apikey=${process.env.BARCHART_API_KEY}&symbols=${stock.symbol}`, (err, res, body) => {
          let data = JSON.parse(body);
          let stock = data.results[0];
          console.log(stock);
          resolve(`The last price for ${stock.name} stock was $${stock.lastPrice}`);
        });
      } else {
        reject(`Could not find information for ${company}`)
      }
    });
  });
}