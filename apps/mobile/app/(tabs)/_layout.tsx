import React from "react";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { TopBar } from "../../src/components/TopBar";
import { CustomTabBar } from "../../src/components/CustomTabBar";

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <TopBar />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{ title: "Inicio" }}
        />
        <Tabs.Screen
          name="temario"
          options={{ title: "Temario" }}
        />
        <Tabs.Screen
          name="feed"
          options={{ title: "Feed" }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: "Perfil" }}
        />
        <Tabs.Screen
          name="logros"
          options={{ href: null, title: "Medallas" }}
        />
      </Tabs>
    </View>
  );
}
