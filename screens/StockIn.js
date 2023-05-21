import React, { useState, useEffect } from 'react';
import { SearchBar } from '@rneui/themed';
import { View, Text, Image, TouchableOpacity, FlatList, RefreshControl, Modal } from 'react-native';
import { getFirestore, collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import app from '../firebase';
import {  Avatar } from '@rneui/themed';
import InputSpinner from 'react-native-input-spinner';
import { styles } from './StylesStock';
import { Ionicons } from '@expo/vector-icons';

const StockIn = () => {
  const [searchText, setSearchText] = useState('');
  const [filteredStockData, setFilteredStockData] = useState([]);
  const [amount, setAmount] = useState(0);
  const [selectedStock, setSelectedStock] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const closeModal = () => {
    setSelectedStock(null);
    setModalVisible(false);
    setAmount(0);
  };
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStockData();
    setRefreshing(false);
  };
  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      const db = getFirestore(app);
      const querySnapshot = await getDocs(collection(db, 'stocks'));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStockData(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const addStock = async () => {
    try {
      const db = getFirestore(app);
      const stockRef = doc(db, 'stocks', selectedStock.id);
      const newStockIn = (selectedStock.stockOut || 0) + amount; // เพิ่มค่า amount เข้าไปใน stockIn
      const TotalPrice = selectedStock.salesPrice * (selectedStock.quantity + amount);
      await updateDoc(stockRef, {
        stockStatus: 'inStock',
        stockIn: newStockIn,
        amountIn: amount,
        priceTotalStockIn: selectedStock.salesPrice * (newStockIn),
        totalPrice: TotalPrice,
        quantity: selectedStock.quantity + amount,
        timeStampUpdatedStock: serverTimestamp(),

      });
      setSelectedStock(null);
      setModalVisible(false);
      setAmount(0);

      handleRefresh();
    } catch (error) {
      console.log(error);
    }
  };

  const renderProductItem = ({ item }) => (
    <ProductCard item={item} setSelectedStock={setSelectedStock} setModalVisible={setModalVisible} />
  );
  const handleSearch = (text) => {
    setSearchText(text);
    const filteredData = stockData.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredStockData(filteredData);
  };

  useEffect(() => {
    if (searchText === '') {
      setFilteredStockData(stockData);
    } else {
      handleSearch(searchText);
    }
  }, [searchText, stockData]);

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search"
        value={searchText}
        onChangeText={handleSearch}
        lightTheme
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInputContainer}
      />
      <FlatList
        data={filteredStockData}
        style={styles.productList}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Stock</Text>
            {selectedStock && (
              <>
                <View >
                  <Image source={{ uri: selectedStock.imageUrl }} style={styles.modalProductImage} />
                  <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>{selectedStock.name}</Text>
                    <Text style={styles.productPrice}>
                      {selectedStock.salesPrice} THB
                    </Text>
                  </View>
                  <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 10 }}>
                    <Text style={styles.productPriceText}>Description : {selectedStock.description}</Text>
                  </View>
                </View>
                <View style={{ backgroundColor: '#3695e0', marginHorizontal: 20, marginTop: 20, borderRadius: 10, }}>
                  <View style={{ alignItems: 'center', paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>Quantity</Text>
                    <View style={{ backgroundColor: '#fff', borderRadius: 10, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 80, paddingRight: 80, paddingTop: 10, paddingBottom: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000', alignContent: 'center' }}> {selectedStock.quantity + amount} </Text>
                    </View>
                    <View style={{ paddingBottom: 10 }} />
                    <InputSpinner
                      value={amount}
                      onChange={(num) => setAmount(num)}
                      style={styles.modalAmountInput}
                      inputStyle={styles.modalAmountInputText}
                      buttonStyle={styles.modalAmountButton}
                      buttonPressStyle={styles.modalAmountButtonPress}
                      buttonTextColor={'#fff'}
                    />
                  </View>
                </View>
                <TouchableOpacity style={styles.modalAddButton} onPress={addStock}>
                  <Text style={styles.modalAddButtonText}>Add Stock</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};
const ProductCard = ({ item, setModalVisible, setSelectedStock }) => {
  const handlePress = () => {
    setSelectedStock(item); 
    setModalVisible(true); 
  };
  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.productCard}>
        {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        ) : (
        <Avatar
                rounded
                icon={{ name: 'image', color: 'gray', type: 'font-awesome' }}
                style={[styles.productImage, { backgroundColor: '#f2f2f2' }]}
              />
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDescription}>{item.description}</Text>
          <Text style={styles.productPrice}>
            {item.salesPrice.toLocaleString()} ฿ <Text style={styles.productPriceText}>per item</Text>
          </Text>
        </View>
        <View style={styles.productQuantity}>
          <View style={[styles.quantityButton, { backgroundColor: '#027f00' }]}>
            <Text style={styles.quantityButtonText}>Quantity</Text>
            <View style={styles.quantityButtonTextBox}>
              { item.quantity === 0 ? (
                <Text style={{ color: 'red' ,fontSize: 13, fontWeight: 'bold'  }}>Stock Out</Text>
              ) : (
              <Text style={styles.quantityText}>{item.quantity}</Text>
              )}
            </View>
            <View style={{ paddingTop: 2 }}>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default StockIn;