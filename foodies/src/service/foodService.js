import axios from "axios";
import BASE_URL from '../config';

const API_URL = `${BASE_URL}/api/foods`;

export const fetchFoodList = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data; 
    } catch (error) {
        console.log('Error fetching food list:', error);
        throw error;
    }
}

export const fetchFoodDetails = async (id) => {
    try {
        const response = await axios.get(API_URL+"/"+id);
        return response.data;  
    } catch (error) {
        console.log('Error fetching food details:', error);
        throw error;
    } 
         
}
