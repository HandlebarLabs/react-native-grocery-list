import React from 'react';
import {
  SafeAreaView,
  SectionList,
  View,
  Text,
  StyleSheet,
  TextInput,
  AsyncStorage,
  ActivityIndicator,
  Button
} from 'react-native';
import uuid from 'uuid/v4';

import SAMPLE_DATA from './data/template';
import ListItem from './components/ListItem';
import SectionHeader from './components/SectionHeader';
import debounce from './util/debounce';

const initialState = {
  listId: 'TEMP',
  items: SAMPLE_DATA,
  completedItems: [],
  nextItem: '',
  loading: true
};

export default class App extends React.Component {
  state = initialState;

  componentDidMount() {
    this.rehydrateItems();
  }

  componentDidUpdate(prevProps, prevState) {
    this.cacheItems();
  }

  cacheItems = debounce(() => {
    AsyncStorage.setItem(
      this.state.listId,
      JSON.stringify({
        ...this.state,
        loading: initialState.loading
      })
    );
  }, 500);

  rehydrateItems = () => {
    AsyncStorage.getItem(this.state.listId).then(data => {
      this.setState({
        ...JSON.parse(data),
        loading: false
      });
    });
  };

  addItem = () => {
    this.setState(state => {
      const newItems = [...state.items];
      if (state.nextItem.length > 0) {
        newItems.unshift({
          id: uuid(),
          name: state.nextItem,
          favorite: false
        });
      }

      return {
        ...state,
        items: newItems,
        nextItem: ''
      };
    });
  };

  handleFavorite = index => {
    this.input.blur();
    this.setState(state => {
      const items = [...state.items];

      items[index] = {
        ...items[index],
        favorite: !items[index].favorite
      };

      return {
        ...state,
        items
      };
    });
  };

  handleComplete = index => {
    this.input.blur();
    this.setState(state => {
      const items = [...state.items];
      const completedItems = [...state.completedItems];

      const completedItem = items.splice(index, 1)[0];
      completedItems.unshift(completedItem);

      return {
        ...state,
        items,
        completedItems
      };
    });
  };

  handleDelete = index => {
    this.input.blur();
    this.setState(state => {
      let items = [...state.items];
      items.splice(index, 1);

      return {
        ...state,
        items
      };
    });
  };

  resetList = () => {
    this.setState({
      ...initialState,
      loading: false
    });
  };

  render() {
    const { nextItem, items, completedItems, loading } = this.state;

    if (loading) {
      return <ActivityIndicator />;
    }

    return (
      <SafeAreaView style={styles.container}>
        <TextInput
          onChangeText={nextItem => this.setState({ nextItem })}
          onSubmitEditing={this.addItem}
          placeholder="Add another item"
          value={nextItem}
          ref={input => {
            this.input = input;
          }}
          blurOnSubmit={false}
        />

        {items.length === 0 &&
          completedItems.length > 1 && (
            <View>
              <Button title="Create a new list" onPress={this.resetList} />
            </View>
          )}

        <SectionList
          sections={[
            { title: 'GET', data: items },
            { title: 'CART', data: completedItems }
          ]}
          renderSectionHeader={({ section }) => (
            <SectionHeader title={section.title} />
          )}
          renderItem={({ item, index, section }) => {
            if (section.title === 'GET') {
              return (
                <ListItem
                  name={item.name}
                  favorite={item.favorite}
                  onFavorite={() => this.handleFavorite(index)}
                  onComplete={() => this.handleComplete(index)}
                  onDelete={() => this.handleDelete(index)}
                />
              );
            }

            return (
              <View>
                <Text>{item.name}</Text>
              </View>
            );
          }}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="always"
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});
