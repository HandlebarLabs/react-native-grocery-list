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

// Get the correct image based on whether the item is a favorite (filled in star) and then get the
// right icon based on the platform.
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

  componentDidMount() {
    if (this.props.nudgeOnLoad) {
      this.nudgeRow();
    }
  }

  nudgeRow = () => {
    Animated.sequence([
      Animated.timing(this.rowOffset, {
        toValue: w.width * -0.25,
        useNativeDriver: true
      }),
      Animated.timing(this.rowOffset, {
        toValue: 0,
        easing: Easing.bounce,
        useNativeDriver: true
      })
    ]).start();
  };

  createPanResponder = () =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // If a user just taps the row don't do anything.
        return gestureState.dx < -5;
      },
      onPanResponderMove: (evt, gestureState) => {
        // We only care if the gesture is to the left
        if (gestureState.dx < 0) {
          // Set the animated value to the same distance as what the user has swiped.
          this.rowOffset.setValue(Math.floor(gestureState.dx));
        }
      },
      onPanResponderRelease: this.onResponderRelease,
      onPanResponderTerminate: this.onResponderRelease
    });

  onResponderRelease = (evt, gestureState) => {
    // If the swipe is greater than 40% then we've got a positive delete swipe
    if (Math.abs(gestureState.dx) > w.width * 0.4) {
      Animated.spring(this.rowOffset, {
        toValue: -w.width,
        useNativeDriver: true
      }).start();
      // Let the animation play out a bit. Makes it feel less abrupt
      setTimeout(() => {
        this.props.onDelete();
      }, 400);
    } else {
      // If the swipe is less than 40% we'll view that as a negative delete swipe and reset the
      // value, with a bit of bouncing as we go.
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
        // By using transform we can use useNativeDriver, allowing for a lower liklihood of jittery
        // animations. Learn more: http://facebook.github.io/react-native/blog/2017/02/14/using-native-driver-for-animated.html
        transform: [{ translateX: this.rowOffset }]
      }
    ];

    const deleteTextStyles = [
      styles.deleteText,
      {
        transform: [
          {
            // Use interpolation to change text size
            scale: this.rowOffset.interpolate({
              inputRange: [w.width * -0.25, 0],
              outputRange: [1, 0.5],
              extrapolate: 'clamp'
            })
          },
          {
            // Use interpolation so the text can move w/ the row
            translateX: this.rowOffset.interpolate({
              inputRange: [w.width * -1, w.width * -0.4],
              outputRange: [w.width * -0.5, 0],
              extrapolate: 'clamp'
            })
          }
        ]
      }
    ];

    return (
      <View style={styles.container}>
        <View style={styles.deleteRow}>
          <Animated.Text style={deleteTextStyles}>Delete</Animated.Text>
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
    marginHorizontal: 20,
    fontWeight: 'bold'
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
