const faceApi = require('face-api.js')
const path = require('path')

async function loadModels (filename) {
  const fullPath = path.join(__dirname, filename)
  await faceApi.nets.ssdMobilenetv1.loadFromDisk(fullPath)
  await faceApi.nets.faceLandmark68Net.loadFromDisk(fullPath)
  await faceApi.nets.faceRecognitionNet.loadFromDisk(fullPath)
}

function computeSmallestEuclideanDistance (inputDescriptors, existingDescriptors) {
  let smallestDistance = null
  existingDescriptors.forEach((descriptorsEntry) => {
    const distance = faceApi.euclideanDistance(inputDescriptors, descriptorsEntry)
    if (smallestDistance === null || distance < smallestDistance) {
      smallestDistance = distance
    }
  })
  return smallestDistance
}

module.exports = {
  loadModels,
  computeSmallestEuclideanDistance
}
