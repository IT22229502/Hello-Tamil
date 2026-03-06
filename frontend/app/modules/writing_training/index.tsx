import React, { useState } from "react";
import { View, Text, Button, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { analyzeImage } from "@/services/writingService";
import { useRouter } from "expo-router";

export default function WritingTraining() {

  const router = useRouter();

  const [image, setImage] = useState<string | null>(null);

  /* PICK IMAGE FROM GALLERY */

  const pickImage = async () => {

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow gallery access."
      );
      return;
    }

    const pickerResult =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1
      });

    if (!pickerResult.canceled) {
      setImage(pickerResult.assets[0].uri);
    }

  };

  /* TAKE PHOTO */

  const takePhoto = async () => {

    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Camera permission required");
      return;
    }

    try {

      const cameraResult =
        await ImagePicker.launchCameraAsync({
          quality: 1
        });

      if (!cameraResult.canceled) {
        setImage(cameraResult.assets[0].uri);
      }

    } catch (error) {
      console.log("Camera Error:", error);
    }

  };

  /* SEND IMAGE TO BACKEND */

  const uploadImage = async () => {

    if (!image) {
      Alert.alert("Please select an image first");
      return;
    }

    try {

      const data = await analyzeImage(image);

      /* NAVIGATE TO RESULT SCREEN */

      router.push({
        pathname: "/modules/writing_training/ResultScreen",
        params: {
          result: JSON.stringify(data),
          originalImage: image
        }
      });

    } catch (error) {

      console.log("Upload Error:", error);

      Alert.alert(
        "Error",
        "Failed to analyze image."
      );

    }

  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Spatial Model Evaluation
      </Text>

      <View style={styles.buttons}>

        <Button
          title="Pick Image"
          onPress={pickImage}
        />

        <Button
          title="Take Photo"
          onPress={takePhoto}
        />

      </View>

      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
        />
      )}

      <Button
        title="Upload to Models"
        onPress={uploadImage}
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF9E6"
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center"
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20
  },

  image: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginBottom: 20
  }

});