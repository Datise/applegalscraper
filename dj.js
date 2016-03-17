'use strict';

const Cheerio = require('cheerio');
var request = require('request');
var stringify = require('csv-stringify');
var fs = require('fs');
const csvWriter = require('csv-write-stream')
const writer = csvWriter({ headers: ["Topic", "Subtopic", "AnswerKey", "Preview", "Answer", "Region"]})
writer.pipe(fs.createWriteStream('out.csv'))

// function buildFromPage(element){
//   debugger;
//   var link = $(this).find('a')
//   console.log(link)
//   request("http://www.legalline.ca" + link, function(err, response, body){
//     var $ = Cheerio.load(body)
//     var headerObject = $('body').find('.articleHeader')
//     var title = headerObject.find('h1').text()
//     var artNum = headerObject.find('.art-no').text()
//     artNum = artNum.replace("Answer Number: ", "")
//     var region = headerObject.find('.region').text()
//     region = region.replace('Region: ', "")
//     var text = $('body').find('.pf-content').text()
//     text = text.substring(0, 700)
//     writer.write(["world","bar","taco"])
//     writer.end()
//   })
// }
var provice_array = ["British%20Columbia", "Alberta", "Mantioba", "Nova%20Scotia", "New%20Brunswick", "NL", "NWT", "Nunavut", "Ontario", "PEI", "Quebec", "Saskatchewan", "Yukon"]
// var j = request.jar();
// var cookie = request.cookie('province=BritishCol');
// var url = 'http://www.google.com';
// j.setCookie(cookie, url);
// request({url: url, jar: j}, function () {
//   request('http://images.google.com')
// })
for(var l = 0; l < provice_array.length - 1; l++){
let j = request.jar()
let cookie = request.cookie('province=' + provice_array[l])
var url = 'http://www.legalline.ca/legal-answers/'
j.setCookie(cookie)
request({url: url, jar: j}, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var $ = Cheerio.load(body);
    $('body').find('.article-container').find('li').each(function(index, element) {
      var topic = $(this).find('a').text();
      var url = $(this).find('a').attr('href');
      if(url.indexOf("http://www.legalline.ca") > -1){
      }else{
        url = "http://www.legalline.ca"  + url
      }
      console.log("COOKIE IS:" + cookie)
      console.log("URL IS:" + url)
      request({url: url, jar: j}, function(error, response, body){
        var $ = Cheerio.load(body);
        var subCatSearch = $('body').find('.padded-container').find('h2').text()
        var artNum = $('body').find('.art-no').text()
        if(subCatSearch){
          $('body').find('.article-container').find('.submenuPosts').find('li').each(function(index, element){ 
            var url = $(element).find('a').attr('href')
            request({url: url, jar: j}, function(err, response, body){
              if(body == null){
                return false
              }
              var $ = Cheerio.load(body)
              var headerObject = $('body').find('.articleHeader')
              var title = headerObject.find('h1').text()
              var artNum = headerObject.find('.art-no').text()
              artNum = artNum.replace("Answer Number: ", "")
              var region = headerObject.find('.region').text()
              region = region.replace('Region: ', "")
              var text = $('body').find('.pf-content').text()
              var fullAnswer = text
              var preview = text.substring(0, 700)
              var articleTopic = $('body').find('.sidebar').find('.parentTaxSidebar').html()
              writer.write([articleTopic,title,artNum,preview, fullAnswer, region])
            })
          })
        }else if(artNum){
          var headerObject = $('body').find('.articleHeader')
          var title = headerObject.find('h1').text()
          var artNum = headerObject.find('.art-no').text()
          artNum = artNum.replace("Answer Number: ", "")
          var region = headerObject.find('.region').text()
          region = region.replace('Region: ', "")
          var text = $('body').find('.pf-content').text()
          var fullAnswer = text
          var preview = text.substring(0, 700)
          var articleTopic = $('body').find('.sidebar').find('.parentTaxSidebar').html()
          writer.write([articleTopic,title,artNum,preview, fullAnswer, region])
        }else{
          $('body').find('.padded-container').find('.article-container').find('ul').find('li').each(function(index, element){
            var link = $(this).find('a')
            request({url: "http://www.legalline.ca" + link, jar: j}, function(err, response, body){
              var $ = Cheerio.load(body)
              var headerObject = $('body').find('.articleHeader')
              var title = headerObject.find('h1').text()
              var artNum = headerObject.find('.art-no').text()
              var region = headerObject.find('.region').text()
              region = region.replace('Region: ', "")
              var text = $('body').find('.pf-content').text()
              var fullAnswer = text
              var preview = text.substring(0, 700)
              writer.write([articleTopic,title,artNum, preview, fullAnswer, region])
            })
          })
        }
      })
    })
  }
})
}