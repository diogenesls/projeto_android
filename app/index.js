// app/index.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { database, ref, onValue } from '../firebaseConfig'; // Removi set, remove pois não são usados aqui
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Import para usar o useFocusEffect

// Função para formatar o valor (se precisar de N/A)
const formatValue = (value, decimals = 1, unit = '') => {
  if (value === undefined || value === null) {
    return 'N/A';
  }
  if (typeof value === 'number') {
    return `${value.toFixed(decimals)}${unit}`;
  }
  return `${value}${unit}`; // Para gás, que pode ser string
};

export default function HomeScreen() { // <-- EXPORT DEFAULT AQUI
  const [temperatura, setTemperatura] = useState(null);
  const [umidade, setUmidade] = useState(null);
  const [gas, setGas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshing(true); // Ativa o refresh indicator

    const sensoresRef = ref(database, 'sensores');

    try {
      const unsubscribe = onValue(sensoresRef, (snapshot) => {
        const data = snapshot.val();
        console.log("Dados do Firebase (HomeScreen):", data); // Log de depuração

        if (data) {
          setTemperatura(formatValue(data.temperatura, 1));
          setUmidade(formatValue(data.umidade, 1));
          setGas(formatValue(data.gas, 0)); // Gás pode ser int
          console.log("Dados de sensores atualizados.");
        } else {
          setTemperatura('N/A');
          setUmidade('N/A');
          setGas('N/A');
          console.warn("Nenhum dado de sensor encontrado em /sensores no Firebase.");
        }
        setLoading(false);
        setRefreshing(false);
      }, (err) => {
        console.error("Erro de leitura do Firebase (HomeScreen):", err);
        setError("Erro ao carregar dados. Verifique sua conexão e as permissões do Firebase.");
        setLoading(false);
        setRefreshing(false);
      });
      return () => unsubscribe(); // Limpa o listener ao desmontar
    } catch (initError) {
      console.error("Erro na configuração do listener do Firebase (HomeScreen):", initError);
      setError("Erro crítico ao configurar a conexão com o Firebase.");
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Use useFocusEffect para buscar dados quando a tela estiver em foco
  useFocusEffect(
    useCallback(() => {
      fetchData(); // Chama a função para buscar dados
      // Não precisa retornar uma função de limpeza aqui se fetchData já retorna unsubscribe
    }, [fetchData])
  );


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchData} colors={['#007bff']} />
      }
    >
      <Text style={styles.header}>Dados dos Sensores</Text>

      <View style={styles.dataContainer}>
        <View style={styles.card}>
          <FontAwesome5 name="thermometer-half" size={30} color="#dc3545" style={styles.icon} />
          <Text style={styles.cardTitle}>Temperatura</Text>
          <Text style={styles.cardValue}>{temperatura}°C</Text>
        </View>

        <View style={styles.card}>
          <MaterialCommunityIcons name="water-percent" size={30} color="#007bff" style={styles.icon} />
          <Text style={styles.cardTitle}>Umidade</Text>
          <Text style={styles.cardValue}>{umidade}%</Text>
        </View>

        <View style={styles.card}>
          <MaterialCommunityIcons name="gas-cylinder" size={30} color="#ffc107" style={styles.icon} />
          <Text style={styles.cardTitle}>Gás</Text>
          <Text style={styles.cardValue}>{gas}</Text>
        </View>
      </View>

      <Text style={styles.footer}>Última atualização: {new Date().toLocaleTimeString()}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 30,
    textAlign: 'center',
  },
  dataContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  icon: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#343a40',
  },
  footer: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});