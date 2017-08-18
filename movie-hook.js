const http = require('http');
const moviedb = require('moviedb')(process.env.THEMOVIEDB_API_KEY);
const _ = require('lodash');
const genres = require('./data/genres.json');

module.exports = (query, res) => {
  let promise;
  switch(query.action) {
    case 'find.movie.by.genre':
      promise = findByGenre(query.parameters['genre']);
    break;  
  }
  res.setHeader('Content-Type', 'application/json');
  promise.then((output) => {
    res.send(JSON.stringify({ 'speech': output, 'displayText': output }));  
  }, (err) => {
    res.send(JSON.stringify({ 'speech': err, 'displayText': err }));  
  });
}

function findByGenre(genre) {
  return new Promise((resolve, reject) => {
    let found = _.filter(genres, {'name': genre});
    if (found.length > 0) {
      moviedb.discoverMovie({
        with_genres: found[0].id,
        language: 'en-US',
        sort_by: 'popularity.desc', 
        include_adult: false,
        include_video: false
      }, (err, res) => {
        if (err) reject(`I was not able to find any movie with that genre`);
        let movie = res.results[Math.floor(Math.random() * res.results.length)];
        resolve(`You might like '${movie.title}', it has an ${movie.vote_average} out of 10 rating`);
      })
    } else {
      reject(`I was not able to find any movie with that genre`);
    }  
  });
}