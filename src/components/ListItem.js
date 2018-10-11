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
import Swipeable from './Swipeable';

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
  render() {
    const {
      name,
      onFavorite,
      favorite,
      onComplete,
      completed,
      nudgeOnLoad,
      onDelete
    } = this.props;

    return (
      <Swipeable nudgeOnLoad={nudgeOnLoad} onDeleteSwipe={onDelete}>
        <View style={styles.row}>
          <View style={styles.left}>
            <TouchableOpacity onPress={onComplete}>
              <View style={styles.circleOutline}>
                {completed && <View style={styles.circle} />}
              </View>
            </TouchableOpacity>
            <Text style={styles.text}>{name}</Text>
          </View>
          <TouchableOpacity onPress={onFavorite}>
            <Image source={getImage(favorite)} style={styles.star} />
          </TouchableOpacity>
        </View>
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
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
