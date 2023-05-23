import React, { useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { ThemeProvider, Input, Button, Image } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import app from "../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import InputSpinner from "react-native-input-spinner";

const AddProduct = ({ navigation }) => {
  const storage = getStorage(app);
  const [imageUrl, setImageUrl] = useState(null);
  const [image, setImage] = useState(null);
  const [productCode, setProductCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [salesPrice, setSalesPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setProductCode("");
    setName("");
    setDescription("");
    setQuantity(0);
    setSalesPrice(0);
    setImageUrl(null);
    setImage(null);
  };
  const db = getFirestore(app);
  const handleSave = async () => {
    if (!productCode || !name || !quantity || !salesPrice) {
      alert("Please complete all fields marked with *");
      return;
    }
    if (!/^\d+$/.test(productCode)) {
      alert("Product Code is a number only.");
      return;
    }
    const data = {
      productCode: productCode,
      name: name,
      description: description,
      quantity: quantity,
      salesPrice: salesPrice,
      imageUrl: imageUrl,
      timeStampProduct: serverTimestamp(),
      totalPrice: quantity * salesPrice,
    };
    try {
      const docRef = await addDoc(collection(db, "stocks"), data);
      resetForm();
      setIsLoading(false);
      navigation.navigate("Product Detail");
    } catch (error) {
      console.error("Error adding document:", error);
      setIsLoading(false);
    }
  };
  const getImageUrl = async (imagePath) => {
    try {
      const storageRef = ref(storage, imagePath);
      const url = await getDownloadURL(storageRef);
      console.log("Image URL:", url);
      setImageUrl(url);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดาวน์โหลดภาพ:", error);
    }
  };
  const uploadImage = async (imageUri, imageName) => {
    try {
      const storageRef = ref(storage, `images/${imageName}`);
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const snapshot = await uploadBytes(storageRef, blob);
      console.log("Uploaded image successfully");
      getImageUrl(snapshot.ref.fullPath);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ:", error);
    }
  };
  const handleButtonPress = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      console.log("Permission to access camera roll is required!");
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
      console.log("Image picking was cancelled");
      return;
    }
    const { uri } = imagePickerResult;
    const imageName = uri.substring(uri.lastIndexOf("/") + 1);
    uploadImage(uri, imageName);
  };

  return (
    <ThemeProvider theme={theme}>
      <ScrollView style={styles.container}>
        {isLoading ? (
          <ActivityIndicator size="large" color="green" />
        ) : (
          <>
            <Image
              source={{
                uri: "https://firebasestorage.googleapis.com/v0/b/stock-crud.appspot.com/o/images%2FMyorder.jpg?alt=media&token=706effc5-3a19-44f8-a0b7-f5fb4bd347e2",
              }}
              style={{
                width: 200,
                height: 200,
                alignSelf: "center",
                borderRadius: 100,
              }}
              containerStyle={{ marginLeft: "auto", marginRight: "auto" }}
            />
            <Input
              placeholder="Product Code*"
              value={productCode}
              onChangeText={(value) => setProductCode(value)}
            />
            <Input
              placeholder="Name*"
              value={name}
              onChangeText={(value) => setName(value)}
            />

            <Input
              placeholder="Description"
              value={description}
              onChangeText={(value) => setDescription(value)}
            />
            <View>
              <InputSpinner
                placeholder="Quantity*"
                value={quantity}
                onChange={(value) => {
                  setQuantity(value);
                }}
              />
            </View>
            <View style={{ marginTop: 15 }}>
              <InputSpinner
                placeholder="Sales Price* (THB)"
                value={salesPrice}
                onChange={(value) => {
                  setSalesPrice(value);
                }}
              />
            </View>
            {imageUrl && (
              <View style={{ marginTop: 20 }}>
                <Image
                  source={{ uri: imageUrl }}
                  style={{
                    width: 320,
                    height: 200,
                    alignSelf: "center",
                    borderRadius: 10,
                  }}
                  containerStyle={{ marginLeft: "auto", marginRight: "auto" }}
                />
              </View>
            )}
            <View style={styles.viewbutton}>
              <Button
                title="Upload Image"
                onPress={handleButtonPress}
                buttonStyle={{ backgroundColor: "green" }}
              />
            </View>

            <View>
              <Button title="Save" onPress={handleSave} />
            </View>
            <View style={{ alignItems: "center" }}>
              <Button
                title="Reset Form"
                type="clear"
                titleStyle={{
                  fontSize: 12,
                  color: "gray",
                  textDecorationLine: "underline",
                }}
                onPress={resetForm}
              />
            </View>
            <View style={styles.viewpading} />
          </>
        )}
      </ScrollView>
    </ThemeProvider>
  );
};
const theme = {
  Button: {
    raised: true,
  },
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 35,
    paddingTop: 15,
    backgroundColor: "#fff",
  },
  viewpading: {
    paddingBottom: 50,
  },
  viewbutton: {
    paddingTop: 20,
    paddingBottom: 10,
  },
});

export default AddProduct;
