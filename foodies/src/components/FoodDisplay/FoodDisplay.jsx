import React, { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({category, searchText, vegFilter, priceRange}) => {
    const {foodList} = useContext(StoreContext);
    
    const filteredFoods = foodList.filter(food => (
        (category === 'All' || food.category === category) &&
        food.name.toLowerCase().includes(searchText.toLowerCase()) &&
        (vegFilter === 'all' || (vegFilter === 'veg' && food.veg) || (vegFilter === 'nonveg' && !food.veg)) &&
        food.price <= priceRange
    ));
 
    return (
    <div className="container">
        <div className="row">
           {filteredFoods.length > 0 ? (
               filteredFoods.map((food, index) => (
                  <FoodItem key={index}
                      name={food.name}
                      description={food.description}
                      id={food.id}
                      imageURL={food.imageUrl}
                      price={food.price}
                      veg={food.veg} 
                      quantityPerSet={food.quantityPerSet}
                      unit={food.unit}/>
               ))
           ) : (
            <div className="text-center mt-4">
                <h4>No food found.</h4>
            </div>
           )}
        </div>
    </div>
  );
};

export default FoodDisplay;
