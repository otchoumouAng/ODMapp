import React from 'react';
import { View, Text } from 'react-native';
import { Styles, Typography } from '../../styles/style';

const StockScreen = () => {
  return (
    <View style={[Styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={Typography.h1}>Stock Screen</Text>
    </View>
  );
};

export default StockScreen;
