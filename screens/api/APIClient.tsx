import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../utils/APIConstant';

export const apiRequest = async ({
  endpoint,
  method = 'GET',
  body = null,
  headers = {},
  requireAuth = true, // 👈 control if token is required
}: {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: any;
  requireAuth?: boolean;
}) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const language_code = await AsyncStorage.getItem('selectedLanguage') || 'en';

    // ✅ Token check centralized
    if (requireAuth && !token) {
      console.log('No token found');
      // handleForceLogout(); // optional
      return null;
    }

    const defaultHeaders: any = {
      'Content-Type': 'application/json',
      languagecode: language_code,
      ...headers,
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: any = {
      method,
      headers: defaultHeaders,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

      console.log('API Request:', {
        url: `${MAIN_URL.baseUrl}${endpoint}`,
        method,
        headers: defaultHeaders,
        body,
      });
    const response = await fetch(`${MAIN_URL.baseUrl}${endpoint}`, config);

    if (response.status === 401 || response.status === 403) {
      // handleForceLogout();
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    if (json.statusCode === 401 || json.statusCode === 403) {
      // handleForceLogout();
      return null;
    }

    return json;
  } catch (error) {
    console.log('API Error:', error);
    throw error;
  }
};