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
  // When a user first uses the app show them what's possible! Prepopulate the app with some data,
  // but only do it when they first install the app.
  items: SAMPLE_DATA,
  completedItems: [],
  favoriteItems: [],
  nextItem: '',
  // Default to loading so an empty list isn't shown. Will only be shown very briefly.
  loading: true,
  // We only want to show the user the delete nudge when they first get the app. Otherwise it's
  // annoying
  hasShownNudge: false
};

export default class App extends React.Component {
  state = initialState;

  componentDidMount() {
    // Once the component mounts rehydrate state from AsyncStorage.
    this.rehydrateItems();
    this.setState({ hasShownNudge: true });
  }

  componentDidUpdate(prevProps, prevState) {
    // componentDidUpdate will be called whenever state or props change, AFTER it has changed. Since
    // no props are being passed to our component we know that this will only be called when our
    // state changes, which we want to cache in its entirety. Therefore, call this.cacheItems every
    // time the component updates.
    this.cacheItems();
  }

  cacheItems = debounce(() => {
    // When using AsyncStorage the item value must be a string so we call JSON.stringify on
    // this.state. This is an expensive operation so we use debounce to only call this function
    // every 500 milliseconds.
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...this.state
      })
    );
  }, 500);

  rehydrateItems = () => {
    // Grab the data from AsyncStorage. Parse the string to a json object and put that data into
    // component state. Set loading to false so that the loading indicator goes away.
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      this.setState({
        ...JSON.parse(data),
        loading: false
      });
    });
  };

  addItem = () => {
    this.setState(state => {
      // Make a shallow copy with array spread syntax to avoid mutating state.
      const newItems = [...state.items];
      if (state.nextItem.length > 0) {
        // Add the new item to the start of the list rather than the end.
        newItems.unshift({
          id: uuid(),
          name: state.nextItem,
          favorite: false
        });
      }

      return {
        ...state,
        items: newItems,
        // The TextInput is controlled so we can reset the value via state.
        nextItem: ''
      };
    });
  };

  handleFavorite = (index, completedList) => {
    this.setState(state => {
      // Make a shallow copies with array spread syntax to avoid mutating state.
      const items = [...state.items];
      const completedItems = [...state.completedItems];
      const favoriteItems = [...state.favoriteItems];

      let favorite = false;

      if (completedList) {
        // If the item is already completed, pull the item off of the completed list and check its
        // curring favorite status. Use "!" to change the value. false -> true, true -> false
        favorite = !completedItems[index].favorite;

        completedItems[index] = {
          // Copy over all properties of the existing item so the data structure stays the same but
          // we don't have to manually define each property.
          ...completedItems[index],
          // Update favorite, because that's what we're doing in the function.
          favorite
        };
      } else {
        // If the item hasn't been completed, pull the item off of the default list and check its
        // curring favorite status. Use "!" to change the value. false -> true, true -> false
        favorite = !items[index].favorite;

        items[index] = {
          // Copy over all properties of the existing item so the data structure stays the same but
          // we don't have to manually define each property.
          ...items[index],
          // Update favorite, because that's what we're doing in the function.
          favorite
        };
      }

      // If the item has been favorited on this button press, add it to our favorite items list so
      // we can use it to pre-populate a list in the future.
      if (favorite) {
        favoriteItems.push(items[index]);
      }

      return {
        items,
        favoriteItems,
        completedItems
      };
    });
  };

  handleComplete = (index, completedList) => {
    this.setState(state => {
      // Make a shallow copies with array spread syntax to avoid mutating state.
      const items = [...state.items];
      const completedItems = [...state.completedItems];

      if (completedList) {
        // If the item was already completed, remove it from that list and add it to the start of
        // the default list.
        const item = completedItems.splice(index, 1)[0];
        // Add the item to the start of the list rather than the end.
        items.unshift(item);
      } else {
        // If the item has just been completed, remove it from the default list and add it to the
        // completed list.
        const completedItem = items.splice(index, 1)[0];
        // Add the item to the start of the list rather than the end.
        completedItems.unshift(completedItem);
      }

      return {
        items,
        completedItems
      };
    });
  };

  handleDelete = (index, completedList) => {
    this.setState(state => {
      if (completedList) {
        // If we're deleting and the item has already been completed, remove it from the completed
        // list. Make a shallow copy with array spread syntax to avoid mutating state.
        let completedItems = [...state.completedItems];
        completedItems.splice(index, 1);
        return {
          completedItems
        };
      } else {
        // If we're deleting and the item has NOT already been completed, remove it from the default
        // list. Make a shallow copy with array spread syntax to avoid mutating state.
        let items = [...state.items];
        items.splice(index, 1);
        return {
          items
        };
      }
    });
  };

  resetList = (fromFavorites = false) => {
    this.setState(state => {
      return {
        ...initialState,
        // If we're creating a new list and pre-populating from favorites pull that data in,
        // otherwise just set it to an empty array
        items: fromFavorites ? state.favoriteItems : [],
        // we want favorited items to live until they're not favorited, so don't use default setting
        favoriteItems: state.favoriteItems,
        // Loading is only used when rehydrating state from AsyncStorage
        loading: false,
        hasShownNudge: true
      };
    });
  };

  render() {
    const {
      nextItem,
      items,
      completedItems,
      loading,
      hasShownNudge
    } = this.state;

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
            blurOnSubmit={false}
            autoFocus
          />
        </Header>

        <SafeAreaView style={{ flex: 1 }}>
          <SectionList
            keyExtractor={item => item.id}
            // keyboardShouldPersistTaps="always"
            sections={[
              { title: 'GET', data: items, completedList: false },
              { title: 'CART', data: completedItems, completedList: true }
            ]}
            renderSectionHeader={({ section }) => (
              <SectionHeader title={section.title} />
            )}
            renderItem={({ item, index, section }) => {
              return (
                <ListItem
                  name={item.name}
                  favorite={item.favorite}
                  onFavorite={() =>
                    this.handleFavorite(index, section.completedList)
                  }
                  onComplete={() =>
                    this.handleComplete(index, section.completedList)
                  }
                  onDelete={() =>
                    this.handleDelete(index, section.completedList)
                  }
                  completed={section.completedList}
                  nudgeOnLoad={
                    !section.completedList && index === 0 && !hasShownNudge
                  }
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
    backgroundColor: '#d3d3d3',
    marginLeft: 20
  }
});
