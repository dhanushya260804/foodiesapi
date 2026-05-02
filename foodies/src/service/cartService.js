import axios from "axios";
import BASE_URL from '../config';

const API_URL = `${BASE_URL}/api/cart`;

export const addToCart = async (foodId, token) => {
    try {
        await axios.post(API_URL, {foodId}, {headers: {"Authorization": `Bearer ${token}`}});
    } catch (error) {
        console.error('Error while adding the cart data', error);
    }
}

export const removeQtyFromCart = async (foodId, token) => {
    try {
        await axios.post(API_URL+"/remove", {foodId}, {headers: {"Authorization": `Bearer ${token}`}});
    } catch (error) {
        console.error('Error while removing qty from cart', error);
    }
}

export const getCartData = async (token) => {
    try {
        const response = await axios.get(API_URL, {headers: {"Authorization": `Bearer ${token}`}});
        return response.data.items;
    } catch (error) {
        console.error('Error while fetching the cart data', error);
    }
}
