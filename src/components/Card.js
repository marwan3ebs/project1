import React from 'react';
import { View } from 'react-native';

import { ui } from './styles.js';

export function Card({ children, style }) {
  return <View style={[ui.card, style]}>{children}</View>;
}
