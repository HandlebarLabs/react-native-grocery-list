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

  handleFavorite = (index, title) => {
    this.input.blur();
    this.setState(state => {
      const items = [...state.items];
      const completedItems = [...state.completedItems];
      const favoriteItems = [...state.favoriteItems];

      if (title === 'GET') {
        const favorite = !items[index].favorite;
        items[index] = {
          ...items[index],
          favorite
        };
        if (favorite) {
          favoriteItems.push(items[index]);
        }
      } else if (title === 'CART') {
        const favorite = !completedItems[index].favorite;

        completedItems[index] = {
          ...completedItems[index],
          favorite
        };
        if (favorite) {
          favoriteItems.push(completedItems[index]);
        }
      }

      return {
        ...state,
        items,
        favoriteItems,
        completedItems
      };
    });
  };

  handleComplete = (index, title) => {
    this.input.blur();
    this.setState(state => {
      const items = [...state.items];
      const completedItems = [...state.completedItems];

      if (title === 'GET') {
        const completedItem = items.splice(index, 1)[0];
        completedItems.unshift(completedItem);
      } else if (title === 'CART') {
        const item = completedItems.splice(index, 1)[0];
        items.unshift(item);
      }

      return {
        ...state,
        items,
        completedItems
      };
    });
  };

  handleDelete = (index, title) => {
    this.input.blur();
    this.setState(state => {
      let items = [...state.items];
      let completedItems = [...state.completedItems];

      if (title === 'GET') {
        items.splice(index, 1);
      } else if (title === 'CART') {
        completedItems.splice(index, 1);
      }

      return {
        ...state,
        items,
        completedItems
      };
    });
  };

  resetList = (fromFavorites = false) => {
    this.setState(state => {
      const items = fromFavorites ? state.favoriteItems : [];

      return {
        ...initialState,
        items,
        favoriteItems: state.favoriteItems,
        loading: false
      };
    });
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
                  onFavorite={() => this.handleFavorite(index, section.title)}
                  onComplete={() => this.handleComplete(index, section.title)}
                  onDelete={() => this.handleDelete(index, section.title)}
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
                      title="Create a new list from favorites"
                      onPress={() => this.resetList(true)}
                    />
                    <Button
                      title="Create a new blank list"
                      onPress={() => this.resetList(false)}
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
