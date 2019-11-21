var express = require('express')
var fs = require('fs')
var https = require('https')
var app = express()

const root = require('path').join(__dirname, 'build')
app.use(express.static(root));
app.get("*", (req, res) => {
    res.sendFile('index.html', { root });
})

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app)
.listen(3000, function () {
  console.log('Example app listening on port 3000! Go to https://localhost:3000/')
})

// // // server.js

// const https = require('https');
//  const express = require('express');
// const fs = require('fs');
// const app = express();

// // app.get('*', (req, res) => {
// //   res.sendFile(__dirname+'/build/index.html');
// // })

// // app.listen(3000)
// https.createServer({
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
// }, app).listen(3000, () => {
//   console.log('Listening...')
// });
// const root = require('path').join(__dirname, 'build')
// app.use(express.static(root));
// app.get("*", (req, res) => {
//     res.sendFile('index.html', { root });
// })

// app.listen(3000)