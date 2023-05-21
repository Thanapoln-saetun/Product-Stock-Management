import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import ColorfulCard from "react-native-colorful-card";
import { TabView, TabBar } from 'react-native-tab-view';
import { ListItem, Avatar } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from '../firebase';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

const Dashboard = () => {
    const navigation = useNavigation();
    const [index, setIndex] = useState(0);
    const [stockData, setStockData] = useState([]);
    const [stockInTotal, setStockInTotal] = useState(0);
    const [priceTotalStockIn, setPriceTotalStockIn] = useState(0);
    const [quantityTotal, setQuantityTotal] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [stockOutTotal, setStockOutTotal] = useState(0);
    const [priceTotalStockOut, setPriceTotalStockOut] = useState(0);
    useEffect(() => {
        fetchStockData();
    }, []);
    const fetchStockData = async () => {
        try {
            const db = getFirestore(app);
            const stockCollection = collection(db, 'stocks');
            const stockSnapshot = await getDocs(stockCollection);
            const stocks = [];
            let totalStockIn = 0;
            let totalPriceStockIn = 0;
            let totalQuantity = 0;
            let totalPrice = 0;
            let totalStockOut = 0;
            let totalPriceStockOut = 0;
            stockSnapshot.forEach((doc) => {
                const stock = { id: doc.id, ...doc.data() };
                stocks.push(stock);
                totalStockIn += stock.stockIn ? stock.stockIn : 0;
                totalPriceStockIn += stock.priceTotalStockIn ? stock.priceTotalStockIn : 0;
                totalQuantity += stock.quantity ? stock.quantity : 0;
                totalPrice += stock.totalPrice ? stock.totalPrice : 0;
                totalStockOut += stock.stockOut ? stock.stockOut : 0;
                totalPriceStockOut += stock.priceTotalStockOut ? stock.priceTotalStockOut : 0;
            });
            setPriceTotalStockIn(totalPriceStockIn);
            setPriceTotalStockOut(totalPriceStockOut);
            setTotalPrice(totalPrice);
            setStockData(stocks);
            setStockInTotal(totalStockIn);
            setQuantityTotal(totalQuantity);
            setRefreshing(false);
            setStockOutTotal(totalStockOut);
        } catch (error) {
            console.log('Error fetching stock data:', error);
        }
    };
    const onRefresh = () => {
        setRefreshing(true);
        fetchStockData();
    };
    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'activity':
                const sortedStocks = stockData
                    .filter(stock => stock.timeStampUpdatedStock)
                    .sort((a, b) => b.timeStampUpdatedStock.toDate() - a.timeStampUpdatedStock.toDate())
                    .slice(0, 4);
                return (
                    <View>
                        {sortedStocks.map(stock => (
                            stock.stockStatus === 'outStock' ? (
                                <TouchableOpacity onPress={() => navigation.navigate('StockOut')}>
                                    <ListItem key={stock.id} bottomDivider>
                                        {stock.imageUrl ? (
                                            <Avatar rounded source={{ uri: stock.imageUrl }} />
                                        ) : (
                                            <Avatar
                                                rounded
                                                icon={{ name: 'image', color: 'gray', type: 'font-awesome' }}
                                                containerStyle={{ backgroundColor: '#f2f2f2' }}
                                            />
                                        )}
                                        <ListItem.Content>
                                            <ListItem.Title>
                                                {stock.name}
                                                <Text style={{ color: 'green' }}> {stock.salesPrice}฿</Text>
                                            </ListItem.Title>
                                            <ListItem.Subtitle style={{ color: '#808080' }}>
                                                {stock.timeStampUpdatedStock
                                                    ? moment(stock.timeStampUpdatedStock.toDate()).format('llll')
                                                    : ''}
                                            </ListItem.Subtitle>
                                        </ListItem.Content>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <View style={{ paddingRight: 10 }}>
                                                <View style={{ width: 60, height: 25, backgroundColor: '#fee3e4', borderRadius: 5, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                                    <Ionicons name="caret-down" size={18} color="#f70c16" />
                                                    <Text style={{ color: '#f70c16' }}>{stock.amountOut}</Text>
                                                </View>
                                            </View>
                                            <View style={{ width: 25, height: 25, backgroundColor: '#dedede', borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
                                                <Ionicons name="remove" size={18} color="#808080" />
                                            </View>
                                        </View>
                                    </ListItem>
                                </TouchableOpacity>
                            ) : stock.stockStatus === 'inStock' ? (
                                <TouchableOpacity onPress={() => navigation.navigate('StockIn')}>
                                    <ListItem key={stock.id} bottomDivider>
                                        {stock.imageUrl ? (
                                            <Avatar rounded source={{ uri: stock.imageUrl }} />
                                        ) : (
                                            <Avatar
                                                rounded
                                                icon={{ name: 'image', color: 'gray', type: 'font-awesome' }}
                                                containerStyle={{ backgroundColor: '#f2f2f2' }}
                                            />
                                        )}
                                        <ListItem.Content>
                                            <ListItem.Title>
                                                {stock.name}
                                                <Text style={{ color: 'green' }}> {stock.salesPrice}฿</Text>
                                            </ListItem.Title>
                                            <ListItem.Subtitle style={{ color: '#808080' }}>
                                                {stock.timeStampUpdatedStock
                                                    ? moment(stock.timeStampUpdatedStock.toDate()).format('llll')
                                                    : ''}
                                            </ListItem.Subtitle>
                                        </ListItem.Content>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <View style={{ paddingRight: 10 }}>
                                                <View style={{ width: 60, height: 25, backgroundColor: '#dce6da', borderRadius: 5, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                                    <Ionicons name="caret-up" size={18} color="#027f00" />
                                                    <Text style={{ color: '#027f00' }}>{stock.amountIn}</Text>
                                                </View>
                                            </View>
                                            <View style={{ width: 25, height: 25, backgroundColor: '#dedede', borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
                                                <Ionicons name="add" size={18} color="#808080" />
                                            </View>
                                        </View>
                                    </ListItem>
                                </TouchableOpacity>
                            ) : null
                        ))}

                    </View>
                );
            case 'new':
                const sortedNewStocks = stockData
                    .filter(stock => stock.timeStampProduct)
                    .sort((a, b) => b.timeStampProduct.toDate() - a.timeStampProduct.toDate())
                    .slice(0, 4);
                return (
                    <>
                        {sortedNewStocks.map(stock => (
                            <TouchableOpacity onPress={() => navigation.navigate('StockIn')}>
                                <ListItem key={stock.id} bottomDivider>
                                    {stock.imageUrl ? (
                                        <Avatar rounded source={{ uri: stock.imageUrl }} />
                                    ) : (
                                        <Avatar
                                            rounded
                                            icon={{ name: 'image', color: 'gray', type: 'font-awesome' }}
                                            containerStyle={{ backgroundColor: '#f2f2f2' }}
                                        />
                                    )}
                                    <ListItem.Content>
                                        <ListItem.Title>
                                            {stock.name}
                                            <Text style={{ color: 'green' }}> {stock.salesPrice}฿</Text>
                                        </ListItem.Title>
                                        <ListItem.Subtitle style={{ color: '#808080' }}>
                                            <Text style={{ color: 'gray' }}>{stock.description}</Text>
                                        </ListItem.Subtitle>
                                    </ListItem.Content>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View style={{ paddingRight: 10 }}>
                                            {stock.quantity === 0 ? (
                                                <View style={{ width: 80, height: 25, backgroundColor: '#fee3e4', borderRadius: 5, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                                    <Text style={{ color: '#f70c16' }}>Stock Out</Text>
                                                </View>) : (
                                                <View style={{ width: 80, height: 25, backgroundColor: '#d5e9f8', borderRadius: 5, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                                    <Text style={{ color: '#3695e0' }}>{stock.quantity}</Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={{ width: 25, height: 25, backgroundColor: '#dedede', borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
                                            <Ionicons name="add" size={18} color="#808080" />
                                        </View>
                                    </View>
                                </ListItem>
                            </TouchableOpacity>
                        ))}
                    </>
                );
            case 'out':
                const filteredOutStocks = stockData.filter(stock => stock.quantity < 5);
                const sortedOutStocks = filteredOutStocks.sort((a, b) => a.quantity - b.quantity);
                return (
                    <View>
                        {sortedOutStocks.map(stock => (
                            <TouchableOpacity onPress={() => navigation.navigate('StockIn')}>
                                <ListItem key={stock.id} bottomDivider>
                                    {stock.imageUrl ? (
                                        <Avatar rounded source={{ uri: stock.imageUrl }} />
                                    ) : (
                                        <Avatar
                                            rounded
                                            icon={{ name: 'image', color: 'gray', type: 'font-awesome' }}
                                            containerStyle={{ backgroundColor: '#f2f2f2' }}
                                        />
                                    )}
                                    <ListItem.Content>
                                        <ListItem.Title>
                                            {stock.name}
                                            <Text style={{ color: 'green' }}> {stock.salesPrice}฿</Text>
                                        </ListItem.Title>
                                        <ListItem.Subtitle style={{ color: '#808080' }}>
                                            <Text style={{ color: 'gray' }}>{stock.description}</Text>
                                        </ListItem.Subtitle>
                                    </ListItem.Content>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View style={{ paddingRight: 10 }}>
                                            <View style={{ width: 80, height: 25, backgroundColor: '#fee3e4', borderRadius: 5, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                                {stock.quantity === 0 ? (
                                                    <Text style={{ color: '#f70c16' }}>Stock Out</Text>
                                                ) : (
                                                    <Text style={{ color: '#f70c16' }}>{stock.quantity}</Text>
                                                )}
                                            </View>
                                        </View>
                                        <View style={{ width: 25, height: 25, backgroundColor: '#dedede', borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
                                            <Ionicons name="add" size={18} color="#808080" />
                                        </View>
                                    </View>
                                </ListItem>
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            default:
                return null;
        }
    };
    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={{ padding: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <ColorfulCard
                        title="Stock In"
                        value={stockInTotal || 0}
                        valuePostfix="Items"
                        footerTitle={priceTotalStockIn ? `Total ${priceTotalStockIn} Bath` : 0 + ' Bath'}
                        footerValue="for month"
                        iconImageSource={require("../assets/arrow.png")}
                        style={{ backgroundColor: "#027f00", height: 168 }}
                        onPress={() => navigation.navigate('StockIn')}
                    />
                    <ColorfulCard
                        title="Stock Out"
                        value={stockOutTotal || 0}
                        valuePostfix="Items"
                        footerTitle={priceTotalStockOut ? `Total ${priceTotalStockOut} Bath` : 0 + ' Bath'}
                        footerValue="for month"
                        style={{ backgroundColor: "#f70c16", height: 168 }}
                        iconImageSource={require("../assets/drow.png")}
                        onPress={() => navigation.navigate('StockOut')}
                    />
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingLeft: 12, paddingRight: 12 }}>
                    <ColorfulCard
                        title="Total Stock"
                        value={quantityTotal ? `${quantityTotal} Items` : 0}
                        footerTitle={totalPrice ? `Total ${totalPrice} Bath` : 0}
                        footerValue="for all"
                        iconImageSource={require("../assets/boxes.png")}
                        style={{ backgroundColor: "#3695e0", width: '100%', height: 168 }}
                        onPress={() => navigation.navigate('StockDetail')}
                    />
                </View>
                <TabView
                    navigationState={{ index, routes: [{ key: 'activity', title: 'Activity log' }, { key: 'new', title: 'New product' }, { key: 'out', title: 'Out of Stock' }] }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: 100 }}
                    renderTabBar={props => (
                        <TabBar
                            {...props}
                            style={{ backgroundColor: 'white' }}
                            labelStyle={{ fontSize: 12, color: '#3695e0' }}
                            indicatorStyle={{ backgroundColor: '#3695e0' }}
                        />
                    )}
                />
            </ScrollView>
        </View>
    );
};

export default Dashboard;
