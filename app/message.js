// app/message.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { database, ref, set, remove, onValue } from '../firebaseConfig'; // Ajuste o caminho se necessário
import { Link } from 'expo-router';

export default function MessageScreen() {
  const [message, setMessage] = useState('');
  const [currentDisplayMessage, setCurrentDisplayMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const displayRef = ref(database, 'comandos/display');
    const unsubscribe = onValue(displayRef, (snapshot) => {
      const msg = snapshot.val();
      setCurrentDisplayMessage(msg || "Nenhuma mensagem definida.");
    }, (error) => {
      console.error("Erro ao ler mensagem atual do display:", error);
      setCurrentDisplayMessage("Erro ao carregar mensagem.");
      // NENHUM Alert.alert de debug aqui, apenas console.error
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (message.trim() === '') {
      Alert.alert("Campo Vazio", "Por favor, digite uma mensagem para enviar.");
      return;
    }
    setLoading(true);
    try {
      await set(ref(database, 'comandos/display'), message.trim());
      Alert.alert("Sucesso", "Mensagem enviada para o display!"); // Este Alert é de feedback, OK
      setMessage('');
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      Alert.alert("Erro", "Falha ao enviar mensagem. Tente novamente."); // Este Alert é de feedback, OK
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = async () => {
    setLoading(true);
    try {
      await remove(ref(database, 'comandos/display'));
      Alert.alert("Sucesso", "Mensagem do display apagada!"); // Este Alert é de feedback, OK
      setMessage('');
    } catch (error) {
      console.error("Erro ao apagar mensagem:", error);
      Alert.alert("Erro", "Falha ao apagar mensagem. Tente novamente."); // Este Alert é de feedback, OK
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* O Link já é um componente de texto por padrão, então está ok */}
      <Link href="/" style={styles.backButton}>
        <Text>Voltar para Home</Text> {/* Adicionando Text dentro do Link por boa prática, embora Link já aceite texto */}
      </Link>
      <Text style={styles.title}>Controle de Mensagem do Display</Text>

      <View style={styles.currentMessageContainer}>
        <Text style={styles.currentMessageLabel}>Mensagem Atual no Display:</Text>
        <Text style={styles.currentMessageText}>{currentDisplayMessage}</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Digite sua mensagem para o display..."
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        style={[styles.button, styles.sendButton]}
        onPress={sendMessage}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Enviar Mensagem</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.clearButton]}
        onPress={clearMessage}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Apagar Mensagem</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
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
  currentMessageContainer: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  currentMessageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  currentMessageText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sendButton: {
    backgroundColor: '#28a745',
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});