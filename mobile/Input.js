import React, { PureComponent } from 'react';
import { TextField } from 'material-bread';

const textFieldProps = {
  labelColor: '#DBDBDB',
  focusedLabelColor: '#EBFF57',
  underlineColor: '#DBDBDB',
  underlineActiveColor: '#EBFF57',
  selectionColor: '#FFFFFF',
  style: {
    color: '#FFFFFF',
  },
};

class Input extends PureComponent {
  onValueChanged = value => {
    const { name, onValueChanged } = this.props;
    if (onValueChanged) {
      onValueChanged(name, value);
    }
  };

  render() {
    return (
      <TextField
        {...textFieldProps}
        onChangeText={this.onValueChanged}
        {...this.props}
      />
    );
  }
}

export default Input;
