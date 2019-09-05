const fs = require('fs');
const path = require('path');

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
    fs.writeFile(path.join(__dirname, `../public/images/${fileName}.png`), imageData, function (err) {
        console.log(err);
    });
}

module.exports = {
    decodeBase64Image,
    writeToFile
};
