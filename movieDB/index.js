
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const axios = require('axios');

app.use(express.json());

dotenv.config();

require('./app/routes/movie.routes')(app);
require('./app/routes/user.routes')(app);

// start server
const port = process.env.PORT || 3000;
const host = process.env.HOST || "http://localhost";
const protocol = process.env.PROTOCOL || "http";
const apiName = process.env.APINAME || "moviesapi";

app.listen(port, () => {
  axios({
    method: 'POST',
    url: "http://localhost:3001/register",
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      apiName: apiName,
      protocol: protocol,
      host: host,
      port: port
  }}).then((response) => {
    console.log(response.data);
  });


  console.log(`Listening on port ${port}...`);
})
