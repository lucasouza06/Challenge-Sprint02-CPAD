import React from 'react';
import { StatusBar } from 'react-native';
import { AppProvider } from './src/store/AppContext';
import AppNavigator from './src/services/navigation';
import { registerRootComponent } from 'expo';

function App() {
  return (
    <AppProvider>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </AppProvider>
  );
}

registerRootComponent(App);

export default App;