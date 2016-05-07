var config = require('./config');
var express = require('express');
var https = require('https');
var app = express();

var recentSearches = [];

app.get('/imagesearch/:query', function(request, response) {
  var currDate = new Date().toISOString();
  var query = request.params.query;
  var offset = request.query.offset;
  recentSearches.push({term: query, when: currDate});

  var apiPath = 'https://www.googleapis.com/customsearch/v1';
  apiPath += '?key='+config.apiKey+'&cx='+config.cseID;
  apiPath += '&searchType=image';
  apiPath += '&num=5';
  apiPath += '&q=' + query;
  if (offset !== undefined)
    apiPath += '&start=' + offset;
  var apiRawData = '';

  https.get(apiPath, function(res) {
    res.on('data', function(chunk) {
      apiRawData += chunk;
    });

    res.on('end', function() {
      var toSend = [];
      var queryData = JSON.parse(apiRawData).items;
      //apiDataObj.items.foreach(function(item) {
      for (var i = 0; i < queryData.length; i++) {
        var item = queryData[i];
        var formattedObject = {};
        formattedObject.url = item.link;
        formattedObject.snippet = item.snippet;
        formattedObject.thumbnail = item.image.thumbnailLink;
        formattedObject.context = item.image.contextLink;
        toSend.push(formattedObject);
      }

      response.send(JSON.stringify(toSend));
    });
  });
});

app.get('/latest', function(request, response) {
  response.writeHead(200);
  response.end(JSON.stringify(recentSearches));
});

app.listen(config.port, function() {
  console.log('Running on port '+config.port);
});
