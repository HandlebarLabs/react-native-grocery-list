import React from 'react';
import { View } from 'react-native';

let startPress = null;
class DevLongPress extends React.Component {
  static defaultProps = {
    numberOfTouches: 2,
    delay: 1000,
    onLongPress: () => null
  };

  onStartShouldSetResponder = evt => {
    if (
      process.env.NODE_ENV === 'development' &&
      evt.nativeEvent.touches.length === this.props.numberOfTouches
    ) {
      startPress = Date.now();
      return true;
    }

    startPress = null;
    return false;
  };

  onResponderRelease = evt => {
    const { onLongPress, delay } = this.props;
    const now = Date.now();
    if (startPress && now - startPress > delay) {
      onLongPress();
    }
    startPress = null;
  };

  render() {
    return (
      <View
        onStartShouldSetResponder={this.onStartShouldSetResponder}
        onResponderRelease={this.onResponderRelease}
        style={{ flex: 1 }}
      >
        {this.props.children}
      </View>
    );
  }
}

export default DevLongPress;
