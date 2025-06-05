// app/control.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { database, ref, set, onValue } from '../firebaseConfig'; // Ajuste o caminho se necessário
import { Link } from 'expo-router';

export default function ControlScreen() {
  const [autoMode, setAutoMode] = useState(true);
  const [buzzerActive, setBuzzerActive] = useState(true);
  const [loading, setLoading] = useState(true);

  // Estados para LEDs manuais
  const [ledTempVerde, setLedTempVerde] = useState(false);
  const [ledTempAmarelo, setLedTempAmarelo] = useState(false);
  const [ledTempVermelho, setLedTempVermelho] = useState(false);
  const [ledUmidVerde, setLedUmidVerde] = useState(false);
  const [ledUmidAmarelo, setLedUmidAmarelo] = useState(false);
  const [ledUmidVermelho, setLedUmidVermelho] = useState(false);

  useEffect(() => {
    const comandosRef = ref(database, 'comandos');

    const unsubscribe = onValue(comandosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAutoMode(data.autoMode !== undefined ? data.autoMode : true);
        setBuzzerActive(data.buzzer !== undefined ? data.buzzer : true);

        if (data.leds) {
          setLedTempVerde(data.leds.tempVerde || false);
          setLedTempAmarelo(data.leds.tempAmarelo || false);
          setLedTempVermelho(data.leds.tempVermelho || false);
          setLedUmidVerde(data.leds.umidVerde || false);
          setLedUmidAmarelo(data.leds.umidAmarelo || false);
          setLedUmidVermelho(data.leds.umidVermelho || false);
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao ler comandos do Firebase:", error);
      Alert.alert("Erro", "Não foi possível carregar o estado dos controles.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateFirebase = async (path, value) => {
    try {
      await set(ref(database, path), value);
      // Alert.alert("Sucesso", "Comando enviado!"); // Mantido comentado, se não for para feedback
    } catch (error) {
      console.error(`Erro ao atualizar ${path}:`, error);
      Alert.alert("Erro", `Falha ao atualizar ${path}. Tente novamente.`);
    }
  };

  const toggleAutoMode = async (value) => {
    setAutoMode(value);
    await updateFirebase('comandos/autoMode', value);
  };

  const toggleBuzzer = async (value) => {
    setBuzzerActive(value);
    await updateFirebase('comandos/buzzer', value);
  };

  const toggleLed = async (ledName, value) => {
    // Atualiza o estado local primeiro para resposta rápida da UI
    switch (ledName) {
      case 'tempVerde': setLedTempVerde(value); break;
      case 'tempAmarelo': setLedTempAmarelo(value); break;
      case 'tempVermelho': setLedTempVermelho(value); break;
      case 'umidVerde': setLedUmidVerde(value); break;
      case 'umidAmarelo': setLedUmidAmarelo(value); break;
      case 'umidVermelho': setLedUmidVermelho(value); break;
    }
    await updateFirebase(`comandos/leds/${ledName}`, value);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
        <Text style={styles.loadingText}>Carregando controles...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* CORREÇÃO AQUI: Envolver o texto do Link em um componente <Text> */}
        <Link href="/" style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar para Home</Text>
        </Link>
        <Text style={styles.title}>Controle de Buzzer e LEDs</Text>

        <View style={styles.controlGroup}>
          <Text style={styles.label}>Modo Automático de LEDs</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={autoMode ? "#007bff" : "#f4f3f4"}
            onValueChange={toggleAutoMode}
            value={autoMode}
          />
          <Text style={styles.description}>
            {autoMode
              ? "LEDs controlados automaticamente pelo ESP32 com base nos sensores."
              : "Controle manual dos LEDs ativado. Use os botões abaixo."}
          </Text>
        </View>

        <View style={styles.controlGroup}>
          <Text style={styles.label}>Buzzer Ativo</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#ff4d4d" }}
            thumbColor={buzzerActive ? "#dc3545" : "#f4f3f4"}
            onValueChange={toggleBuzzer}
            value={buzzerActive}
          />
          <Text style={styles.description}>
            Controla se o buzzer pode ser ativado pelo sensor de gás.
          </Text>
        </View>

        {!autoMode && (
          <View style={styles.manualLedControl}>
            <Text style={styles.sectionTitle}>Controle Manual de LEDs</Text>

            <View style={styles.ledGroup}>
              <Text style={styles.ledGroupTitle}>Temperatura:</Text>
              <View style={styles.ledToggleContainer}>
                <Text style={styles.ledLabel}>Verde</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={ledTempVerde ? "#28a745" : "#f4f3f4"}
                  onValueChange={(value) => toggleLed('tempVerde', value)}
                  value={ledTempVerde}
                />
              </View>
              <View style={styles.ledToggleContainer}>
                <Text style={styles.ledLabel}>Amarelo</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={ledTempAmarelo ? "#ffc107" : "#f4f3f4"}
                  onValueChange={(value) => toggleLed('tempAmarelo', value)}
                  value={ledTempAmarelo}
                />
              </View>
              <View style={styles.ledToggleContainer}>
                <Text style={styles.ledLabel}>Vermelho</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={ledTempVermelho ? "#dc3545" : "#f4f3f4"}
                  onValueChange={(value) => toggleLed('tempVermelho', value)}
                  value={ledTempVermelho}
                />
              </View>
            </View>

            <View style={styles.ledGroup}>
              <Text style={styles.ledGroupTitle}>Umidade:</Text>
              <View style={styles.ledToggleContainer}>
                <Text style={styles.ledLabel}>Verde</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={ledUmidVerde ? "#28a745" : "#f4f3f4"}
                  onValueChange={(value) => toggleLed('umidVerde', value)}
                  value={ledUmidVerde}
                />
              </View>
              <View style={styles.ledToggleContainer}>
                <Text style={styles.ledLabel}>Amarelo</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={ledUmidAmarelo ? "#ffc107" : "#f4f3f4"}
                  onValueChange={(value) => toggleLed('umidAmarelo', value)}
                  value={ledUmidAmarelo}
                />
              </View>
              <View style={styles.ledToggleContainer}>
                <Text style={styles.ledLabel}>Vermelho</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={ledUmidVermelho ? "#dc3545" : "#f4f3f4"}
                  onValueChange={(value) => toggleLed('umidVermelho', value)}
                  value={ledUmidVermelho}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    // Remover as propriedades de texto daqui, elas serão aplicadas ao Text dentro do Link
    // color: '#007bff',
    // fontSize: 16,
    // fontWeight: 'bold',
  },
  // Adicionar um novo estilo para o texto dentro do Link
  backButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  controlGroup: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
    width: '100%',
  },
  manualLedControl: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  ledGroup: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  ledGroupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },
  ledToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  ledLabel: {
    fontSize: 16,
    color: '#666',
  },
  loadingIndicator: {
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});