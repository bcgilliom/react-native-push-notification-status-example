import React, {PureComponent} from 'react'; // eslint-disable-line no-unused-vars
import {StyleSheet, Text, View} from 'react-native';
import {Button, Paper} from 'material-bread';

import Input from './Input';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  paper: {
    flex: 1,
    padding: 12,
    marginBottom: 8,
    marginTop: 12,
    backgroundColor: '#424242',
  },
  button: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
});

type Props = {
  onSignIn: (userId: string) => void,
  loading: boolean,
};

type State = {
  userId: string,
}

class SignIn extends PureComponent<Props, State> {
  state = {
    userId: '',
  };

  onValueChanged = (_, value) => {
    this.setState({ userId: value });
  };

  onSignIn = () => {
    const { userId } = this.state;
    const { onSignIn } = this.props;
    onSignIn(userId);
  };

  render() {
    const { userId } = this.state;
    const { loading } = this.props;
    return (
      <Paper style={styles.paper}>
        <Input
          label={'User ID'}
          value={userId}
          onValueChanged={this.onValueChanged}
        />
        <Button
          text={'Log In'}
          type="contained"
          containerStyle={styles.button}
          color={'#52CBFF'}
          textColor={'#424242'}
          onPress={this.onSignIn}
          loading={loading}
          disabled={!userId}
        />
      </Paper>
    );
  }
}

export default SignIn;
