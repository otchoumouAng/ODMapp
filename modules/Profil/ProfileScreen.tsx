import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { Spacing, Styles, Typography } from '../../styles/style';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={[Styles.container, { padding: Spacing.lg }]}>
      <Text style={Typography.h2}>Profil</Text>
      
      {user && (
        <View style={[Styles.card, { marginTop: Spacing.lg }]}>
          <Text>Utilisateur: {user.username}</Text>
          <Text>Email: {user.email}</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[Styles.buttonSecondary, { marginTop: Spacing.xl }]}
        onPress={logout}
        accessibilityLabel="Se déconnecter"
      >
        <Text style={Styles.textButton}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}