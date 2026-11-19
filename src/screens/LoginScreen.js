import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { loginWithAccount, registerAccount } from '../services/authStorage';
import theme from '../styles/theme';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('error');
  const [submitting, setSubmitting] = useState(false);

  const isRegistering = mode === 'register';

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFeedback('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isRegistering && !name.trim()) {
      setFeedback('Informe seu nome para criar o cadastro.');
      setFeedbackType('error');
      return;
    }
    if (!cleanEmail || !password.trim()) {
      setFeedback('Preencha o e-mail e a senha.');
      setFeedbackType('error');
      return;
    }
    if (!emailRegex.test(cleanEmail)) {
      setFeedback('Informe um endereço de e-mail válido.');
      setFeedbackType('error');
      return;
    }
    if (password.length < 6) {
      setFeedback('A senha deve ter pelo menos 6 caracteres.');
      setFeedbackType('error');
      return;
    }
    if (isRegistering && password !== confirmPassword) {
      setFeedback('As senhas não coincidem.');
      setFeedbackType('error');
      return;
    }

    setSubmitting(true);
    setFeedback('');
    try {
      const user = isRegistering
        ? await registerAccount({ name, email: cleanEmail, password })
        : await loginWithAccount(cleanEmail, password);
      dispatch(login(user));
    } catch (error) {
      setFeedback(error?.message || 'Não foi possível concluir a operação. Tente novamente.');
      setFeedbackType('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.brand}>FASHIONSTORE</Text>
          <Text style={styles.tagline}>Seu estilo começa aqui.</Text>

          <View style={styles.form}>
            <Text style={styles.heading}>{isRegistering ? 'Crie sua conta' : 'Bem-vindo(a)!'}</Text>
            <Text style={styles.description}>
              {isRegistering
                ? 'Cadastre seus dados para acessar sua conta sempre que voltar.'
                : 'Entre com seu cadastro para explorar nossa coleção.'}
            </Text>

            <View style={styles.modeTabs}>
              <TouchableOpacity
                style={[styles.modeTab, !isRegistering && styles.modeTabActive]}
                onPress={() => switchMode('login')}
              >
                <Text style={[styles.modeTabText, !isRegistering && styles.modeTabTextActive]}>ENTRAR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeTab, isRegistering && styles.modeTabActive]}
                onPress={() => switchMode('register')}
              >
                <Text style={[styles.modeTabText, isRegistering && styles.modeTabTextActive]}>CRIAR CONTA</Text>
              </TouchableOpacity>
            </View>

            {isRegistering ? (
              <>
                <Text style={styles.label}>Nome completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Como podemos chamar você?"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                  accessibilityLabel="Nome completo"
                />
              </>
            ) : null}

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              accessibilityLabel="E-mail"
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo de 6 caracteres"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              accessibilityLabel="Senha"
            />

            {isRegistering ? (
              <>
                <Text style={styles.label}>Confirme sua senha</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite a senha novamente"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  accessibilityLabel="Confirme sua senha"
                />
              </>
            ) : null}

            {feedback ? (
              <Text style={[styles.feedback, feedbackType === 'error' ? styles.feedbackError : styles.feedbackSuccess]}>
                {feedback}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#FFFFFF" /> : (
                <Text style={styles.buttonText}>{isRegistering ? 'CRIAR CADASTRO' : 'ENTRAR'}</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.footer}>
              Cadastro demonstrativo salvo neste dispositivo. Não há autenticação em servidor nesta versão acadêmica.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 28 },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 24 },
  brand: { fontSize: 27, fontWeight: '900', letterSpacing: 3, textAlign: 'center', color: theme.colors.primary },
  tagline: { textAlign: 'center', marginTop: 8, color: theme.colors.secondary },
  form: { marginTop: 35, backgroundColor: '#FFFFFF', padding: 22, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border },
  heading: { fontSize: 24, fontWeight: '800', color: theme.colors.primary },
  description: { color: theme.colors.secondary, marginTop: 7, marginBottom: 18, lineHeight: 19 },
  modeTabs: { flexDirection: 'row', backgroundColor: theme.colors.muted, borderRadius: 9, padding: 4, marginBottom: 7 },
  modeTab: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 7 },
  modeTabActive: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: theme.colors.border },
  modeTabText: { color: theme.colors.secondary, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  modeTabTextActive: { color: theme.colors.primary },
  label: { fontWeight: '700', marginBottom: 7, marginTop: 13, color: theme.colors.primary, fontSize: 13 },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 9, padding: 13, fontSize: 15, color: theme.colors.primary, backgroundColor: '#FFFEFC' },
  feedback: { fontSize: 12, lineHeight: 18, marginTop: 13 },
  feedbackError: { color: theme.colors.danger },
  feedbackSuccess: { color: theme.colors.success },
  button: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginTop: 22, minHeight: 50 },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: '#FFFFFF', fontWeight: '800', letterSpacing: 1.5 },
  footer: { fontSize: 10, textAlign: 'center', color: theme.colors.secondary, marginTop: 17, lineHeight: 15 },
});
