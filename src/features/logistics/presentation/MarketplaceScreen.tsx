import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../../../components/AppHeader";
import { colors } from "../../../theme/colors";

type MarketplaceScreenProps = {
  onBack: () => void;
};

type MarketItem = {
  product: string;
  quantity: string;
  location: string;
  price: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  isSold: boolean;
  tag: string;
};

const initialItems: MarketItem[] = [
  {
    product: "Tomates Cerises",
    quantity: "500 kg",
    location: "Daloa",
    price: "450",
    icon: "eco",
    isSold: false,
    tag: "DÉMO"
  },
  {
    product: "Cacao Grade A",
    quantity: "2.5 T",
    location: "Soubre",
    price: "1500",
    icon: "agriculture",
    isSold: false,
    tag: "DÉMO"
  }
];

export function MarketplaceScreen({ onBack }: MarketplaceScreenProps) {
  const [items, setItems] = useState<MarketItem[]>(initialItems);
  const [purchaseIndex, setPurchaseIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems((current) => [
        {
          product: "Mais Jaune",
          quantity: "1.2 T",
          location: "Bouake",
          price: "275",
          icon: "grain",
          isSold: false,
          tag: "DÉMO"
        },
        ...current
      ]);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  function confirmPurchase() {
    if (purchaseIndex === null) return;
    setItems((current) =>
      current.map((item, index) => (index === purchaseIndex ? { ...item, isSold: true } : item))
    );
    setPurchaseIndex(null);
    Alert.alert("Démo locale", "Aucun paiement ni blocage de fonds n'a été effectué.");
  }

  const selectedItem = purchaseIndex === null ? null : items[purchaseIndex];

  return (
    <View style={styles.container}>
      <AppHeader title="🛍️ Marché B2B Flash" color={colors.greenMedium} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        {items.map((item, index) => (
          <MarketCard key={`${item.product}-${index}`} item={item} onBuy={() => setPurchaseIndex(index)} />
        ))}
      </ScrollView>
      <Modal transparent animationType="slide" visible={Boolean(selectedItem)} onRequestClose={() => setPurchaseIndex(null)}>
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <MaterialIcons name="security" size={50} color={colors.greenMedium} />
            <Text style={styles.sheetTitle}>Intention d'achat — démo locale</Text>
            <Text style={styles.sheetText}>Simuler une intention d'achat pour : {selectedItem?.product} ?</Text>
            <Pressable onPress={confirmPurchase} style={styles.confirmButton}>
              <Text style={styles.confirmText}>CONFIRMER LA SIMULATION</Text>
            </Pressable>
            <Pressable onPress={() => setPurchaseIndex(null)} style={styles.cancelSheetButton}>
              <Text style={styles.cancelSheetText}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MarketCard({ item, onBuy }: { item: MarketItem; onBuy: () => void }) {
  return (
    <View style={[styles.card, item.isSold && styles.soldCard]}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <MaterialIcons name={item.icon} size={24} color={colors.greenMedium} />
        </View>
        <View style={styles.itemCopy}>
          <Text style={styles.product}>{item.product}</Text>
          <Text style={styles.meta}>
            {item.location} • {item.quantity}
          </Text>
        </View>
        <View style={styles.priceWrap}>
          <Text style={styles.price}>{item.price} FCFA</Text>
          <Text style={styles.perKg}>/ kg</Text>
        </View>
      </View>
      <View style={styles.cardBottom}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>
        <Pressable disabled={item.isSold} onPress={onBuy} style={[styles.buyButton, item.isSold && styles.buyDisabled]}>
          <Text style={styles.buyText}>{item.isSold ? "VENDU" : "ACHETER"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 16,
    paddingBottom: 34
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  soldCard: {
    opacity: 0.62,
    elevation: 0
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.greenMedium}15`
  },
  itemCopy: {
    flex: 1,
    paddingHorizontal: 12
  },
  product: {
    color: colors.text,
    fontWeight: "700"
  },
  meta: {
    marginTop: 3,
    color: colors.gray
  },
  priceWrap: {
    alignItems: "flex-end"
  },
  price: {
    color: colors.greenMedium,
    fontWeight: "700"
  },
  perKg: {
    color: colors.gray,
    fontSize: 10
  },
  cardBottom: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: colors.orangeLight
  },
  tagText: {
    color: "#92400E",
    fontSize: 10,
    fontWeight: "900"
  },
  buyButton: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.greenMedium
  },
  buyDisabled: {
    backgroundColor: "#98A2B3"
  },
  buyText: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)"
  },
  sheet: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
    backgroundColor: colors.surface
  },
  sheetTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center"
  },
  sheetText: {
    marginTop: 10,
    color: colors.gray,
    textAlign: "center"
  },
  confirmButton: {
    width: "100%",
    minHeight: 50,
    marginTop: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.greenMedium
  },
  confirmText: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  cancelSheetButton: {
    minHeight: 44,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  cancelSheetText: {
    color: colors.gray,
    fontWeight: "800"
  }
});
