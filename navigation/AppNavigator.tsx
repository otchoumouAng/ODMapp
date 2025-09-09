import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { House, User, Gear, Users, Package, ShoppingCart } from 'phosphor-react-native';
import HomeScreen from '../modules/Home/HomeScreen';
import SettingsScreen from '../modules/Settings/SettingsScreen';
import ProfileScreen from '../modules/Profil/ProfileScreen';
import ClientScreen from '../modules/Client/ClientScreen';
import MouvementStockScreen from '../modules/MouvementStock/MouvementStockScreen';
import ReceptionScreen from '../modules/Reception/ReceptionScreen';
import SortieScreen from '../modules/Sortie/SortieScreen';
// import Palette from '../screens/Palette';
// import OrderPlaceholder from '../screens/OrderPlaceholder';
import { Colors } from '../styles/style';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ headerTitle: 'Modules' }}
      />
      <Stack.Screen 
        name="Clients" 
        component={ClientScreen} 
        options={{ headerTitle: 'Gestion des clients' }}
      />
      <Stack.Screen
        name="MouvementStock"
        component={MouvementStockScreen}
        options={{ headerTitle: 'Mouvements de Stock' }}
      />
      <Stack.Screen
        name="Reception"
        component={ReceptionScreen}
        options={{ headerTitle: 'Réception de Lots' }}
      />
      <Stack.Screen
        name="Sortie"
        component={SortieScreen}
        options={{ headerTitle: 'Sorie de Lots' }}
      />
      
    </Stack.Navigator>
  );
}

// Composant pour les icônes de tab
const TabBarIcon = ({ icon: Icon, color, size }: { icon: React.ComponentType<any>, color: string, size: number }) => {
  return <Icon size={size} color={color} />;
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let IconComponent: React.ComponentType<any>;
          
          if (route.name === 'Accueil') IconComponent = House;
          else if (route.name === 'Profil') IconComponent = User;
          else if (route.name === 'Paramètres') IconComponent = Gear;
          else IconComponent = House;
          
          return <TabBarIcon icon={IconComponent} color={color} size={size} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.secondary,
      })}
    >
      <Tab.Screen 
        name="Accueil" 
        component={HomeStack} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen 
        name="Paramètres" 
        component={SettingsScreen} 
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen} 
      />
    </Tab.Navigator>
  );
}