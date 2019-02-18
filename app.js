
'use strict';

const express = require('express');
const path = require('path');
const process = require('process'); // Required for mocking environment variables
const Buffer = require('safe-buffer').Buffer;
const bodyParser = require('body-parser');
const jsonBodyParser = bodyParser.json();

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// The following environment variables are set by app.yaml when running on GAE,
// but will need to be manually set when running locally. 
// In the main directory, run 
// export PUBSUB_VERIFICATION_TOKEN=<your-verification-token>
// export PUBSUB_TOPIC=<your-topic-name>
const PUBSUB_VERIFICATION_TOKEN = process.env.PUBSUB_VERIFICATION_TOKEN;
const TOPIC = process.env.PUBSUB_TOPIC;

app.post('/_ah/push-handlers/YOUR_HANDLER_NAME', jsonBodyParser,  async (req, res) => {
  if (req.query.token !== PUBSUB_VERIFICATION_TOKEN) {
    res.status(400).send();
    return;
  }

  try {
    
    const messageData = Buffer.from(req.body.message.data, 'base64').toString();
    var messageDataObj = JSON.parse(messageData);

    console.log("Communiction between Firebase functions and Appengine endpoint via Pubsub was a ", messageDataObj.status)

    res.status(200).send();
  
  } catch(error) {
    console.error(error);
    res.status(500).send();

  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
