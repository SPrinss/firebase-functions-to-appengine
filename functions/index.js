const functions = require('firebase-functions');
const {PubSub} = require('@google-cloud/pubsub');

exports.makePubSubCall = functions.https.onCall(async (data, context) => {
  const topicName = "YOUR_TOPIC";

  const pubsub = new PubSub();
  const message = JSON.stringify({ status: "succes" });

  const messageAsBuffer = Buffer.from(message);

  const messageId = await pubsub.topic(topicName).publish(messageAsBuffer);
  console.log(`Message ${messageId} published.`);
})