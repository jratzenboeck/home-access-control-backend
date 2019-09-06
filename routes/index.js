var canvas = require('canvas')
var faceapi = require('face-api.js')

var express = require('express')
var images = require('../http/images')
var router = express.Router()
var path = require('path')
var fs = require('fs')
var db = require('../db/db')
var faceRecognition = require('../lib/face-recognition')
var multer = require('multer')
var upload = multer({storage: images.initMulter()})

const {Canvas, Image, ImageData} = canvas
faceapi.env.monkeyPatch({Canvas, Image, ImageData})

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index')
})

router.post('/users', async function (req, res, next) {
  let name = req.body.name
  let img64 = req.body.image

  const imageBuffer = images.decodeBase64Image(img64)
  images.writeToFile(imageBuffer.data, `${name}.png`)

  await faceRecognition.loadModels('../public/models')
  const img = await images.buildCanvasFromImage(`${name}.png`)

  // detect the faces with landmarks
  const results = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
  if (results !== undefined) {
    const descriptors = results.descriptor
    const descriptorStr = descriptors.join(',')

    db.insert('users', {name})
      .then((userId) =>
        db.insert('images', {user_id: userId, filename: `${name}.png`}))
      .then((imageId) =>
        db.insert('image_descriptors', {image_id: imageId, descriptors: descriptorStr}))
      .then(() => {
        return res.json(200);
      })
  } else {
    return res.status(400).json({error: 'No image detected'});
  }
})

router.post('/enter', upload.single('image'), async function (req, res, next) {
  // Load models
  await faceRecognition.loadModels('../public/models')
  const img = await images.buildCanvasFromImage(req.file.originalname)
  // detect the faces with landmarks
  const results = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
  if (results !== undefined) {
    const descriptors = results.descriptor
    // Get all image descriptors from the db
    db.all('image_descriptors', ['*']).then((existingDescriptors) => {
      computeDistance(descriptors, existingDescriptors).then((distance) => {
        const authenticationStatus = distance <= 0.5 ? 'You are authenticated' : 'You are not authenticated'
        return res.render('authenticated', {authenticationStatus})
      })
    })
  } else {
    return res.status(400).json({error: 'No image detected'});
  }
})

router.get('/users', function (req, res, next) {
  db.all('users', ['name']).then((result) => {
    return res.json({users: result.map(user => user.name)})
  }).catch((error) => res.status(500).json({error}))
})

function computeDistance (descriptors, existingDescriptors) {
  return new Promise((resolve, reject) => {
    const mappedDescriptors = existingDescriptors.map(
      entry => new Float32Array(entry.descriptors.split(','))
    )
    const distance = faceRecognition.computeSmallestEuclideanDistance(descriptors, mappedDescriptors)
    resolve(distance)
  })
}

module.exports = router
