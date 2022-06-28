const targz = require('targz')
const fs = require('fs')
const AWS = require('aws-sdk')
const {rootPath} = require("./const");

function compress(src, dest) {
  return new Promise((resolve, reject) => {
    targz.compress({
      src: src,
      dest: dest
    }, error => {
      error ? reject(error): resolve()
    })
  })
}

exports.uploadWeight = async function (id, bucket, region, profile) {
  const inputPath = `${rootPath}/weightAndConfig/${id}`
  const outputPath = `${rootPath}/cdk.out/weightAndConfig/${id}`
  fs.mkdirSync(outputPath, {recursive: true})
  const tarFileName = `${id}.tar.gz`
  const tarFilePath = `${outputPath}/${tarFileName}`
  await compress(inputPath, tarFilePath)
  AWS.config.region = region
  AWS.config.credentials = new AWS.SharedIniFileCredentials({profile})
  const s3Client = new AWS.S3()
  return await s3Client.putObject({
    Bucket: bucket,
    Key: tarFileName,
    Body: fs.readFileSync(tarFilePath)
  }).promise()
}