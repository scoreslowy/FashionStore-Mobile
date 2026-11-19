import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'fashionstore.session.v1';
const ACCOUNT_PREFIX = 'fashionstore.account.v1.';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function accountStorageKey(email) {
  // SecureStore aceita apenas caracteres simples nas chaves. Codificamos o e-mail em hexadecimal.
  const encoded = Array.from(normalizeEmail(email))
    .map((character) => character.codePointAt(0).toString(16))
    .join('-');
  return `${ACCOUNT_PREFIX}${encoded}`;
}

async function getItem(key) {
  if (Platform.OS === 'web') {
    if (typeof globalThis.localStorage === 'undefined') return null;
    return globalThis.localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key, value) {
  if (Platform.OS === 'web') {
    if (typeof globalThis.localStorage === 'undefined') {
      throw new Error('O armazenamento local não está disponível neste navegador.');
    }
    globalThis.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key) {
  if (Platform.OS === 'web') {
    if (typeof globalThis.localStorage !== 'undefined') globalThis.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function registerAccount({ name, email, password }) {
  const cleanEmail = normalizeEmail(email);
  const key = accountStorageKey(cleanEmail);
  const existing = await getItem(key);

  if (existing) {
    throw new Error('Já existe uma conta cadastrada com este e-mail. Faça login.');
  }

  const account = {
    name: String(name || '').trim(),
    email: cleanEmail,
    password,
  };

  await setItem(key, JSON.stringify(account));
  const publicUser = { name: account.name, email: account.email };
  await setItem(SESSION_KEY, JSON.stringify(publicUser));
  return publicUser;
}

export async function loginWithAccount(email, password) {
  const cleanEmail = normalizeEmail(email);
  const rawAccount = await getItem(accountStorageKey(cleanEmail));

  if (!rawAccount) {
    throw new Error('Cadastro não encontrado. Se ainda não possui conta, selecione “Criar conta”.');
  }

  let account;
  try {
    account = JSON.parse(rawAccount);
  } catch {
    throw new Error('Não foi possível ler este cadastro. Crie a conta novamente.');
  }

  if (account.password !== password) {
    throw new Error('Senha incorreta. Confira os dados e tente novamente.');
  }

  const publicUser = { name: account.name, email: account.email };
  await setItem(SESSION_KEY, JSON.stringify(publicUser));
  return publicUser;
}

export async function restoreSession() {
  const rawSession = await getItem(SESSION_KEY);
  if (!rawSession) return null;
  try {
    const user = JSON.parse(rawSession);
    return user?.email ? user : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  await removeItem(SESSION_KEY);
  // O cadastro do cliente permanece salvo. O logout remove apenas a sessão atual.
}
