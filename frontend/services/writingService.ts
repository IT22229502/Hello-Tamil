import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";

/*
Change this if using real device
Example:
http://192.168.1.3:3000
*/

const API_URL = "http://192.168.1.3:3000";

/* ============================= */
/* Activity 1 : Image Upload     */
/* ============================= */

export const analyzeImage = async (imageUri: string) => {

  try {

    if (!imageUri) {
      throw new Error("No image URI provided");
    }

    /* Ensure URI format */

    let fileUri = imageUri;

    if (!imageUri.startsWith("file://")) {
      fileUri = `file://${imageUri}`;
    }

    /* Check if file exists */

    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (!fileInfo.exists) {
      throw new Error("Image file not found");
    }

    /* Convert image to base64 */

    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'base64',
    });

    /* Send to backend */

    const response = await axios.post(
      `${API_URL}/writing/analyze-image`,
      {
        image: base64,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    return response.data;

  } catch (error) {

    console.error("Analyze Image Error:", error);

    throw error;
  }
};


/* ============================= */
/* Activity 2 : Canvas Drawing   */
/* ============================= */

export const analyzeDrawing = async (drawingBase64: string) => {

  try {

    if (!drawingBase64) {
      throw new Error("No drawing data provided");
    }

    const response = await axios.post(
      `${API_URL}/writing/analyze-drawing`,
      {
        drawing: drawingBase64,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    return response.data;

  } catch (error) {

    console.error("Analyze Drawing Error:", error);

    throw error;

  }
};