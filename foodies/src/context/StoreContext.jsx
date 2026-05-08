import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { fetchFoodList } from "../service/foodService";
import { addToCart, getCartData, removeQtyFromCart } from "../service/cartService";
import BASE_URL from "../config";

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
    const [foodList, setFoodList] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [userName, setUserName] = useState('');

    const increaseQty = async (foodId) => {
        setQuantities((prev) => ({...prev, [foodId]: (prev[foodId] || 0)+1}));
        await addToCart(foodId, token);
    };

    const decreaseQty = (foodId) => {
        setQuantities((prev) => ({...prev, [foodId]: prev[foodId] > 0 ? prev[foodId] - 1 : 0,}));
        removeQtyFromCart(foodId, token);
    };

    const removeFromCart = (foodId) => {
        setQuantities((prevQuantities) => {
            const updatedQuantities = {...prevQuantities};
            delete updatedQuantities[foodId];
            return updatedQuantities;
        });
    };

    const loadCartData = async (token) => {
       const items = await getCartData(token);
        setQuantities(items || {} );
    };

    const fetchUserProfile = async (token) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserName(response.data.name);
        } catch (error) {
            console.log('Error fetching profile', error);
        }
    };
 
    const contextValue = {
        foodList,
        increaseQty,
        decreaseQty,
        quantities,
        removeFromCart,
        token,
        setToken,
        setQuantities,
        loadCartData,
        userName,
        setUserName,
    };

    useEffect(() => {
        async function loadData() {
            const data = await fetchFoodList();
            setFoodList(data);
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"));
                await loadCartData(localStorage.getItem("token"));
                await fetchUserProfile(localStorage.getItem("token"));
            }
        }
        loadData();
    }, []);

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}