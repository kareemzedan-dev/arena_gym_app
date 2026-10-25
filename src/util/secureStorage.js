import * as SecureStore from 'expo-secure-store';

export class SecureStorageHelper {
  static async getAuthCredentials() {
    try {
      const id = await SecureStore.getItemAsync("id");
      const token = await SecureStore.getItemAsync("access_token");
      
      if (!id || !token) {
        throw new Error("Authentication credentials not found");
      }
      
      return { id, token };
    } catch (error) {
      console.error("Error retrieving auth credentials:", error);
      throw error;
    }
  }

  static async setAuthCredentials(id, token) {
    try {
      await SecureStore.setItemAsync("id", id);
      await SecureStore.setItemAsync("access_token", token);
    } catch (error) {
      console.error("Error storing auth credentials:", error);
      throw error;
    }
  }

  static async clearAuthCredentials() {
    try {
      await SecureStore.deleteItemAsync("id");
      await SecureStore.deleteItemAsync("access_token");
    } catch (error) {
      console.error("Error clearing auth credentials:", error);
      throw error;
    }
  }

  static async getItem(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error retrieving item ${key}:`, error);
      throw error;
    }
  }

  static async setItem(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error storing item ${key}:`, error);
      throw error;
    }
  }

  static async deleteItem(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error deleting item ${key}:`, error);
      throw error;
    }
  }
}