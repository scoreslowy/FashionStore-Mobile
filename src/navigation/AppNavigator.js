import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import Loading from '../components/Loading';
import { restoreAuth } from '../store/authSlice';
import { restoreSession } from '../services/authStorage';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, isHydrated } = useSelector((state) => state.auth);

  useEffect(() => {
    let active = true;
    restoreSession()
      .then((user) => {
        if (active) dispatch(restoreAuth(user));
      })
      .catch(() => {
        if (active) dispatch(restoreAuth(null));
      });
    return () => { active = false; };
  }, [dispatch]);

  if (!isHydrated) return <Loading message="Carregando seus dados..." />;

  return (
    <Stack.Navigator
      key={isAuthenticated ? 'authenticated' : 'guest'}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
