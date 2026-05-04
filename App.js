import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { MainNavigator } from './src/navigation/MainNavigator.js';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <MainNavigator />
    </>
  );
}
