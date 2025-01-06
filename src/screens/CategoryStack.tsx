import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryProductsScreen from '../screens/CategoryProductsScreen';
import { StackParamList } from '../../types'; // Make sure to import StackParamList

const Stack = createStackNavigator<StackParamList>();

const CategoryStack = () => {
  return (
    <Stack.Navigator initialRouteName="Categories">
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
    </Stack.Navigator>
  );
};

export default CategoryStack;
