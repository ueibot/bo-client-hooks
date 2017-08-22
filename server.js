// bo-weather-hook
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Hooks
const movieHook = require('./movie-hook');
const weatherHook = require('./weather-hook');
const stocksHook = require('./stocks-hook');
const wikipediaHook = require('./wikipedia-hook');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
  
  movieHook({action: 'find.movie.by.genre', parameters: { genre: 'Action'}}, res);
  
});

// check incomming web hook requets
app.post('/webhook', (req, res) => {
  
  //console.log(req.body);
  
  switch(req.body.result.action) {
    case 'find.movie.by.genre':
    case 'find.plot.for.movie':
      movieHook(req.body.result, res);
    break;
    case 'weather.forecast':
    case 'weather.city.date':
      weatherHook(req.body.result, res);
    break;
    case 'stock.info':
      stocksHook(req.body.result, res);
    break;
    case 'wiki.search':
      wikipediaHook(req.body.result, res);
    break;  
  }
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
