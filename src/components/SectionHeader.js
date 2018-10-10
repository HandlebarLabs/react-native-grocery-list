import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

class SectionHeader extends React.Component {
  render() {
    const { title } = this.props;
    return (
      <View style={styles.row}>
        <Text style={styles.text}>{title}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: '#e6e6e6'
  },
  text: {
    fontWeight: 'bold'
  }
});

export default SectionHeader;
