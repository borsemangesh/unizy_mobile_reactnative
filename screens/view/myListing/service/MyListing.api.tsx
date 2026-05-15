import AsyncStorage from '@react-native-async-storage/async-storage';
import { t } from 'i18next';
import { MAIN_URL } from '../../../utils/APIConstant';

const CATAGORY = ['categories', 'all'];
export class MyListingApi {
  getCatagoryList = async () => {
    const stored = await AsyncStorage.getItem(CATAGORY[0]);
    if (stored) {
      const parsed = JSON.parse(stored);
      return [
        { id: null, name: t(CATAGORY[1]) },
        ...parsed.map((cat: any) => ({ id: cat.id, name: cat.name })),
      ];
    } else {
      return [];
    }
  };

  getDisplayList = async (
    categoryId: number | null,
    pageNum: number,
    isInitialLoad: boolean = false,
  ) => {
    try {
     
        

         const pagesize = 10;
              let url = `${MAIN_URL.baseUrl}category/mylisting?page=${pageNum}&pagesize=${pagesize}`;
              if (categoryId) {
                url += `&category_id=${categoryId}`;
              }
        
              console.log(url);
        
              const token = await AsyncStorage.getItem('userToken');
              const language_code =
                (await AsyncStorage.getItem('selectedLanguage')) || 'en';
        
              console.log(token);
        
              if (!token) {
                if (isInitialLoad) {
                  await new Promise(r => setTimeout(r, 1000));
                //   setInitialLoading(false);
                //   setIsLoading(false);
                }
                return;
              }
        
              const response = await fetch(url, {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  languagecode: language_code,
                },
              });
        
              const jsonResponse = await response.json();
    } catch (error) {
      console.log(error);
    } finally {
    }
  };
}
