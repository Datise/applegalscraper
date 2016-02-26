var cheerio = require('cheerio');
var request = require('request');
var stringify = require('csv-stringify');
var fs = require('fs');

request('http://substack.net/images/', function (error, response, body) {
  var file_permission = [];
  var absolute_url = [];
  var file_type = [];
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(body);
    $('body').find('tr').each(function(index, element) {
      file_permission.push($(this).find('code').html());
      file_type.push($(this).find('a').html().split('.')[1]);
      absolute_url.push('http://substack.net/images/' + $(this).find('a').html());
    });

    var arr_for_csv = two_d_array(file_permission, absolute_url, file_type);

    stringify(arr_for_csv, function(err, csv_doc) {
      fs.writeFile('./substack.csv', csv_doc, 'utf8', function (err) {
        if (err) {
          console.log('Some error occured - file either not saved or corrupted file saved.');
        } else{
          console.log('It\'s saved!');
        }
      });
    });
  }
});

function two_d_array(arr1, arr2, arr3) {
  var output = [];
  for (var i = 0; i < arr1.length; i++) {
    output.push([arr1[i], arr2[i], arr3[i]]);
  }
  return output;
}