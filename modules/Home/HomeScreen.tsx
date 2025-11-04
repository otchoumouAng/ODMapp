import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../contexts/AuthContext';
import { Users, Truck, TrayArrowDown, ArrowsLeftRight, Package } from "phosphor-react-native";
import { Styles, Colors, Spacing, Typography } from '../../styles/style';



const modules = [
  { id: "stock", title: "Stock", icon: Package, screen: "Stock" },
  { id: "sortie", title: "Sortie", icon: Truck, screen: "Sortie" },
  { id: "entre", title: "Entrée", icon: TrayArrowDown, screen: "Entre" },
  { id: "mouvementStock", title: "Mouvement", icon: ArrowsLeftRight, screen: "MouvementStock" },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  return (
    <ScrollView style={Styles.container}>
      <View style={{ padding: Spacing.lg, backgroundColor: Colors.card, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: Spacing.md }}>
          <Image
            source={require('../../assets/Logo.png')}
            style={{ width: 150, height: 50, resizeMode: 'contain' }}
          />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={[Typography.h2, { color: Colors.textDark }]}>Bienvenue, {user?.name}!</Text>
          <Text style={[Typography.body, { color: Colors.textMedium }]}>{user?.magasinNom}</Text>
        </View>
      </View>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: Spacing.lg }}>
        {modules.map((module) => (
          <TouchableOpacity
            key={module.id}
            style={[
              Styles.card, 
              { 
                width: '40%', 
                alignItems: 'center',
                margin: Spacing.sm 
              }
            ]}
            onPress={() => navigation.navigate(module.screen as never)}
            accessibilityLabel={`Ouvrir le module ${module.title}`}
          >
            <module.icon size={32} color={Colors.primary} />
            <Text style={{ marginTop: Spacing.sm, textAlign: 'center' }}>
              {module.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
