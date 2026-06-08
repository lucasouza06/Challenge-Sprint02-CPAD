import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../screens/DashboardScreen';
import OrdensScreen from '../screens/OrdensScreen';
import NovoLevantamentoScreen from '../screens/NovoLevantamentoScreen';
import FaunaScreen from '../screens/FaunaScreen';

import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { useAppStore } from '../store/AppContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── BOTTOM TAB BAR CUSTOMIZADA ─────────────────────────────
function TabBar({ state, descriptors, navigation }: any) {
  const { state: appState } = useAppStore();
  const osUrgentes = appState.dashboardStats.osUrgentes;
  const restricoesAtivas = appState.dashboardStats.restricoesAtivas;

  const tabs = [
    { icon: '🗺️', label: 'Mapa', badge: null },
    { icon: '📋', label: 'Ordens', badge: osUrgentes > 0 ? osUrgentes : null },
    { icon: '📍', label: 'Registrar', badge: null },
    { icon: '🦜', label: 'Fauna', badge: restricoesAtivas > 0 ? restricoesAtivas : null },
  ];

  return (
    <View style={tabStyles.container}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = tabs[index];

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        if (index === 2) {
          // Botão central de registro
          return (
            <TouchableOpacity key={route.key} style={tabStyles.centerBtn} onPress={onPress} activeOpacity={0.85}>
              <View style={tabStyles.centerBtnInner}>
                <Text style={tabStyles.centerIcon}>{tab.icon}</Text>
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={tabStyles.tab}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View style={tabStyles.iconContainer}>
              <Text style={[tabStyles.icon, isFocused && tabStyles.iconActive]}>
                {tab.icon}
              </Text>
              {tab.badge !== null && (
                <View style={tabStyles.badge}>
                  <Text style={tabStyles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[tabStyles.label, isFocused && tabStyles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: Spacing.sm,
  },
  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3,
    paddingVertical: 4, minHeight: 48,
  },
  iconContainer: { position: 'relative' },
  icon: { fontSize: 22, opacity: 0.5 },
  iconActive: { opacity: 1 },
  label: {
    fontSize: 10, color: Colors.textMuted, fontWeight: Typography.weight.medium,
  },
  labelActive: { color: Colors.primary, fontWeight: Typography.weight.bold },
  badge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: Colors.nivel3,
    borderRadius: BorderRadius.full, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: Colors.white, fontSize: 9, fontWeight: Typography.weight.extrabold },
  centerBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 0,
  },
  centerBtnInner: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  centerIcon: { fontSize: 24 },
});

// ─── TAB NAVIGATOR ───────────────────────────────────────────
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Ordens" component={OrdensScreen} />
      <Tab.Screen name="NovoLevantamento" component={NovoLevantamentoScreen} initialParams={{}} />
      <Tab.Screen name="Fauna" component={FaunaScreen} />
    </Tab.Navigator>
  );
}

// ─── ROOT NAVIGATOR ──────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="NovoLevantamento"
          component={NovoLevantamentoScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
