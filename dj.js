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
let cookie = request.cookie('province=Quebec');
var jar = request.jar();
jar.setCookie(cookie);
request({method:'GET', jar:jar, url:'http://www.legalline.ca/legal-answers/'}, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var $ = Cheerio.load(body);
    $('body').find('.article-container').find('li').each(function(index, element) {
      var topic = $(this).find('a').text();
      var url = $(this).find('a').attr('href');
      if(url.indexOf("http://www.legalline.ca") > -1){

      }else{
        url = "http://www.legalline.ca"  + url
      }
      request({method:'GET', jar:jar, url: url}, function(error, response, body){
        var $ = Cheerio.load(body);
        //console.log($('body'))
        var subCatSearch = $('body').find('.padded-container').find('h2').text()
        var artNum = $('body').find('.art-no').text()
        if(subCatSearch){
          $('body').find('.article-container').find('.submenuPosts').find('li').each(function(index, element){ 
            var url = $(element).find('a').attr('href')
            request({method:'GET', jar:jar, url: url}, function(err, response, body){
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
            request({method:'GET', jar:jar, url: "http://www.legalline.ca" + link}, function(err, response, body){
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