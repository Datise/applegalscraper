var cheerio = require('cheerio');
var request = require('request');
var stringify = require('csv-stringify');
var fs = require('fs');

everything = []
var provice_array = ["British%20Columbia", "Alberta", "Mantioba", "Nova%20Scotia", "New%20Brunswick", "NL", "NWT", "Nunavut", "Ontario", "PEI", "Quebec", "Saskatchewan", "Yukon"]
// var j = request.jar();
// var cookie = request.cookie('province=BritishCol');
// var url = 'http://www.google.com';
// j.setCookie(cookie, url);
// request({url: url, jar: j}, function () {
//   request('http://images.google.com')
// })
for(var l = 0; l < provice_array.length; l++){
  var j = request.jar()
  var cookie = request.cookie('province=' + provice_array[l])
  var url = 'http://www.legalline.ca/legal-answers/'
  j.setCookie(cookie, url)
request({url: url, jar: j}, function (error, response, body) {
  
  // var file_type = [];
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(body);
    $('body').find('.article-container').find('li').each(function(index, element) {
      var topic = $(this).find('a').text();
      var url = $(this).find('a').attr('href');
      
      if (url.charAt(0) == 'h') {
        request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            $('body').find('.article-container').find('a').each(function(index, element) {
              sub_topic = $(this).text();
              sub_topic_url = $(this).attr('href');
              // console.log(sub_topic_url)
              if ((sub_topic_url === undefined) || sub_topic_url === '/') {
                
              } else if (sub_topic_url.charAt(0) == 'h') {
                request(sub_topic_url, function (error, response, body) {
                  if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(body);
                    var answer_key = $('body').find('.articleHeader').find('.art-no').text();
                    var content = $('body').find('pf-content').text().substr(0,30)
                    everything.push([topic, sub_topic, answer_key, content])
                  }
                })
              }
            })
          }
        })

        if (index == ($('body').find('.article-container').find('li').length - 1)) {
          stringify(everything, function(err, csv_doc) {
            fs.writeFile('./second_layer.csv', csv_doc, 'utf8', function (err) {
              if (err) {
                // console.log('Some error occured - file either not saved or corrupted file saved.');
              } else{
                // console.log('Second layer saved!');
              }
            });
          });
        }
        
      } else {
        request('http://www.legalline.ca'+url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var answer_key = $('body').find('.articleHeader').find('.art-no').text();
            var content = $('body').find('pf-content').text().substr(0,30)
            everything.push([topic, '-', answer_key, content])
          }
        })

        if (index == ($('body').find('.article-container').find('li').length - 1)) {
          stringify(everything, function(err, csv_doc) {
            fs.writeFile('./second_layer.csv', csv_doc, 'utf8', function (err) {
              if (err) {
                // console.log('Some error occured - file either not saved or corrupted file saved.');
              } else{
                // console.log('Second layer saved!');
              }
            });
          });
        }

      }   
    });
    // var arr_for_csv = two_d_array(topics, topics_url); 
  }
})
}