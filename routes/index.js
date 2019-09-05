var canvas = require("canvas");
var faceapi = require('face-api.js');

var express = require('express');
var decodeBase64Image = require('../http/images');
var router = express.Router();
var path = require('path');
var fs = require('fs');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const faceDetectionNet = faceapi.nets.ssdMobilenetv1;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/users', async function (req, res, next) {
    // 1. Get the name from the request body
    let name = req.params.name;
    // 2. TODO: Get the base64 picture
    //let img64 = req.params.image;
    /*const imageBuffer = decodeBase64Image(img64);
    fs.writeFile(`../public/images/${name}.png`, imageBuffer.data, function (err) {
      console.log(err);
    });*/
    await faceDetectionNet.loadFromDisk(path.join(__dirname, '../public/models'));
    await faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, '../public/models'));
    await faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, '../public/models'));

    // load the image
    // TODO: Replace the static use of the image with the loaded image
    const img = await canvas.loadImage(path.join(__dirname, '../public/images/image2.jpeg'));

    // detect the faces with landmarks
    const results = await faceapi.detectSingleFace(img)
        .withFaceLandmarks().withFaceDescriptor();
    console.log(results);
    return res.json(200);
    // 3. Add database entry with name and file name
    // 4. Save the file in pictures folder

    // 5. canvas.loadImage(file_name)
    // 6. const detection = await faceapi.detectSingleFace(input).withFaceLandmarks().withFaceDescriptor()
    // 7. save face-descriptor in database
});

router.post('/entry', function (req, res, next) {

});

/*function getFaceDetectorOptions() {
    return net === faceapi.nets.ssdMobilenetv1
        ? new faceapi.SsdMobilenetv1Options({ minConfidence })
        : (net === faceapi.nets.tinyFaceDetector
                ? new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
                : new faceapi.MtcnnOptions({ minFaceSize, scaleFactor })
        )
}*/
module.exports = router;
