var express = require('express');
var router = express.Router();
var request = require('request');
const cheerio = require('cheerio')
var mongoose  = require('mongoose');

const Url = require('../models/url');

function textFormatter(stringToFormat){
   //GLOBAL
    stringToFormat = stringToFormat.replace(/ {2,}/g,' ');
    stringToFormat = stringToFormat.replace(/\n/g,'');
    stringToFormat = stringToFormat.replace(/\t/g,'');
    stringToFormat = stringToFormat.replace(/(&#xB0|&#xBA;)/g,'°');

    stringToFormat = stringToFormat.replace(/&#xb0/g,'°');
    stringToFormat = stringToFormat.replace(/&#xAE;/g, '®');
    
    stringToFormat = stringToFormat.replace(/(&#xE0;|&#xE1;|&#xE2;|&#xE3;|&#xE4;|&#xE5;)/g, 'a');
    stringToFormat = stringToFormat.replace(/(&#xE8;|&#xE9;|&#xEA;|&#xEB;)/g, 'e');
    stringToFormat = stringToFormat.replace(/(&#xEC;|&#xED;|&#xEE;|&#xEF;)/g, 'i');
    stringToFormat = stringToFormat.replace(/(&#xF2;|&#xF3;|&#xF4;|&#xF5;|&#xF6;)/g, 'o');
    stringToFormat = stringToFormat.replace(/(&#xF9;|&#xFA;|&#xFB;|&#xFC;)/g, 'u');

    stringToFormat = stringToFormat.replace(/&#xD1;/g, 'Ñ');
    stringToFormat = stringToFormat.replace(/&#xF1;/g, 'ñ');

    stringToFormat = stringToFormat.replace(/(&#xC0;|&#xC1;|&#xC2;|&#xC3;|&#xC4;|&#xC5;)/g, 'A');
    stringToFormat = stringToFormat.replace(/(&#xC8;|&#xC9;|&#xCA;|&#xCB;)/g, 'E');
    stringToFormat = stringToFormat.replace(/(&#xCC;|&#xCD;|&#xCE;|&#xCF;)/g, 'I');
    stringToFormat = stringToFormat.replace(/(&#xD2;|&#xD3;|&#xD4;|&#xD5;|&#xD6;)/g, 'O');
    stringToFormat = stringToFormat.replace(/(&#xD9;|&#xDA;|&#xDB;|&#xDC;)/g, 'U');

    stringToFormat = stringToFormat.replace(/&#xDF;/g, 'ß');
    
    return stringToFormat;
  }
function checkIfIsAmazonUrl (urlToCheck) {
  const arrayCountries = ['https://www.amazon.es/', 'https://www.amazon.com.au/', 'https://www.amazon.de/', 'https://www.amazon.com.br/', 'https://www.amazon.ca/', 'https://www.amazon.com/','https://www.amazon.fr/','https://www.amazon.it/','https://www.amazon.com.mx/','https://www.amazon.nl/', 'https://www.amazon.co.uk/']
 
  for(let i = 0; i < arrayCountries.length; i++){
      const results = urlToCheck.search(arrayCountries[i]);
      if(results === 0){ 
        return true;
      } else { 
        return false;
      }
      
  }

}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Amazon SEO Checker', description: 'Check your SEO status inside page product of Amazon' });
  
  //console.log('test check',checkIfIsAmazonUrl('http://jordipiella.es'))

});

router.post('/check-product', (req, res, next)=>{
  const urlToCheck = req.body.urlToCheck;
   

  if(checkIfIsAmazonUrl(urlToCheck)){
      Url.findOne({url: urlToCheck}, (err, docs)=> {
        console.log('que pasa', docs.url);
          if(!docs){
            requestFunction();
          } else {
            console.log('Please wait 15 min for this url')
            res.redirect('/')
          }
      })
    
  } else {
    res.redirect('/');
  }

  function saveAndDestroy (objectUrl) {
                var newUrl = Url(objectUrl);

                newUrl.save((error, docSaved) => {
                  //console.log('docSaved',docSaved, docSaved._id)
                  res.redirect('/result/' + docSaved._id);
                });
  }
  function requestFunction(){
    request({url: urlToCheck}, function (err, response, body) {

    if(!err && res.statusCode == 200){
        //console.log('error:', error); // Print the error if one occurred 
        //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
        //console.log('body:', body); // Print the HTML for the Google homepage.
        printBodyAndCollect ();
        function printBodyAndCollect () {
            let $ = cheerio.load(body);
            const productTitle = textFormatter($('#productTitle').html());
            let productDescription = textFormatter($('#productDescription').html());
            let featureBullets = []
            let images = [];
            let imagesHigh = [];
            let numberReviews = $('.totalReviewCount').html(); 
            
            
            let productRating = $('#reviewSummary > .a-spacing-small > span').html();
            if(productRating) {
              productRating.charAt(0);
            }

            let fullfilled = $('#merchant-info > a').attr("href");
            fullfilled = fullfilled.search('isAmazonFulfilled=1');
            if(fullfilled !== -1) {
              fullfilled = true;
            } else {
              fullfilled = false;
            }


            $('#feature-bullets ul li').each(function(index){
              featureBullets.push(textFormatter($(this).text()));
            });

            $('#altImages ul li').each(function(){
                images.push('true');
            });

            if($(`#main-image-container .itemNo0 span span div img`).attr('data-old-hires') !== "") {
                //Hay que simular eventos para checkear si hay más
                imagesHigh.push('true');
            } 

            const constructObjectUrl = {
                
                  url: urlToCheck,
                  title: productTitle,
                  bullets: featureBullets,
                  images: images,
                  imagesHigh: imagesHigh,
                  productRating: productRating,
                  numReviews: numberReviews,
                  description: productDescription,
                  fullfilled: fullfilled
                
            };

          return saveAndDestroy(constructObjectUrl);
        }

      }

    });
  }
  
});

router.get('/result/:id', (req, res, next)=> {
  const urlId = req.params.id;
  Url.findById(urlId, (err, docs)=>{
      //console.log(docs)
      res.render('result', { docs })
  })
  
})
module.exports = router;
