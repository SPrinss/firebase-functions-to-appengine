# firebase-functions-to-appengine

Example of triggering an appengine endpoint from a Firebase function.

## Quickrun

1. Create a firebase project/cloud app (https://console.firebase.google.com/).
2. Enable firebase functions from the project's console.
3. Activate the app engine API (https://console.cloud.google.com -> getting started -> select API's, should be enabled by default)
4. Run `npm i` in the main directory and the /functions folder.
5. Install the Google cloud SDK if you haven't already (https://cloud.google.com/sdk/)
6. Set the firebase project (firebase use YOUR_PROJECT_ID) and gcloud project (gcloud config set project YOUR_PROJECT_ID) in the main directory.
7. Create a topic and a subscription (see `About App engine`)
8. Update variables in `app.standard.yaml`, `app.js`, `/functions/index.js`
9. To test locally see (`Testing locally`)
10. To test live: gcloud app deploy app.standard.yaml (please make sure you've select the correct Cloud project). Run the Firebase function locally (see `About Firebase functions`) and see the log on https://console.cloud.google.com/logs/viewer. See https://console.cloud.google.com/errors to see if the app engine server has encountered an error.

## Why?

Firebase functions have a maximum timeout and memory. Some functions, such as video encoding, are too demanding for Firebase functions. Google Cloude app engine can handle these loads. 

## How?

A Firebase function communicates to the Cloud App engine via Google PubSub. 

We'll use NodeJs in this example.

### About PubSub

You create a topic on a PubSub server. Topics can have multiple subscribers, meaning that if you publish a message to the PubSub topic, multiple 'endpoints' can receive the message. 

Subscriptions can be based on a push or pull method (https://cloud.google.com/pubsub/docs/subscriber). With the push method the PubSub server will make calls to a predetermined endpoint until the endpoint responds with a ~200 status code or after 7 days (https://cloud.google.com/pubsub/docs/push). The server will make a call about every 7 seconds. 
For the pull method see https://cloud.google.com/pubsub/docs/pull#pubsub-pull-messages-async-nodejs.

The Firebase function uses the NodeJs pubsub module () to publish a message to a topic.
The message needs to be given as a Buffer (https://nodejs.org/api/buffer.html).

You can manage your topics & subscriptions at https://console.cloud.google.com/cloudpubsub/.


#### Terminal tips
To select a project:
```gcloud config set project YOUR_PROJECT_ID```

To create a topic:
```gcloud pubsub topics create YOUR_TOPIC_NAME```

To create a PubSub subscription:
```
gcloud pubsub subscriptions create YOUR_SUBSCRIPTION_NAME
    --topic YOUR_TOPIC_NAME
    --push-endpoint https://YOUR_PROJECT_ID.appspot.com/_ah/push-handlers/YOUR_HANDLER_NAME?token=YOUR_TOKEN
    --ack-deadline 10
```

The POST endpoint in your App engine should listen to `_ah/push-handlers/YOUR_HANDLER_NAME`.

### About Firebase functions

Information on Firebase functions can be found on: https://firebase.google.com/docs/functions/

To select a project run `firebase use YOUR_PROJECT_ID` in the main directory.

To run the functions locally run `firebase functions:shell` in the main directory (not the /functions folder).

To run an `onCall` function: `myCallableFunction({})`


### About App engine

A Google cloud project can have multiple App engine instances. Each instance can be triggered by different endpoints, regulated in the dispatch.yaml file. Read more about it in this Medium article: https://medium.com/this-dot-labs/node-js-microservices-on-google-app-engine-b1193497fb4b, or the Cloud documentation: https://cloud.google.com/appengine/docs/standard/nodejs/how-instances-are-managed.

Each instance can be coupled with a PubSub topic by editing the .yaml file of the instance: 
```
env_variables:
  PUBSUB_TOPIC: YOUR_TOPIC_ID
  PUBSUB_VERIFICATION_TOKEN: YOUR_SECRET_TOKEN
```

Instances can have three types of scaling: auto, manual and basic. The auto scaling options has a short deadline so we'll need to use one of the other types.


### Testing locally
You need to set the environmental settings locally (these are normally picked up by the server from the .yaml file you deployed). 

```
export PUBSUB_VERIFICATION_TOKEN=YOUR_TOKEN
export PUBSUB_TOPIC=YOUR_TOPIC_NAME
```

In order to run the App engine instance locally, you can use something like: ```curl -H "Content-Type: application/json" -i --data @sample_message.json "https://localhost:8080/_ah/push-handlers/YOUR_HANDLER_NAME?token=YOUR_TOKEN"```.

The `sample_message.json` should have the following structure:
```
{
  "messages": {
    "data" : "base64String"
  }
}
```

