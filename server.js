//const express = require('express')
// const fs = require('fs')
// const db = require('./database')
// const s3 = require('./s3')

// const multer = require('multer')

import express from "express";
import multer from "multer";
import fs from "fs";
import * as s3 from "./s3.js";
import database from "./database.js";
import crypto from 'crypto';
import dotenv from "dotenv";
import sharp from "sharp";


const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
//const fileName = generateFileName()



const app = express()
// 2
//const upload = multer({ dest: 'images/' })

const storage = multer.memoryStorage()
const upload = multer({storage: storage})
upload.single('image')

app.use(express.static("build"));
app.use(express.static("images"))
// 3

// app.get('/api/images', async (req, res)=> {
//   console.log("getting images...")
//   const result = await database.getImages()
//   res.send(result)
// })


// app.post('/api/images', upload.single('image'), async (req, res) => {
//   // 4
//   const imageName = req.file.filename
//   const description = req.body.description

//   // Save this data to a database probably

//   const result = await db.addImage(imageName,description)
//   res.send(result)
// })


app.get("/api/images", async (req, res) => {
  const images = await database.getImages()

  // Add the signed url to each image
  for (const image of images) {
    //console.log("image", image);
    image.imageURL = await s3.getSignedUrl(image.file_path)
  }

  res.send(images)
})



app.post('/api/images', upload.single('image'), async (req, res) => {
  // Get the data from the post request
  const description = req.body.description
  const fileBuffer = req.file.buffer
  const mimetype = req.file.mimetype
  const fileName = generateFileName();


  // Resizing the image
  const fileBufferResize = await sharp(fileBuffer)
  .resize({ height: 320, width: 320, fit: "contain" })
  .toBuffer()


  // Store the image in s3
  
  const s3Result = await  s3.uploadImage(fileBufferResize, fileName, mimetype)

  // Store the image in the database
  const databaseResult = await database.addImage(fileName, description)
  databaseResult.imageURL = await s3.getSignedUrl(fileName)

  res.status(201).send(databaseResult)
})


// delete an image from S3

app.post("/api/images/:id/delete", async (req, res) => {

  
  //const fileName = req.params.id;
  
  const id = req.params.id
  
  const image = await database.getImage(id)
  console.log("image------------>>      ", image)
  const fileName = image.file_path
  console.log("filename----->>      ", fileName)

  const s3Result = await s3.deleteImage(fileName);
  console.log("now delete from database")
  const databaseResult = await database.deleteImage(fileName);

  res.redirect("/");

});



// app.get('/images/:imageName', (req, res) => {
//   // do a bunch of if statements to make sure the user is 
//   // authorized to view this image, then

//   const imageName = req.params.imageName
//   const readStream = fs.createReadStream(`images/${imageName}`)
//   readStream.pipe(res)
// })



app.listen(8080, () => console.log("listening on port 8080"))