var express = require('express');
var decodeBase64Image = require('http/images');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/users', function (req, res, next) {
  // 1. Get the name from the request body
  let name = req.params.name;
  // 2. Get the base64 picture
  let img64 = req.params.image;
  const imageBuffer = decodeBase64Image(img64);
  fs.writeFile(`../public/images/${name}.png`, imageBuffer.data, function (err) {
    console.log(err);
  });
  return res.json(200);
  // 3. Add database entry with name and file name
  // 4. Save the file in pictures folder

  // 5. canvas.loadImage(file_name)
  // 6. const detection = await faceapi.detectSingleFace(input).withFaceLandmarks().withFaceDescriptor()
  // 7. save face-descriptor in database
});

router.post('/entry', function (req, res, next) {

});
module.exports = router;
