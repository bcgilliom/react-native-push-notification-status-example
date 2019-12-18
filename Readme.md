# Project Setup

- Make sure you have node >= `10.10.0`

## React Native Project

Use the template provded by react-native-firebase:

```
mkdir your-cool-project
cd your-cool-project
npx @react-native-community/cli init --template=@react-native-firebase/template mobile
cd mobile
(cd ios && pod install)
react-native run-ios/android
```

If yarn fails to install dependencies, `cd your-cool-project && npm i`, or if cocoapods fails, try `pod install --repo-update`

You should now see the `Welcome to React Native + Firebase!` screen!

## Firebase Setup
- install the command line tools with `curl -sL firebase.tools | bash`
- login to firebase on the command line with `firebase login`

- Make a dir `mkdir your-cool-project/firebase`
- `cd firebase`
- Running `firebase projects:list` should show you your new project
- In the `firebase` directory, run `firebase init`

- Select Firestore and Cloud Functions (2 and 3)
- Create a new project, give it a name

If it fails because of location (GCP), you will need to open the project in the console:
- Go to https://console.firebase.google.com and sign in with a google account.
- Choose your project
- Go to Database and create a Cloud Firestore database. It will prompt to choose a location for Google Cloud Platform. Pick a location that works best for you.
- This can also be done in Project Settings -> General if needed, but you can't change it once it's set!

Now run `firebase init` again and choose `select an existing project`

Accept all of the default options for firestore (or don't!)

You should now be able to deploy to firebase!
`firebase deploy`

We are now ready to actually do stuff!!

Set up push notifications for iOS following Firebase's instructions.

## App Setup
In App.js set `const statusEndpoint = 'https://<your-region>-<your-fb-project-id>.cloudfunctions.net/notifications';` to use your new firebase project.

In firebase console, set up android and iOS apps and download the google services files (follow firebase instructions)

## Test the app
`npm i`
`react-native run-ios`

In the simulator, you won't get push notifications, but you should be able to 'sign in' (not real auth) and see a user record appear in the database tab in the Firebase console. Try sending a notification - you should see a new message row in the Chatter secion.

To try for real, install on at least one real device. Sign in with a user id, and then send a message to that user by entering the id in the Recipient ID field (messages can be sent from the iOS simulator, just not received, Android emulator should work).
