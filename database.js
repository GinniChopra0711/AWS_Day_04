// const mysql = require("mysql2")
// const dotenv = require("dotenv")

import mysql from "mysql2";
import dotenv from "dotenv"

dotenv.config()

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise()

async function getImages() {
  let query = `
  SELECT * 
  FROM images
  ORDER BY created DESC
  `

  const [rows] = await pool.query(query);
  return rows
}
//exports.getImages = getImages

async function getImage(id) {
  let query = `
  SELECT * 
  FROM images
  WHERE id = ?
  `

  const [rows] = await pool.query(query, [id]);
  const result = rows[0];
  return result
}
//exports.getImage = getImage

async function addImage(filePath, description) {
  let query = `
  INSERT INTO images (file_path, description)
  VALUES(?, ?)
  `

  const [result] = await pool.query(query, [filePath, description]);
  const id = result.insertId

  return await getImage(id)
}

// delete image from the table
async function deleteImage(filePath){

  console.log("inside delete function ")

  let query =`
  DELETE FROM images WHERE file_path = ?`

  const [rows] = await pool.query(query, [filePath]);
  return rows
}

export default {addImage, getImage, getImages,deleteImage}