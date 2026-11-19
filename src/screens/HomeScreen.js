import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { addToCart, clearCart } from '../store/cartSlice';
import { clearSession } from '../services/authStorage';
import { getProductsByCategory } from '../services/api';
import ProductCard from '../components/ProductCard';
import CartPanel from '../components/CartPanel';
import Loading from '../components/Loading';
import theme from '../styles/theme';

const categories = {
  Masculino: [
    { id: 'mens-shirts', label: 'Camisas' },
    { id: 'mens-shoes', label: 'Calçados' },
    { id: 'mens-watches', label: 'Relógios' },
  ],
  Feminino: [
    { id: 'womens-bags', label: 'Bolsas' },
    { id: 'womens-dresses', label: 'Vestidos' },
    { id: 'womens-jewellery', label: 'Joias' },
    { id: 'womens-shoes', label: 'Calçados' },
    { id: 'womens-watches', label: 'Relógios' },
  ],
};

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 1050;
  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);
  const [gender, setGender] = useState('Masculino');
  const [selectedCategory, setSelectedCategory] = useState('mens-shirts');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      try {
        setLoading(true);
        setError('');
        const data = await getProductsByCategory(selectedCategory);
        if (active) setProducts(data);
      } catch {
        if (active) {
          setProducts([]);
          setError('Não foi possível carregar os produtos. Verifique sua conexão e tente novamente.');
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }
    loadProducts();
    return () => { active = false; };
  }, [selectedCategory, retry]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRetry((value) => value + 1);
  }, []);

  const changeGender = (value) => {
    setGender(value);
    setSelectedCategory(categories[value][0].id);
  };

  const selectDrawerCategory = (newGender, categoryId) => {
    setGender(newGender);
    setSelectedCategory(categoryId);
    setDrawerVisible(false);
  };

  const handleLogout = async () => {
    setDrawerVisible(false);
    try {
      await clearSession();
    } catch {
      // Mesmo que o dispositivo não consiga limpar o armazenamento, a sessão visual é encerrada.
    }
    dispatch(clearCart());
    dispatch(logout());
  };

  const addProduct = (product) => dispatch(addToCart(product));
  const buyNow = (product) => {
    addProduct(product);
    setCartVisible(true);
  };

  const renderDrawer = () => (
    <Modal visible={drawerVisible} transparent animationType="fade" onRequestClose={() => setDrawerVisible(false)}>
      <View style={styles.modalRoot}>
        <View style={styles.leftDrawer}>
          <View style={styles.drawerHeader}>
            <View style={styles.drawerProfile}>
              <Text style={styles.drawerTitle}>Minha conta</Text>
              <Text style={styles.drawerSubtitle}>{user?.name || 'Cliente'}</Text>
              <Text style={styles.drawerEmail}>{user?.email || ''}</Text>
            </View>
            <TouchableOpacity onPress={() => setDrawerVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.drawerSectionDivider} />
          <Text style={styles.drawerSectionTitle}>CATEGORIAS</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.entries(categories).map(([group, items]) => (
              <View key={group} style={styles.drawerGroup}>
                <Text style={styles.drawerGroupTitle}>{group.toUpperCase()}</Text>
                {items.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.drawerCategory, selectedCategory === category.id && styles.drawerCategoryActive]}
                    onPress={() => selectDrawerCategory(group, category.id)}
                  >
                    <Text style={[styles.drawerCategoryText, selectedCategory === category.id && styles.drawerCategoryTextActive]}>
                      {category.label}
                    </Text>
                    <Text style={styles.drawerArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.drawerLogout} onPress={handleLogout} accessibilityRole="button">
            <Text style={styles.drawerLogoutText}>Sair da conta ↗</Text>
          </TouchableOpacity>
        </View>
        <Pressable style={styles.leftBackdrop} onPress={() => setDrawerVisible(false)} />
      </View>
    </Modal>
  );

  return (
    <View style={[styles.screenLayout, isWideLayout && styles.screenLayoutWide]}>
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setDrawerVisible(true)}
            style={styles.headerIconButton}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu da conta e categorias"
          >
            <Text style={styles.headerIcon}>☰</Text>
          </TouchableOpacity>
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>FASHIONSTORE</Text>
            <Text style={styles.welcome}>Olá, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Cliente'}!</Text>
          </View>
          <View style={styles.headerActions}>
            {!isWideLayout ? (
              <TouchableOpacity
                onPress={() => setCartVisible(true)}
                style={styles.headerIconButton}
                accessibilityRole="button"
                accessibilityLabel="Abrir carrinho"
              >
                <Text style={styles.headerIcon}>🛒</Text>
                {cartCount > 0 ? <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text></View> : null}
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} accessibilityRole="button">
              <Text style={styles.logout}>SAIR</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>NOVA COLEÇÃO</Text>
          <Text style={styles.heroTitle}>Descubra seu estilo.</Text>
          <Text style={styles.heroDescription}>Peças selecionadas para todos os momentos.</Text>
        </View>

        <View style={styles.genderTabs}>
          {['Masculino', 'Feminino'].map((item) => {
            const selected = gender === item;
            return (
              <TouchableOpacity key={item} onPress={() => changeGender(item)} style={styles.genderTab} activeOpacity={0.8}>
                <Text style={[styles.genderText, selected && styles.activeGenderText]}>{item.toUpperCase()}</Text>
                {selected ? <View style={styles.genderIndicator} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {categories[gender].map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[styles.categoryButton, selectedCategory === category.id && styles.activeCategory]}
            >
              <Text style={[styles.categoryText, selectedCategory === category.id && styles.activeCategoryText]}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Nossa coleção</Text>
            <Text style={styles.sectionSubtitle}>{gender} • {categories[gender].find((item) => item.id === selectedCategory)?.label}</Text>
          </View>
          <Text style={styles.productCount}>{products.length} produtos</Text>
        </View>

        {loading && !refreshing ? <Loading message="Buscando produtos..." /> : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => setRetry((value) => value + 1)}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            key={`${gender}-${isWideLayout ? 'wide' : 'narrow'}`}
            style={styles.productsList}
            data={products}
            keyExtractor={(item) => String(item.id)}
            numColumns={isWideLayout ? 3 : 2}
            contentContainerStyle={styles.productList}
            columnWrapperStyle={styles.productRow}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} />}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
                onAddToCart={() => addProduct(item)}
                onBuyNow={() => buyNow(item)}
              />
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto encontrado nesta categoria.</Text>}
          />
        )}
        {renderDrawer()}
        {!isWideLayout ? <CartPanel variant="modal" visible={cartVisible} onClose={() => setCartVisible(false)} /> : null}
      </View>
      {isWideLayout ? <CartPanel variant="sidebar" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screenLayout: { flex: 1, backgroundColor: theme.colors.background },
  screenLayoutWide: { flexDirection: 'row' },
  mainContainer: { flex: 1, minWidth: 0, backgroundColor: theme.colors.background, paddingTop: 14, paddingHorizontal: 16, paddingBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 45 },
  headerIconButton: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { fontSize: 19, color: theme.colors.primary },
  brandBlock: { flex: 1, paddingHorizontal: 10, minWidth: 0 },
  brand: { fontSize: 16, fontWeight: '900', letterSpacing: 1.5, color: theme.colors.primary },
  welcome: { color: theme.colors.secondary, fontSize: 11, marginTop: 4 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoutButton: { paddingHorizontal: 8, paddingVertical: 10 },
  logout: { fontSize: 11, fontWeight: '800', color: theme.colors.primary },
  cartBadge: { position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  hero: { backgroundColor: '#E9E3DA', padding: 18, borderRadius: 13, marginTop: 13, marginBottom: 14 },
  heroLabel: { fontSize: 10, letterSpacing: 2, color: theme.colors.secondary, fontWeight: '800' },
  heroTitle: { fontSize: 23, fontWeight: '800', marginTop: 7, color: theme.colors.primary },
  heroDescription: { fontSize: 12, color: theme.colors.secondary, marginTop: 5 },
  genderTabs: { flexDirection: 'row', height: 49, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: 'transparent' },
  genderTab: { flex: 1, height: 49, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  genderText: { color: theme.colors.secondary, fontWeight: '700', fontSize: 12, letterSpacing: 0.3 },
  activeGenderText: { color: theme.colors.primary },
  genderIndicator: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 3, backgroundColor: theme.colors.primary, borderRadius: 2 },
  categoryScroll: { flexGrow: 0, flexShrink: 0, height: 51, marginTop: 5 },
  categoryContent: { minHeight: 48, alignItems: 'center', paddingHorizontal: 2, paddingVertical: 5, gap: 8 },
  categoryButton: { minHeight: 34, justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 18, paddingHorizontal: 15, paddingVertical: 7, backgroundColor: '#FFFFFF' },
  activeCategory: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  categoryText: { color: theme.colors.secondary, fontSize: 11, fontWeight: '600' },
  activeCategoryText: { color: '#FFFFFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9, marginBottom: 9 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.primary },
  sectionSubtitle: { fontSize: 10, color: theme.colors.secondary, marginTop: 3 },
  productCount: { color: theme.colors.secondary, fontSize: 10 },
  productsList: { flex: 1, minHeight: 0 },
  productList: { paddingBottom: 28 },
  productRow: { justifyContent: 'space-between', gap: 10 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: { color: theme.colors.danger, textAlign: 'center', lineHeight: 20 },
  retryButton: { marginTop: 15, backgroundColor: theme.colors.primary, padding: 12, borderRadius: 8 },
  retryText: { color: '#FFFFFF', fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 30, color: theme.colors.secondary },
  modalRoot: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.35)' },
  leftDrawer: { width: '82%', maxWidth: 360, height: '100%', backgroundColor: theme.colors.background, paddingTop: 48, paddingHorizontal: 20, paddingBottom: 24 },
  leftBackdrop: { flex: 1 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  drawerProfile: { flex: 1, minWidth: 0 },
  drawerTitle: { color: theme.colors.primary, fontSize: 22, fontWeight: '900' },
  drawerSubtitle: { color: theme.colors.primary, fontSize: 13, marginTop: 7, fontWeight: '700' },
  drawerEmail: { color: theme.colors.secondary, fontSize: 11, marginTop: 3 },
  drawerSectionDivider: { height: 1, backgroundColor: theme.colors.border, marginBottom: 16 },
  drawerSectionTitle: { fontSize: 10, letterSpacing: 1.6, color: theme.colors.accent, fontWeight: '900', marginBottom: 15 },
  closeButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border, marginLeft: 10 },
  closeButtonText: { fontSize: 14, color: theme.colors.primary, fontWeight: '800' },
  drawerGroup: { marginBottom: 20 },
  drawerGroupTitle: { fontSize: 10, letterSpacing: 1.7, color: theme.colors.accent, fontWeight: '900', marginBottom: 8 },
  drawerCategory: { paddingVertical: 11, paddingHorizontal: 12, borderRadius: 9, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  drawerCategoryActive: { backgroundColor: '#E9E3DA' },
  drawerCategoryText: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },
  drawerCategoryTextActive: { color: theme.colors.primary, fontWeight: '900' },
  drawerArrow: { fontSize: 22, color: theme.colors.secondary },
  drawerLogout: { marginTop: 'auto', borderTopWidth: 1, borderColor: theme.colors.border, paddingTop: 18 },
  drawerLogoutText: { color: theme.colors.danger, fontWeight: '800', fontSize: 13 },
});
