const http = require('http');
const moviedb = require('moviedb')(process.env.THEMOVIEDB_API_KEY);
const _ = require('lodash');
const genres = require('./data/genres.json');
const AiResponse = require('./ai-response.js');

module.exports = (query, res) => {
  let promise;
  
  switch(query.action) {
    case 'find.movie.by.genre':
      promise = findByGenre(query.parameters['genre']);
    break;
    case 'find.plot.for.movie':
      promise = findPlotForMovie(query.contexts);
    break;
  }
  res.setHeader('Content-Type', 'application/json');
  promise.then((output) => {
    console.log(output);
    res.send(JSON.stringify(output));  
  }, (err) => {
    console.log('error in promise');
    res.send(JSON.stringify({ 'speech': err, 'displayText': err }));  
  });
}

function findPlotForMovie(contexts) {
  return new Promise((resolve, reject) => {
    let title = _.filter(contexts, ({name: 'movie_title'}))[0].parameters.title;
  })
}

function findByGenre(genre) {
//console.log('find by genre', genre.toLowerCase().trim());
  return new Promise((resolve, reject) => {
    
    let found = _.filter(genres, {'name': genre.toLowerCase().trim()});
    
    console.log('found', found);
    
    if (found.length > 0) {
      moviedb.discoverMovie({
        with_genres: found[0].id,
        language: 'en-US',
        sort_by: 'popularity.desc', 
        include_adult: false,
        include_video: false
      }, (err, res) => {
        if (err) {
          console.log(err);
          reject(`I was not able to find any movie with that genre`);
        }
        
        let movie = res.results[Math.floor(Math.random() * res.results.length)];
        
        const returnQuestions = [
          {question: 'Do you want to see the poster?', 
           context: {name : 'movie_poster', lifetime: 2, data: movie}},
          {question: 'Do you want to know the plot?',
          context: {name: 'movie_plot', lifetime: 2, data: movie}},
          {question: 'Would you like to know the rating?',
          context: {name: 'movie_rating', lifetime: 2, data: movie}}
        ];
        
        const returnQuestion = returnQuestions[Math.floor(Math.random() * returnQuestions.length)];
        
        
        let response = new AiResponse(`You might like '${movie.title}'. ${returnQuestion.question}`);
        
    
        _.each(_.reject(returnQuestions, {question: returnQuestion.question}), (item) => {
          //console.log(item);
          response.addContextOut(item.context.name, 0, []);
        });
        
        response.addContextOut(returnQuestion.context.name, returnQuestion.context.lifetime, returnQuestion.context.data);
        response.addContextOut('movie', 2, movie);
        
                               
        //console.log(response.response);
        //resolve(`You might like '${movie.title}', it has an ${movie.vote_average} out of 10 rating`);
        resolve(response.response);
                
      })
    } else {
      reject(`I was not able to find any movie with that genre`);
    }  
  });
}