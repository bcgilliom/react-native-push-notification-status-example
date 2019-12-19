import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Button, Heading, Icon, Paper } from 'material-bread';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Message from './Message';
import Input from './Input';

import type NotificationType from './types/NotificationType';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  panel: {
    flex: 1,
    padding: 12,
    marginBottom: 8,
    marginTop: 12,
    backgroundColor: '#424242',
  },
  loggedInPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    marginRight: 8,
    color: '#DBDBDB',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#DBDBDB',
  },
  button: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
});

type Props = {
  userId: string,
  loading: boolean,
  onSignOut: () => void,
};

type State = {
  values: {
    recipientId: string,
    message: string,
  },
  notifications: Array<NotificationType>,
};

class Home extends PureComponent<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      values: {
        recipientId: '',
        message: '',
      },
      notifications: [],
    };

    this.notificationSubscription = firestore()
      .collection('notifications')
      .orderBy('createdAt', 'desc')
      .onSnapshot({
        error: e => console.error(e),
        next: querySnapshot => {
          this.setState({
            notifications: querySnapshot.docs.map(doc => ({
              ...doc.data(),
              id: doc.id,
            })),
          });
        },
      });
  }

  componentWillUnmount() {
    this.notificationSubscription();
  }

  onValueChanged = (name, value) => {
    this.setState({
      values: {
        ...this.state.values,
        [name]: value,
      },
    });
  };

  onSendNotification = async () => {
    const { userId } = this.props;
    const {
      values: { recipientId, message },
    } = this.state;

    const newNoteRef = firestore()
      .collection('notifications')
      .doc();

    this.setState({ loading: true });
    try {
      await newNoteRef.set({
        senderId: userId,
        recipientId: recipientId.toLowerCase(),
        message,
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: 'SENT',
      });
    } catch (e) {
      console.log(e);
    }
    this.setState({ loading: false });
  };

  render() {
    const { userId, loading, onSignOut, onPressNotification } = this.props;
    const { values, notifications } = this.state;
    return (
      <View style={styles.container}>
        <Paper style={[styles.panel, styles.loggedInPanel]}>
          <Heading
            type={5}
            style={styles.heading}
            text={`Logged in as ${userId}`}
          />
          <Button
            text={'Log Out'}
            type="contained"
            color={'#d43100'}
            onPress={onSignOut}
            loading={loading}
          />
        </Paper>
        <Paper style={styles.panel}>
          <Input
            name={'recipientId'}
            label={'Recipient ID'}
            value={values.recipientId}
            onValueChanged={this.onValueChanged}
          />
          <Input
            name={'message'}
            label={'Message'}
            value={values.message}
            onValueChanged={this.onValueChanged}
          />
          <Button
            text={'Send Notification'}
            type="contained"
            containerStyle={styles.button}
            color={'#52CBFF'}
            textColor={'#424242'}
            onPress={this.onSendNotification}
            loading={loading}
            disabled={!values.recipientId || !values.message}
          />
        </Paper>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Icon
              size={48}
              name="bullhorn"
              color={'#EBFF57'}
              iconComponent={MaterialCommunityIcons}
            />
            <Text style={styles.title}>Chatter</Text>
          </View>
          {notifications.map(n => (
            <Message key={n.id} notification={n} onPress={onPressNotification} />
          ))}
        </View>
      </View>
    );
  }
}

export default Home;
