const http = require('http');
const weather = require('openweather-apis');
const darksky = require("darksky");
const AiResponse = require('./ai-response.js');

weather.setLang('en');
weather.setUnits('metric');
weather.setAPPID(process.env.OPENWEATHER_API_KEY);

module.exports = (query, res) => {
  //console.log('weatherWebhook', req.body);
  // Get the city and date from the request
  let city = query.parameters['geo-city']; // city is a required param
  // Get the date for the weather forecast (if present)
  let date = '';
  
  if (query.parameters['date']) {
    date = query.parameters['date'];
    console.log('Date: ' + date);
  }
  res.setHeader('Content-Type', 'application/json');
  
  switch(query.action) {
    case 'weather.forecast':
      callOpenWeatherForecastApi(city).then((output) => respond(res, output)).catch(err => respond(res, err));
    break;
    case 'weather.city.date':
      callOpenWeatherApi(city, date).then((output) => respond(res, output)).catch(err => respond(res, err));
    break;
  }
}

function respond(res, output) {
  res.send(JSON.stringify(output));
}

function callOpenWeatherForecastApi(query) {
  
  //console.log(query);
  let output = "";
  
  return new Promise((resolve, reject) => {
    //weather.setCity(city);
    weather.getWeatherForecast(function(err, data) {
      
      if (err) reject(err);
      
      let output = `Forecast for ${data.city.name}
Today ${data.list[0].weather[0].description}
Tomorrow ${data.list[7].weather[0].description}
`;
           
       let response = new AiResponse(output);
       response.addContextOut('forecast', 5, data);
            
      resolve(response.response);
    });  
  });
  
}

function callOpenWeatherApi(city) {
  return new Promise((resolve, reject) => {
    weather.setCity(city);
	  weather.getAllWeather(function(err, data){
      let output = `Current conditions in ${data['name']} are ${data['weather'][0]['description']} with a projected high of
        ${data['main']['temp_max']}°C and a low of 
        ${data['main']['temp_min']}°C. Would you like a forecast?`;
      
      let response = new AiResponse(output);
      response.addContextOut('howistheweather-followup', 2, data);
      
      resolve(response.response);
	  });
  });
}



function callWeatherApi (city, date) {
  return new Promise((resolve, reject) => {
    let host = process.env.WEATHER_API_URL;
    // Create the path for the HTTP request to get the weather
    let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +
      '&q=' + encodeURIComponent(city) + '&key=' + process.env.WEATHER_API_KEY + '&date=' + date;
    console.log('API Request: ' + host + path);
    // Make the HTTP request to get the weather
    http.get({host: host, path: path}, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        let response = JSON.parse(body);
        let forecast = response['data']['weather'][0];
        let location = response['data']['request'][0];
        let conditions = response['data']['current_condition'][0];
        let currentConditions = conditions['weatherDesc'][0]['value'];
        // Create response
        let output = `Current conditions in the ${location['type']} 
        ${location['query']} are ${currentConditions} with a projected high of
        ${forecast['maxtempC']}°C or ${forecast['maxtempF']}°F and a low of 
        ${forecast['mintempC']}°C or ${forecast['mintempF']}°F on 
        ${forecast['date']}.`;
        // Resolve the promise with the output text
        console.log(output);
        resolve(output);
      });
      res.on('error', (error) => {
        reject(error);
      });
    });
  });
}