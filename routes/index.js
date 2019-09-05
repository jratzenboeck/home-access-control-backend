var canvas = require("canvas");
var faceapi = require('face-api.js');

var express = require('express');
var decodeBase64Image = require('../http/images');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var connection = require('../db/db');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const faceDetectionNet = faceapi.nets.ssdMobilenetv1;

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/users', async function (req, res, next) {
    let name = req.body.name;
    let img64 = req.body.image;
    let nrOfImages = 0;
    connection.query('select count(*) as nrOfImages from  images join users on images.user_id = users.id where users.name = ?', name, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            nrOfImages = result;
        }
    });

    const imageBuffer = decodeBase64Image(img64);
    fs.writeFile(path.join(__dirname, `../public/images/${name}.png`), imageBuffer.data, function (err) {
        console.log(err);
    });
    await faceDetectionNet.loadFromDisk(path.join(__dirname, '../public/models'));
    await faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, '../public/models'));
    await faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, '../public/models'));

    // load the image
    // TODO: Replace the static use of the image with the loaded image
    const img = await canvas.loadImage(path.join(__dirname, `../public/images/${name}.png`));

    // detect the faces with landmarks
    const results = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (results !== undefined) {
        const descriptors = results.descriptor;
        const descriptorStr = descriptors.join(',');
        console.log(descriptorStr);

        connection.query('insert into users(name) values(?)', name, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                insertImage(result.insertId, 'image2.jpeg', descriptorStr);
            }
        });

        return res.json(200);
    }
    return res.json(404);
});

router.post('/entry', function (req, res, next) {

});

function insertImage(userId, filename, descriptors) {
    connection.query('insert into images(user_id, filename) values(?, ?)',
        [userId, filename],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                insertDescriptor(result.insertId, descriptors);
            }
        });
}

function insertDescriptor(imageId, descriptors) {
    connection.query('insert into image_descriptors(image_id, descriptors) values(?, ?)',
        [imageId, descriptors],
        (err, result) => {
            if (err) {
                console.log(err);
            }
        });
}

/*function getFaceDetectorOptions() {
    return net === faceapi.nets.ssdMobilenetv1
        ? new faceapi.SsdMobilenetv1Options({ minConfidence })
        : (net === faceapi.nets.tinyFaceDetector
                ? new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
                : new faceapi.MtcnnOptions({ minFaceSize, scaleFactor })
        )
}*/
module.exports = router;
