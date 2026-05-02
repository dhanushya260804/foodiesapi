import axios from "axios";
import BASE_URL from "../config";

const API_URL = `${BASE_URL}/api`; 

export const registerUser = async (data) => {
    try {
        const response = await axios.post(API_URL+"/register", data);
        return response;
    } catch (error) {
        throw error;
    }
}

export const login = async (data) => {
    try {
        const response = await axios.post(API_URL+"/login", data);  
        return response;
    } catch (error) {
        throw error;
    }
}