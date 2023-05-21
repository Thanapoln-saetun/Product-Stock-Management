import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AddProduct from './screens/AddProduct';
import ProductDetail from './screens/ProductDetail';
import StockOut from './screens/StockOut';
import StockIn from './screens/StockIn';
import Dashboard from './screens/Dashboard';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="AddProduct"
        screenOptions={({ route, navigation }) => ({
          unmountOnBlur: true,
          headerTintColor: 'transparent',
          headerStyle: {
            backgroundColor: '#3695e0',
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            height: 100,
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#fff',
            textAlign: 'center',
          },
          headerLeft: () => (
            <View style={{ marginLeft: 30 }}>
              <Ionicons
                name="ios-menu"
                size={30}
                color="#fff"
                onPress={() => navigation.openDrawer()}
              />
            </View>
          ),
          headerRight: () => {
            if (route.name === 'Product Detail') {
              return (
                <View style={{ marginRight: 30 }}>
                  <Ionicons
                    name="add-circle-outline"
                    size={30}
                    color="#fff"
                    onPress={() => navigation.navigate('Add Product')}
                  />
                </View>
              );
            } else {
              return (
                <View style={{ marginRight: 30 }}>
                  <Ionicons
                    name="ellipsis-vertical-circle"
                    size={30}
                    color="#fff"
                  />
                </View>
              );
            }
          },
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Stock In') {
              iconName = 'add-circle-outline';
            } else if (route.name === 'Dashboard') {
              iconName = 'grid-outline';
            } else if (route.name === 'Stock Out') {
              iconName = 'remove-circle-outline';
            } else if (route.name === 'Add Product') {
              iconName = 'cube-outline';
            } else if (route.name === 'Product Detail') {

              iconName = 'file-tray-stacked-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: '#3695e0',
          inactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: 'red',
            height: 80,
          },
        }}
      >
        <Tab.Screen name="Stock In" component={StockIn} />
        <Tab.Screen name="Add Product" component={AddProduct} />
        <Tab.Screen name="Dashboard" component={Dashboard} />
        <Tab.Screen name="Product Detail" component={ProductDetail} />
        <Tab.Screen name="Stock Out" component={StockOut} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
