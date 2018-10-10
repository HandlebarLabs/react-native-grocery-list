import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

class ListItem extends React.Component {
  render() {
    const { name, onFavorite, onComplete, onDelete, favorite } = this.props;
    return (
      <View style={styles.container}>
        <Text>
          {name} - {favorite.toString()}
        </Text>
        <Button title="Favorite" onPress={onFavorite} />
        <Button title="Complete" onPress={onComplete} />
        <Button title="Delete" onPress={onDelete} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderColor: '#d3d3d3',
    padding: 20
  }
});

export default ListItem;
