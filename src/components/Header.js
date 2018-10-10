import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';

class Header extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <SafeAreaView>{this.props.children}</SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#e6e6e6'
    padding: 20,
    marginTop: 30,
    justifyContent: 'flex-end'
  }
});

export default Header;
