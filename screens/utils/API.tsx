import { MAIN_URL } from "./APIConstant";

export const getRequest = async (endpoint: string) => {
  try {
    const response = await fetch(MAIN_URL.baseUrl + endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if needed: 'Authorization': `Bearer ${token}`
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
};

// Generic POST request
export const postRequest = async (endpoint: string, body: any) => {
  try {
    const response = await fetch(MAIN_URL.baseUrl + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if needed
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
};