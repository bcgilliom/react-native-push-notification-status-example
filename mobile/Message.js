import React, { PureComponent } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Card, CardContent } from 'material-bread';

import type NotificationType from './types/NotificationType';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 12,
    backgroundColor: '#696969',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageText: {
    color: '#DBDBDB',
  },
  senderText: {
    color: '#52CBFF',
  },
  recipientText: {
    color: '#EBFF57',
  },
  statusText: {
    fontSize: 10,
    color: '#BBBBBB',
  },
});

type Props = {
  notification: NotificationType,
  onPress: NotificationType => void,
};

class Message extends PureComponent<Props> {
  onPress = () => {
    const { onPress, notification } = this.props;
    if (onPress) {
      onPress(notification);
    }
  };

  render() {
    const { notification: n } = this.props;
    return (
      <Card key={n.id} style={styles.container} onPress={this.onPress}>
        <CardContent style={styles.content}>
          <Text style={styles.messageText}>
            <Text style={styles.senderText}>{n.senderId}</Text>
            {' ⇒ '}
            <Text style={styles.recipientText}>{n.recipientId}</Text>
            {`: ${n.message}`}
          </Text>
          <Text style={styles.statusText}>{n.status}</Text>
        </CardContent>
      </Card>
    );
  }
}

export default Message;
