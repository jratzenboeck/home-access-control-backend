const fs = require('fs');
const path = require('path');
const canvas = require('canvas');
const multer = require('multer');

function decodeBase64Image(dataString) {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

function writeToFile(imageData, fileName) {
    fs.writeFile(buildImagePath(fileName), imageData, function (err) {
        console.log(err);
    });
}

function buildCanvasFromImage(filename) {
    return canvas.loadImage(buildImagePath(filename));
}

function buildImagePath(filename) {
    return path.join(__dirname, `../public/images/${filename}`)
}

function initMulter() {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, '../public/images'));
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    })
}

module.exports = {
    decodeBase64Image,
    writeToFile,
    buildCanvasFromImage,
    initMulter
};
