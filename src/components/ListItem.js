import React from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
  Dimensions,
  PanResponder,
  Easing
} from 'react-native';

const w = Dimensions.get('window');
const isAndroid = Platform.OS === 'android';

const getImage = favorited => {
  if (isAndroid) {
    if (favorited) {
      return require('../assets/icons/md-star.png');
    }
    return require('../assets/icons/md-star-outline.png');
  } else {
    if (favorited) {
      return require('../assets/icons/ios-star.png');
    }
    return require('../assets/icons/ios-star-outline.png');
  }
};

class ListItem extends React.Component {
  constructor() {
    super();

    this.rowOffset = new Animated.Value(0);

    this._panResponder = this.createPanResponder();
  }

  createPanResponder = () =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dx < -5;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0) {
          this.rowOffset.setValue(Math.floor(gestureState.dx));
        }
      },
      onPanResponderRelease: this.onResponderRelease,
      onPanResponderTerminate: this.onResponderRelease
    });

  onResponderRelease = (evt, gestureState) => {
    if (Math.abs(gestureState.dx) > w.width * 0.4) {
      Animated.spring(this.rowOffset, {
        toValue: -w.width,
        useNativeDriver: true
      }).start(() => {
        this.props.onDelete();
      });
    } else {
      Animated.timing(this.rowOffset, {
        toValue: 0,
        easing: Easing.bounce,
        useNativeDriver: true
      }).start();
    }
  };

  render() {
    const { name, onFavorite, favorite, onComplete } = this.props;

    const rowStyles = [
      styles.row,
      {
        transform: [{ translateX: this.rowOffset }]
      }
    ];

    return (
      <View style={styles.container}>
        <View style={styles.deleteRow}>
          <Text style={styles.deleteText}>Delete</Text>
        </View>
        <Animated.View style={rowStyles} {...this._panResponder.panHandlers}>
          <View style={styles.left}>
            <TouchableOpacity onPress={onComplete}>
              <View style={styles.circleOutline}>
                {this.props.completed && <View style={styles.circle} />}
              </View>
            </TouchableOpacity>
            <Text style={styles.text}>{name}</Text>
          </View>
          <TouchableOpacity onPress={onFavorite}>
            <Image source={getImage(favorite)} style={styles.star} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#cc0000'
  },
  deleteRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  deleteText: {
    color: '#fff',
    marginHorizontal: 20
  },
  row: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  left: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  text: {
    marginLeft: 10
  },
  circleOutline: {
    borderColor: '#1ca2fe',
    borderWidth: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  circle: {
    backgroundColor: '#1ca2fe',
    width: 10,
    height: 10,
    borderRadius: 5
  },
  star: {
    tintColor: '#1ca2fe'
  }
});

export default ListItem;
