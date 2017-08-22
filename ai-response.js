'use strict';

var AiResponse = function(text) {
  this.response = {
    speech: text,
    displayText: text,
    contextOut: []
  }  
}
  
AiResponse.prototype.addContextOut = function (name, lifespan = 2, parameters = {}) {
  this.response.contextOut.push({
    name: name,
    lifespan: lifespan,
    parameters: parameters
  });
}

module.exports = AiResponse;