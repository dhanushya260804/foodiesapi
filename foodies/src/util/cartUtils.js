export const calculateCartTotals = (cartItems, quantities, cartCustomizations = {}) => {
    const subtotal = Array.isArray(cartItems)
    ? cartItems.reduce(
        (acc, food) => {
            const basePrice = food.price * (quantities[food.id] || 0);
            const addOnsPrice = (cartCustomizations[food.id]?.addOnsPrice || 0) * (quantities[food.id] || 0);
            return acc + basePrice + addOnsPrice;
        },
        0
      )
    : 0;
    const shipping = subtotal === 0 ? 0.0 : 10;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    return {subtotal, shipping, tax, total};
}