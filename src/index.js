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
  Button,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import uuid from 'uuid/v4';

import SAMPLE_DATA from './data/template';
import ListItem from './components/ListItem';
import SectionHeader from './components/SectionHeader';
import Header from './components/Header';
import debounce from './util/debounce';

const STORAGE_KEY = 'GROCERY_LIST';
const initialState = {
  items: SAMPLE_DATA,
  completedItems: [],
  favoriteItems: [],
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
      STORAGE_KEY,
      JSON.stringify({
        ...this.state,
        loading: initialState.loading
      })
    );
  }, 500);

  rehydrateItems = () => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
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
      const favoriteItems = [...state.favoriteItems];

      const favorite = !items[index].favorite;
      items[index] = {
        ...items[index],
        favorite
      };

      if (favorite) {
        favoriteItems.push(items[index]);
      }

      return {
        ...state,
        items,
        favoriteItems
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
    this.setState(state => ({
      ...initialState,
      items: state.favoriteItems,
      loading: false
    }));
  };

  render() {
    const { nextItem, items, completedItems, loading } = this.state;

    if (loading) {
      return <ActivityIndicator />;
    }

    return (
      <React.Fragment>
        <Header>
          <TextInput
            onChangeText={nextItem => this.setState({ nextItem })}
            onSubmitEditing={this.addItem}
            placeholder="Add an item"
            value={nextItem}
            ref={input => {
              this.input = input;
            }}
            blurOnSubmit={false}
            autoFocus
          />
        </Header>

        <SafeAreaView style={{ flex: 1 }}>
          <SectionList
            keyExtractor={item => item.id}
            // keyboardShouldPersistTaps="always"
            sections={[
              { title: 'GET', data: items },
              { title: 'CART', data: completedItems }
            ]}
            renderSectionHeader={({ section }) => (
              <SectionHeader title={section.title} />
            )}
            renderItem={({ item, index, section }) => {
              return (
                <ListItem
                  name={item.name}
                  favorite={item.favorite}
                  onFavorite={() => this.handleFavorite(index)}
                  onComplete={() => this.handleComplete(index)}
                  onDelete={() => this.handleDelete(index)}
                  completed={section.title === 'CART'}
                />
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.border} />}
            renderSectionFooter={({ section }) => {
              if (section.title === 'GET' && section.data.length === 0) {
                return (
                  <View>
                    <Button
                      title="Create a new list"
                      onPress={this.resetList}
                    />
                  </View>
                );
              } else if (
                section.title === 'CART' &&
                section.data.length === 0
              ) {
                return (
                  <View>
                    <Text>SHOP! NEED SNACKS</Text>
                  </View>
                );
              }

              return null;
            }}
          />
        </SafeAreaView>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  border: {
    flex: 1,
    height: 1,
    backgroundColor: '#d3d3d3'
  }
});
