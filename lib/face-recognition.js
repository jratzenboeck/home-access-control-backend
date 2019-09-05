const faceApi = require('face-api.js');
const path = require('path');

async function loadModels(filename) {
  const fullPath = path.join(__dirname, filename);
  await faceApi.nets.ssdMobilenetv1.loadFromDisk(fullPath);
  await faceApi.nets.faceLandmark68Net.loadFromDisk(fullPath);
  await faceApi.nets.faceRecognitionNet.loadFromDisk(fullPath);
}

module.exports = {
  loadModels
}
