const https = require('https');
const wikiPediaApiHost = 'https://en.wikipedia.org/w/api.php?';

module.exports = (query, res) => {
  
  var searchTerm = query.parameters['wikisearchterm'];
  
  callWikiPediaApi(searchTerm)
      .then((output) => {
          let displayText = `Nothing Found for: ${searchTerm}`;
          let result;
          if (output && output[0]) {
              displayText = `Here is what I found in Wikipedia about ${output[1][0]}: ${output[2][0]}`;
          }
    
          //console.log(displayText);
    
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({ 'speech': displayText, 'displayText': displayText }));  
      });
  
}

function callWikiPediaApi(searchTerm, format = "json", action = "opensearch", limit = 2, profile = "fuzzy") {
    return new Promise((resolve, reject) => {
        let url = `${wikiPediaApiHost}&format=${format}&action=${action}&limit=${limit}&profile=${profile}&search=${searchTerm}`;
        https.get(url, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                let jO = JSON.parse(body);
                resolve(jO);
            });
            res.on('error', (error) => {
                reject(error);
            });
        });
    });
}
