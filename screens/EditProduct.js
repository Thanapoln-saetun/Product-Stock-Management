import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Input, Button, Image } from 'react-native-elements';
import InputSpinner from 'react-native-input-spinner';
import { getFirestore, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import app from '../firebase';
import * as ImagePicker from 'expo-image-picker';

const EditProduct = ({ selectedStock, onCloseModal, onUpdate }) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [resetImage, setResetImage] = useState(false);
  const storage = getStorage(app);
  const [productCode, setProductCode] = useState(selectedStock.productCode);
  const [name, setName] = useState(selectedStock.name);
  const [description, setDescription] = useState(selectedStock.description);
  const [quantity, setQuantity] = useState(selectedStock.quantity);
  const [salesPrice, setSalesPrice] = useState(selectedStock.salesPrice);
  const [imageUrl, setImageUrl] = useState(selectedStock.imageUrl);

  const handleDelete = () => {
    try {
      const db = getFirestore(app);
      const stockDocRef = doc(db, 'stocks', selectedStock.id);
      deleteDoc(stockDocRef);
      console.log('Stock deleted successfully');
      onCloseModal();
      onUpdate();
    } catch (error) {
      console.log('Error deleting stock:', error);
    }
  };

  const handleUpdate = async () => {
    if (!productCode || !name || !quantity || !salesPrice) {
      alert('Please complete all fields marked with *');
      return;
  }
  if (!/^\d+$/.test(productCode)) {
      alert('Product Code is a number only.');
      return;
  }
    try {
      const db = getFirestore(app);
      const stockDocRef = doc(db, 'stocks', selectedStock.id);
      await updateDoc(stockDocRef, {
        productCode,
        name,
        description,
        quantity,
        salesPrice,
        imageUrl,
      });
      console.log('Stock updated successfully');
      onCloseModal();
      onUpdate();
    } catch (error) {
      console.log('Error updating stock:', error);
    }
  };

  const resetForm = () => {
    setProductCode(selectedStock.productCode);
    setName(selectedStock.name);
    setDescription(selectedStock.description);
    setQuantity(selectedStock.quantity);
    setSalesPrice(selectedStock.salesPrice);
    setImageUrl(selectedStock.imageUrl);
    setResetImage(true);
  };

  const getImageUrl = async (imagePath) => {
    try {
      const storageRef = ref(storage, imagePath);
      const url = await getDownloadURL(storageRef);
      console.log('Image URL:', url);
      setImageUrl(url);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดาวน์โหลดภาพ:', error);
    }
  };

  const uploadImage = async (imageUri, imageName) => {
    try {
      const storageRef = ref(storage, `images/${imageName}`);
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const snapshot = await uploadBytes(storageRef, blob);
      console.log('Uploaded image successfully');
      getImageUrl(snapshot.ref.fullPath);

    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ:', error);
    }
  };

  const handleButtonPressuploadImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      console.log('Permission to access camera roll is required!');
      return;
    }
  
    const imagePickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: false, 
    });
  
    if (imagePickerResult.cancelled === true) {
      console.log('Image picking was cancelled');
      return;
    }
  
    const { uri } = imagePickerResult;
    const imageName = uri.substring(uri.lastIndexOf('/') + 1);
    uploadImage(uri, imageName);
    setUploadedImage(uri);
  };
  

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 12 }}>Product Code*</Text>
      <Input placeholder="Input Product Code*" value={productCode} onChangeText={setProductCode} style={{ marginTop: -5 }} />
      <Text style={{ fontSize: 12, marginTop: -10 }}>Name*</Text>
      <Input placeholder="Input Name*" value={name} onChangeText={setName} style={{ marginTop: -5 }} />
      <Text style={{ fontSize: 12, marginTop: -10 }}>Product Code*</Text>
      <Input placeholder="Input Description" value={description} onChangeText={setDescription} style={{ marginTop: -5 }} />
      <View>
        <Text style={{ fontSize: 12, alignSelf: 'center', marginTop: -10 }}>Quantity*</Text>

        <InputSpinner placeholder="Input Quantity*" value={quantity} onChange={setQuantity} />
      </View>
      <View style={{ marginTop: 5 }}>
        <Text style={{ fontSize: 12, alignSelf: 'center' }}>Sales Price*</Text>
        <InputSpinner placeholder="Input Sales Price* (THB)" value={salesPrice} onChange={setSalesPrice} />
      </View>
      {selectedStock.imageUrl && !uploadedImage && (
        <View style={{ marginTop: 10 }}>
          <Image
            source={{ uri: selectedStock.imageUrl }}
            style={{
              width: 220,
              height: 150,
              alignSelf: 'center',
              borderRadius: 10,
            }}
            containerStyle={{ marginLeft: 'auto', marginRight: 'auto' }}
          />
        </View>
      )}
      {uploadedImage && !resetImage && (
        <View style={{ marginTop: 10 }}>
          <Image
            source={{ uri: uploadedImage }}
            style={{
              width: 220,
              height: 150,
              alignSelf: 'center',
              borderRadius: 10,
            }}
            containerStyle={{ marginLeft: 'auto', marginRight: 'auto' }}
          />
        </View>
      )}
      {resetImage && (
        <View style={{ marginTop: 10 }}>
          <Image
            source={{ uri: selectedStock.imageUrl }}
            style={{
              width: 220,
              height: 150,
              alignSelf: 'center',
              borderRadius: 10,
            }}
            containerStyle={{ marginLeft: 'auto', marginRight: 'auto' }}
          />
        </View>
      )}
      <View style={styles.viewbutton}>
        <Button title="Upload Image" onPress={handleButtonPressuploadImage} buttonStyle={{ backgroundColor: 'green' }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button title="Delete" onPress={handleDelete} buttonStyle={{ backgroundColor: 'red' }} style={{ width: 120 }} />
        <Button title="Update" onPress={handleUpdate} style={{ width: 120 }} />
      </View>
      <View style={{ alignItems: 'center' }}>
        <Button
          title="Reset Form"
          type="clear"
          titleStyle={{ fontSize: 12, color: 'gray', textDecorationLine: 'underline' }}
          onPress={resetForm}
        />
      </View>
    </View>
  );
};
const theme = {
  Button: {
    raised: true,
  },
};
const styles = StyleSheet.create({
  container: {
    paddingRight: 15,
    paddingLeft: 15,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  viewbutton: {
    paddingTop: 10,
    paddingBottom: 10,
  },
});

export default EditProduct;
