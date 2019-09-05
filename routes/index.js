var canvas = require("canvas");
var faceapi = require('face-api.js');

var express = require('express');
var images = require('../http/images');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var db = require('../db/db');
var faceRecognition = require('../lib/face-recognition');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/users', async function (req, res, next) {
    let name = req.body.name;
    let img64 = req.body.image;

    const imageBuffer = images.decodeBase64Image(img64);
    images.writeToFile(imageBuffer.data, name);

    await faceRecognition.loadModels('../public/models');
    const img = await canvas.loadImage(path.join(__dirname, `../public/images/${name}.png`));

    // detect the faces with landmarks
    const results = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (results !== undefined) {
        const descriptors = results.descriptor;
        const descriptorStr = descriptors.join(',');

        db.insert('users', { name })
            .then((userId) =>
                db.insert('images', { user_id: userId, filename: `${name}.png` }))
            .then((imageId) =>
                db.insert('image_descriptors', { image_id: imageId, descriptors: descriptorStr }));

        return res.json(200);
    }
    return res.json(404);
});

router.post('/enter', async function (req, res, next) {
    const imageBuffer = images.decodeBase64Image(req.body.image);
    images.writeToFile(imageBuffer.data, 'file.png');

    // Load models
    await faceRecognition.loadModels('../public/models');
    const img = await images.buildCanvasFromImage('file.png');
    // detect the faces with landmarks
    const results = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (results !== undefined) {
        const descriptors = results.descriptor;
        console.log(descriptors)
        // Get all image descriptors from the db
        db.all('image_descriptors', ['*']).then((existingDescriptors) => {
            const mappedDescriptors = existingDescriptors.map(
              entry => new Float32Array(entry.descriptors.split(','))
            );
            const distance = faceRecognition.computeSmallestEuclideanDistance(descriptors, mappedDescriptors);
            console.log(distance)
        });
        // Compute the euclidean distance to each of them
        // Take the minimum distance
        // Check whether it exceeds threshold
        return res.json(200);
    }
    return res.json(404);
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
