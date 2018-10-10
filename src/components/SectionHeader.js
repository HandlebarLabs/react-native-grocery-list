import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

class SectionHeader extends React.Component {
  render() {
    const { title } = this.props;
    return <Text style={{ fontWeight: 'bold' }}>{title}</Text>;
  }
}

const styles = StyleSheet.create({});

export default SectionHeader;
