const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

const app = express();

admin.initializeApp();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.post("/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.query;
  if (!id || !status) {
    res.status(400).send("Must provide a Notification ID and Status!");
    return;
  }

  const notificationRef = admin
    .firestore()
    .collection("notifications")
    .doc(id);

  console.log('setting status for notification', id, status);

  notificationRef
    .set({ status }, { merge: true })
    .then(() => res.status(200).send("status updated"))
    .catch(e => res.status(400).send(e.message));
});

// Expose Express API as a single Cloud Function:
exports.notifications = functions.https.onRequest(app);

exports.onNotificationCreated = functions.firestore
  .document("notifications/{notificationId}")
  .onCreate((snapshot, context) => {
    const notification = snapshot.data();
    const id = notification.recipientId;

    console.log("Sending Notification to User", id);

    const userRef = admin
      .firestore()
      .collection("users")
      .doc(id);
    return userRef
      .get()
      .then(doc => (doc.exists ? doc.data() : null))
      .then(user => {
        if (user && user.token) {
          // this option is required for iOS to handle the notification with the service extension
          const options = {
            mutableContent: true
          };

          // ios needs the title body in the notification field
          // android needs everything in the data field in order to
          // handle the notification in the background
          const payload = user.type === 'ios' ? {
            notification: {
              title: `Hello ${id}`,
              body: notification.message
            },
            data: {
              notificationId: context.params.notificationId,
            },
          } : {
            data: {
              title: `Hello ${id}`,
              body: notification.message,
              notificationId: context.params.notificationId,
            }
          };

          console.log('Sending notification with payload', payload);
          return admin.messaging().sendToDevice(user.token, payload, options);
        } else {
          throw new Error("No recipients found");
        }
      })
      .catch(e => {
        console.log(e);
      });
  });
