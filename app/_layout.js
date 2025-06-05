// app/_layout.js
import React, { useEffect } from 'react'; // Adicione useEffect
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'; // Importe para inicializar o Auth
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // Importe AsyncStorage

import { app } from '../firebaseConfig'; // Importe a instância do app Firebase (você precisa exportá-la em firebaseConfig.js)

export default function AppLayout() {
  useEffect(() => {
    // Tenta inicializar o Firebase Auth com persistência aqui no layout principal
    // Isso garante que o AsyncStorage esteja pronto
    try {
      if (app && !app._auth) { // Verifica se o app existe e o auth não foi inicializado ainda
        initializeAuth(app, {
          persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        });
        console.log("Firebase Auth Persistence initialized in _layout.js");
      }
    } catch (e) {
      console.error("Failed to initialize Firebase Auth Persistence in _layout.js:", e);
      // Não use Alert.alert aqui, pois pode ser spammy no console
    }
  }, []); // Execute apenas uma vez ao montar o componente

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sensores',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="thermometer-half" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="control"
        options={{
          title: 'Controle',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="remote" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: 'Mensagem',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}