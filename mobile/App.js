import React, { PureComponent } from 'react';
import {
  Platform,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import DefaultPreference from 'react-native-default-preference';
import Notifications, {
  NotificationsAndroid,
  PendingNotifications,
} from 'react-native-notifications';
import { BreadProvider, Icon } from 'material-bread';

import SignIn from './SignIn';
import Home from './Home';

const isIOS = Platform.OS === 'ios';

const statusEndpoint =
  'https://your-region-your-project-id.cloudfunctions.net/notifications';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 8,
  },
  contentContainer: {
    paddingTop: 80,
    paddingBottom: 60,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  title: {
    fontSize: 32,
    color: '#DBDBDB',
  },
  content: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  paper: {
    flex: 1,
    padding: 12,
    marginBottom: 8,
    marginTop: 12,
    backgroundColor: '#424242',
  },
});

type Props = {};

type State = {
  userId: string,
  token: string,
  tokenError: Error,
};

export default class App extends PureComponent<Props, State> {
  constructor(props) {
    super(props);

    if (isIOS) {
      Notifications.addEventListener(
        'remoteNotificationsRegistered',
        this.onPushRegistered,
      );
      Notifications.addEventListener(
        'remoteNotificationsRegistrationFailed',
        this.onPushRegistrationFailed,
      );
      Notifications.addEventListener(
        'notificationReceivedForeground',
        this.onNotificationReceivedForeground,
      );
      Notifications.addEventListener(
        'notificationOpened',
        this.onOpenedNotification,
      );

      Notifications.requestPermissions();
    } else {
      NotificationsAndroid.setRegistrationTokenUpdateListener(
        this.onPushRegistered,
      );
      NotificationsAndroid.setNotificationOpenedListener(
        this.onOpenedNotification,
      );
    }

    this.state = {
      userId: null,
      token: null,
      tokenError: null,
    };
  }

  async componentDidMount() {
    if (!isIOS) {
      try {
        const notification = await PendingNotifications.getInitialNotification();
        if (notification) {
          this.onOpenedNotification(notification);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  componentWillUnmount() {
    if (isIOS) {
      Notifications.removeEventListener(
        'remoteNotificationsRegistered',
        this.onPushRegistered,
      );
      Notifications.removeEventListener(
        'remoteNotificationsRegistrationFailed',
        this.onPushRegistrationFailed,
      );
      Notifications.removeEventListener(
        'notificationReceivedForeground',
        this.onNotificationReceivedForeground,
      );
      Notifications.removeEventListener(
        'notificationOpened',
        this.onOpenedNotification,
      );
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    const { userId: prevUser, token: prevToken } = prevState;
    const { userId, token } = this.state;

    if (userId && token && (userId !== prevUser || token !== prevToken)) {
      this.setUserInfo(userId, token);
    }
  }

  async setUserInfo(userId, token) {
    this.setState({ loading: true });
    try {
      // add this token to the users's device list
      await firestore()
        .doc(`users/${userId}`)
        .set({
          token,
          type: Platform.OS,
        });

      // update any user specific info here
      // In this example we are only sending PNs to
      // one user at a time, so userId isn't actually used
      await DefaultPreference.setName('group.fsl.pnstatus');
      await DefaultPreference.setMultiple({
        endpoint: statusEndpoint,
        userId,
      });
    } catch (e) {
      console.log(e);
    }
    this.setState({ loading: false });
  }

  async initNotifications() {
    // these rn-firebase functions only work if the user has already
    // given permission via rn-notifications
    const isRegistered = firebase.messaging()
      .isRegisteredForRemoteNotifications;
    try {
      if (!isRegistered) {
        await messaging().registerForRemoteNotifications();
      }
      const token = await messaging().getToken();
      this.setState({ token });
    } catch (e) {
      console.log(e);
    }
  }

  markNotificationRead = async ({ id }) => {
    const url = `${statusEndpoint}/${id}?status=READ`;
    console.log('posting: ', url);
    try {
      await fetch(url, { method: 'POST' });
    } catch (e) {
      console.log(e);
    }
  };

  onPushRegistered = async () => {
    this.initNotifications();
  };

  onPushRegistrationFailed = error => this.setState({ tokenError: error });

  onNotificationReceivedForeground = (notification, completion) => {
    completion({ alert: true });
  };

  onOpenedNotification = notification => {
    const data = notification.getData();
    if (data && data.notificationId) {
      this.markNotificationRead({ id: data.notificationId });
    }
  };

  onSignIn = userId => {
    this.setState({ userId: userId.toLowerCase() });
  };

  onSignOut = () => {
    this.setState({ userId: null });
  };

  render() {
    const { userId, loading } = this.state;
    return (
      <BreadProvider>
        <StatusBar barStyle="light-content" />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps={'handled'}
        >
          <View style={styles.headerContainer}>
            <Icon
              size={48}
              name="radio-handheld"
              color={'#EBFF57'}
              iconComponent={MaterialCommunityIcons}
            />
            <Text style={styles.title}>Pushy-Talky</Text>
          </View>
          {userId ? (
            <Home
              onSignOut={this.onSignOut}
              userId={userId}
              loading={loading}
              onPressNotification={this.markNotificationRead}
            />
          ) : (
            <SignIn onSignIn={this.onSignIn} loading={loading} />
          )}
        </ScrollView>
      </BreadProvider>
    );
  }
}
