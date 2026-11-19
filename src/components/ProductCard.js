import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../styles/theme';
import { formatBRL } from '../utils/currency';

export default function ProductCard({ product, onPress, onAddToCart, onBuyNow }) {
  const discount = Number(product.discountPercentage || 0);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Ver detalhes de ${product.title}`}>
        <View style={styles.imageFrame}>
          <Image source={{ uri: product.thumbnail || product.images?.[0] }} style={styles.image} resizeMode="contain" />
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
          <Text style={styles.category} numberOfLines={1}>{product.category}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatBRL(product.price)}</Text>
            {discount > 0 ? <Text style={styles.discount}>{discount.toFixed(0)}% OFF</Text> : null}
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.addButton} onPress={onAddToCart} activeOpacity={0.85}>
          <Text style={styles.addButtonText}>ADICIONAR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyButton} onPress={onBuyNow} activeOpacity={0.85}>
          <Text style={styles.buyButtonText}>COMPRAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 0, marginBottom: 14, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  imageFrame: { width: '100%', height: 150, padding: 9, backgroundColor: '#F7F6F3', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  info: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 8 },
  title: { fontSize: 12, lineHeight: 17, fontWeight: '700', color: theme.colors.primary, minHeight: 34 },
  category: { fontSize: 9, color: theme.colors.secondary, marginTop: 4, textTransform: 'capitalize' },
  priceRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7, marginTop: 7 },
  price: { fontSize: 14, fontWeight: '800', color: theme.colors.primary },
  discount: { fontSize: 9, color: theme.colors.success, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 6, paddingHorizontal: 8, paddingBottom: 9 },
  addButton: { flex: 1, backgroundColor: '#FFFFFF', borderColor: theme.colors.primary, borderWidth: 1, borderRadius: 7, paddingVertical: 9, alignItems: 'center' },
  addButtonText: { color: theme.colors.primary, fontSize: 8, fontWeight: '900', letterSpacing: 0.3 },
  buyButton: { flex: 1, backgroundColor: theme.colors.primary, borderRadius: 7, paddingVertical: 9, alignItems: 'center' },
  buyButtonText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900', letterSpacing: 0.3 },
});
