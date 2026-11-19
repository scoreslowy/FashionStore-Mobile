import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { getProductById } from '../services/api';
import { addToCart } from '../store/cartSlice';
import CartPanel from '../components/CartPanel';
import Loading from '../components/Loading';
import theme from '../styles/theme';
import { formatBRL } from '../utils/currency';

export default function ProductDetailsScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 1050;
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartVisible, setCartVisible] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadProduct() {
      try {
        setLoading(true);
        setError('');
        const data = await getProductById(productId);
        if (active) setProduct(data);
      } catch {
        if (active) setError('Não foi possível carregar este produto. Verifique sua conexão.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProduct();
    return () => { active = false; };
  }, [productId]);

  const handleAddToCart = () => dispatch(addToCart(product));
  const handleBuyNow = () => {
    dispatch(addToCart(product));
    setCartVisible(true);
  };

  const renderPage = () => {
    if (loading) return <View style={styles.center}><Loading message="Carregando produto..." /></View>;

    if (error || !product) {
      return (
        <View style={styles.center}>
          <Text style={styles.error}>{error || 'Produto não encontrado.'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Voltar à coleção</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const discount = Number(product.discountPercentage || 0);
    const originalPrice = discount < 100 ? product.price / (1 - discount / 100) : product.price;
    const imageUri = product.images?.[0] || product.thumbnail;

    return (
      <ScrollView style={styles.detailsScroll} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.productHero, isWideLayout && styles.productHeroWide]}>
          <Image source={{ uri: imageUri }} style={[styles.image, isWideLayout && styles.imageWide]} resizeMode="contain" />
          <View style={styles.content}>
            <Text style={styles.category}>{product.category}</Text>
            <Text style={styles.title}>{product.title}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.rating}>★ {Number(product.rating || 0).toFixed(1)}</Text>
              <Text style={styles.stock}>{product.availabilityStatus || (product.stock > 0 ? 'Disponível' : 'Indisponível')}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatBRL(product.price)}</Text>
              {discount > 0 ? (
                <View>
                  <Text style={styles.originalPrice}>{formatBRL(originalPrice)}</Text>
                  <Text style={styles.discount}>{discount.toFixed(1)}% OFF</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.addButton} onPress={handleAddToCart} activeOpacity={0.85}>
                <Text style={styles.addButtonText}>ADICIONAR À SACOLA</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow} activeOpacity={0.85}>
                <Text style={styles.buyButtonText}>COMPRAR AGORA</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.actionHint}>Escolha adicionar para continuar navegando ou comprar agora para abrir sua sacola.</Text>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{product.description}</Text>
          <View style={styles.detailsBox}>
            <Text style={styles.detail}>Marca: {product.brand || 'Não informada'}</Text>
            <Text style={styles.detail}>Estoque: {product.stock ?? 'Não informado'}</Text>
            <Text style={styles.detail}>Categoria: {product.category}</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.screenLayout, isWideLayout && styles.screenLayoutWide]}>
      <View style={styles.mainContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButtonTop} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Voltar à coleção</Text>
          </TouchableOpacity>
          <Text style={styles.brand}>FASHIONSTORE</Text>
          {!isWideLayout ? (
            <TouchableOpacity style={styles.cartButton} onPress={() => setCartVisible(true)} accessibilityLabel="Abrir carrinho">
              <Text style={styles.cartButtonText}>🛒</Text>
            </TouchableOpacity>
          ) : <View style={styles.topBarSpacer} />}
        </View>
        {renderPage()}
        {!isWideLayout ? <CartPanel variant="modal" visible={cartVisible} onClose={() => setCartVisible(false)} /> : null}
      </View>
      {isWideLayout ? <CartPanel variant="sidebar" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screenLayout: { flex: 1, backgroundColor: '#FFFFFF' },
  screenLayoutWide: { flexDirection: 'row' },
  mainContainer: { flex: 1, minWidth: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 17, paddingTop: 13 },
  topBar: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: 9, marginBottom: 8 },
  backButtonTop: { minWidth: 125, paddingVertical: 8 },
  backText: { color: theme.colors.primary, fontWeight: '700', fontSize: 12 },
  brand: { color: theme.colors.primary, fontWeight: '900', letterSpacing: 1.6, fontSize: 13 },
  cartButton: { width: 40, height: 38, borderRadius: 9, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  cartButtonText: { fontSize: 17 },
  topBarSpacer: { width: 125 },
  detailsScroll: { flex: 1, minHeight: 0 },
  contentContainer: { paddingBottom: 26 },
  productHero: { width: '100%' },
  productHeroWide: { flexDirection: 'row', alignItems: 'flex-start', gap: 24, paddingTop: 10 },
  image: { width: '100%', height: 285, backgroundColor: '#F7F6F3', borderRadius: 10 },
  imageWide: { width: '43%', height: 410 },
  content: { paddingVertical: 18, paddingHorizontal: 4, flex: 1, minWidth: 0 },
  category: { color: theme.colors.secondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5 },
  title: { color: theme.colors.primary, fontSize: 25, lineHeight: 31, fontWeight: '800', marginTop: 9 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 13 },
  rating: { color: theme.colors.accent, fontWeight: '800' },
  stock: { color: theme.colors.success, fontSize: 12 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 23 },
  price: { fontSize: 27, fontWeight: '900', color: theme.colors.primary },
  originalPrice: { textDecorationLine: 'line-through', color: theme.colors.secondary, fontSize: 12 },
  discount: { color: theme.colors.success, fontWeight: '800', fontSize: 12, marginTop: 3 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 22 },
  addButton: { flexGrow: 1, flexBasis: 145, backgroundColor: '#FFFFFF', borderColor: theme.colors.primary, borderWidth: 1, padding: 15, borderRadius: 9, alignItems: 'center' },
  addButtonText: { color: theme.colors.primary, fontWeight: '900', letterSpacing: 0.6, fontSize: 10 },
  buyButton: { flexGrow: 1, flexBasis: 145, backgroundColor: theme.colors.primary, padding: 15, borderRadius: 9, alignItems: 'center' },
  buyButtonText: { color: '#FFFFFF', fontWeight: '900', letterSpacing: 0.6, fontSize: 10 },
  actionHint: { color: theme.colors.secondary, fontSize: 10, lineHeight: 15, marginTop: 9 },
  descriptionSection: { paddingHorizontal: 4 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 19 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.primary },
  description: { fontSize: 14, color: theme.colors.secondary, lineHeight: 22, marginTop: 10 },
  detailsBox: { marginTop: 22, padding: 15, backgroundColor: theme.colors.background, borderRadius: 10, gap: 9 },
  detail: { fontSize: 13, color: theme.colors.primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: theme.colors.danger, textAlign: 'center', lineHeight: 21 },
  backButton: { padding: 15, marginTop: 10, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8 },
});
