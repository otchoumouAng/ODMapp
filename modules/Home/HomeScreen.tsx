import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Users, Truck, TrayArrowDown, ArrowsLeftRight } from "phosphor-react-native";
import { Styles, Colors, Spacing, Typography } from '../../styles/style';



const modules = [
  { id: "clients", title: "Clients", icon: Users, screen: "Clients" },
  { id: "expedition", title: "Expédition", icon: Truck, screen: "Expedition" },
  { id: "reception", title: "Réception", icon: TrayArrowDown, screen: "Reception" },
  { id: "mouvementStock", title: "Mouvement du Stock", icon: ArrowsLeftRight, screen: "MouvementStock" },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={Styles.container}>
      <Text style={[Typography.h1, { padding: Spacing.lg }]}>Modules</Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
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
