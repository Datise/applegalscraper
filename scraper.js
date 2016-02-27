var cheerio = require('cheerio');
var request = require('request');
var stringify = require('csv-stringify');
var fs = require('fs');

var everything = []

var topics = [];
var topics_url = [];
request('http://www.legalline.ca/legal-answers/', function (error, response, body) {
  
  // var file_type = [];
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(body);
    $('body').find('.article-container').find('li').each(function(index, element) {
      topics.push($(this).find('a').text());
      // file_type.push($(this).find('a').text().split('.')[1]);
      topics_url.push($(this).find('a').attr('href'))
      // topics_url.push('http://www.legalline.ca/legal-answers/topic/' + $(this).find('a').text().toLowerCase().split(' ').join('-'));
    });

    var arr_for_csv = two_d_array(topics, topics_url);
    

    stringify(arr_for_csv, function(err, csv_doc) {
      fs.writeFile('./substack.csv', csv_doc, 'utf8', function (err) {
        if (err) {
          console.log('Some error occured - file either not saved or corrupted file saved.');
        } else{
          console.log('It\'s saved!');
        }
      });
    });

    for (var i = 0, len = topics_url.length; i < len; i++) {

    }

    var sub_topics = [];

    var answer_key = []
    var content = []
    topics_url.forEach(function(url, index) {
      // Check if full path or relative
      if (url.charAt(0) == 'h') {

        request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            $('body').find('.article-container').find('a').each(function(index, element) {
              sub_topics.push($(this).text())
              sub_url = $(this).attr('href')

              // Get Answer code and content of sub_url
              request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  var $ = cheerio.load(body);
                  answer_key.push($('body').find('.articleHeader').find('.art-no').text());
                  content.push($('body').find('pf-content').text().substr(0,30));
                }
              });
            })
          }
          everything.push([topics[index], sub_topics[index], answer_key[index], content[index]])
          // console.log(topics[index], sub_topics[index], answer_key[index], content[index])
          if (index == topics_url.length - 1){
            save(topics, sub_topics, answer_key, content);
          }
        });
      } else {
        request('http://www.legalline.ca/' + url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            sub_topics.push('-')
            answer_key.push($('body').find('.articleHeader').find('.art-no').text())
            content.push($('body').find('pf-content').text().substr(0,30));

          }
          everything.push([topics[index], sub_topics[index], answer_key[index], content[index]])
          // console.log(topics[index], sub_topics[index], answer_key[index], content[index])

          if (index == topics_url.length - 1){
            save(topics, sub_topics, answer_key, content);
          }
        });
      }
    })

  }
});

function save(topics, sub_topics, answer_key, content){
  var arr_for_csv = two_d_array2(topics, sub_topics, answer_key, content);

  stringify(arr_for_csv, function(err, csv_doc) {
    fs.writeFile('./second_layer.csv', csv_doc, 'utf8', function (err) {
      if (err) {
        console.log('Some error occured in second layer - file either not saved or corrupted file saved.');
      } else{
        console.log('Saved for second layer!');
      }
    });
  });
}



function two_d_array2(arr1, arr2, arr3, arr4) {
  var output = [];
  for (var i = 0; i < arr1.length; i++) {
    output.push([arr1[i], arr2[i], arr3[i], arr4[i]]);
  }
  
  return output;
}


function two_d_array(arr1, arr2) {
  var output = [];
  for (var i = 0; i < arr1.length; i++) {
    output.push([arr1[i], arr2[i]]);
  }
  return output;
}