import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from "react-native";
import { ListItem, Avatar, SearchBar } from "@rneui/themed";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "../firebase";
import EditProduct from "./EditProduct";

const ProductDetail = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    fetchStockData();
  }, []);

  const onUpdate = () => {
    fetchStockData();
  };

  const fetchStockData = async () => {
    try {
      const db = getFirestore(app);
      const stockCollection = collection(db, "stocks");
      const stockSnapshot = await getDocs(stockCollection);
      const stocks = [];
      stockSnapshot.forEach((doc) => {
        stocks.push({ id: doc.id, ...doc.data() });
      });
      setStockData(stocks);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching stock data:", error);
    }
  };

  const onRefresh = () => {
    setLoading(true);
    fetchStockData();
  };

  const handleStockPress = (stock) => {
    setSelectedStock(stock);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedStock(null);
    setModalVisible(false);
  };

  const filteredStockData = stockData.filter((stock) =>
    stock.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    >
      <SearchBar
        placeholder="Search"
        value={searchText}
        onChangeText={setSearchText}
        lightTheme
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInputContainer}
      />

      {filteredStockData.map((stock, index) => (
        <TouchableOpacity key={index} onPress={() => handleStockPress(stock)}>
          <ListItem bottomDivider>
            {stock.imageUrl ? (
              <Avatar
                rounded
                source={{ uri: stock.imageUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Avatar
                rounded
                icon={{ name: "image", type: "font-awesome", color: "gray" }}
                style={styles.avatarImagePlaceholder}
              />
            )}
            <ListItem.Content>
              <ListItem.Title
                style={styles.stockName}
              >{`Name: ${stock.name}`}</ListItem.Title>
              <ListItem.Subtitle
                style={styles.stockSubtitle}
              >{`Product Code: ${stock.productCode}`}</ListItem.Subtitle>
              <ListItem.Subtitle
                style={styles.stockSubtitle}
              >{`Sales Price: ${stock.salesPrice} Bath`}</ListItem.Subtitle>
              <ListItem.Subtitle
                style={styles.stockSubtitle}
              >{`Description: ${stock.description}`}</ListItem.Subtitle>
            </ListItem.Content>
            <View style={styles.quantityContainer}>
              <ListItem.Title style={styles.quantityText}>
                {stock.quantity}
              </ListItem.Title>
            </View>
            <ListItem.Chevron color="gray" />
          </ListItem>
        </TouchableOpacity>
      ))}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Product</Text>
            {selectedStock && (
              <EditProduct
                selectedStock={selectedStock}
                onCloseModal={closeModal}
                onUpdate={onUpdate}
              />
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    backgroundColor: "#fff",
    borderBottomColor: "#fff",
    borderTopColor: "#fff",
  },
  searchBarInputContainer: {
    backgroundColor: "#f2f2f2",
  },
  avatarImage: {
    width: 85,
    height: 85,
  },
  avatarImagePlaceholder: {
    width: 85,
    height: 85,
    backgroundColor: "#f2f2f2",
    borderRadius: 15,
  },
  stockName: {
    fontSize: 17,
    color: "#3695e0",
    fontWeight: "bold",
  },
  stockSubtitle: {
    paddingTop: 4,
    fontSize: 14,
  },
  quantityContainer: {
    backgroundColor: "#3695e0",
    borderRadius: 30,
    width: 40,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontSize: 13,
    color: "#f2f2f2",
    fontWeight: "bold",
  },
  modalContainer: {
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#000000aa",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    margin: 50,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3695e0",
    textAlign: "center",
    marginTop: 20,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#3695e0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ProductDetail;
