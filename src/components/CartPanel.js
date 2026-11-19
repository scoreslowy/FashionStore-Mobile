import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} from '../store/cartSlice';
import theme from '../styles/theme';
import { formatBRL } from '../utils/currency';

function CartContents({ onClose, showCloseButton = true }) {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  return (
    <View style={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sua sacola</Text>
          <Text style={styles.subtitle}>{count} {count === 1 ? 'item' : 'itens'}</Text>
        </View>
        {showCloseButton ? (
          <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Fechar carrinho">
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyIcon}>🛍</Text>
          <Text style={styles.emptyTitle}>Sua sacola está vazia</Text>
          <Text style={styles.emptyText}>Explore a coleção e adicione seus favoritos.</Text>
        </View>
      ) : (
        <>
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {items.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image source={{ uri: item.thumbnail }} style={styles.image} resizeMode="contain" />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.itemPrice}>{formatBRL(item.price)}</Text>
                  <View style={styles.quantityRow}>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => dispatch(decreaseQuantity(item.id))}>
                      <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => dispatch(increaseQuantity(item.id))}>
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => dispatch(removeFromCart(item.id))}>
                      <Text style={styles.removeText}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatBRL(total)}</Text>
            </View>
            <Text style={styles.note}>Frete e pagamento não incluídos.</Text>
            {checkoutMessage ? <Text style={styles.checkoutMessage}>{checkoutMessage}</Text> : null}
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => setCheckoutMessage('.')}
            >
              <Text style={styles.checkoutButtonText}>CONTINUAR PARA COMPRA</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={() => { dispatch(clearCart()); setCheckoutMessage(''); }}>
              <Text style={styles.clearText}>Esvaziar sacola</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

export default function CartPanel({ variant = 'modal', visible = false, onClose }) {
  if (variant === 'sidebar') {
    return (
      <View style={styles.sidebar}>
        <CartContents showCloseButton={false} />
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.drawer}>
          <CartContents onClose={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 330,
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
    height: '100%',
    paddingHorizontal: 17,
    paddingTop: 25,
    paddingBottom: 20,
  },
  content: { flex: 1, minHeight: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { color: theme.colors.primary, fontSize: 21, fontWeight: '900' },
  subtitle: { color: theme.colors.secondary, fontSize: 11, marginTop: 4 },
  closeButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.colors.muted, alignItems: 'center', justifyContent: 'center' },
  closeButtonText: { fontSize: 14, color: theme.colors.primary, fontWeight: '800' },
  emptyCart: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  emptyIcon: { fontSize: 38, marginBottom: 12 },
  emptyTitle: { color: theme.colors.primary, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  emptyText: { color: theme.colors.secondary, fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 8 },
  list: { flex: 1, minHeight: 0 },
  cartItem: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, padding: 8, marginBottom: 9 },
  image: { width: 68, height: 78, backgroundColor: '#F7F6F3', borderRadius: 7 },
  itemInfo: { flex: 1, paddingLeft: 10, justifyContent: 'center', minWidth: 0 },
  itemTitle: { color: theme.colors.primary, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  itemPrice: { color: theme.colors.accent, fontSize: 13, fontWeight: '900', marginTop: 4 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  quantityButton: { width: 24, height: 24, borderRadius: 6, backgroundColor: theme.colors.muted, alignItems: 'center', justifyContent: 'center' },
  quantityButtonText: { color: theme.colors.primary, fontSize: 17, fontWeight: '700', lineHeight: 20 },
  quantityText: { color: theme.colors.primary, fontWeight: '800', fontSize: 11 },
  removeText: { color: theme.colors.danger, fontSize: 10, fontWeight: '700', marginLeft: 5 },
  footer: { borderTopWidth: 1, borderColor: theme.colors.border, paddingTop: 14, marginTop: 9 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: theme.colors.secondary, fontSize: 12, fontWeight: '700' },
  totalValue: { color: theme.colors.primary, fontSize: 19, fontWeight: '900' },
  note: { color: theme.colors.secondary, fontSize: 10, marginTop: 6, lineHeight: 14 },
  checkoutMessage: { color: theme.colors.success, fontSize: 10, lineHeight: 15, marginTop: 8 },
  checkoutButton: { backgroundColor: theme.colors.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  checkoutButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  clearButton: { alignItems: 'center', padding: 10 },
  clearText: { color: theme.colors.secondary, fontSize: 10, fontWeight: '700' },
  modalRoot: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.35)' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  drawer: { marginLeft: 'auto', width: '90%', maxWidth: 420, height: '100%', backgroundColor: theme.colors.background, paddingTop: 48, paddingHorizontal: 17, paddingBottom: 20 },
});
