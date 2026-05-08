import React, { useState } from 'react';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';

const ExploreFood = () => {
  const [category, setCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [vegFilter, setVegFilter] = useState('all');
  const [priceRange, setPriceRange] = useState(1000);

  return (
    <>
    <div className="container">
      <div className="row justify-content-center">
      <div className="col-md-6">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="input-group mb-3">
            <select className='form-select mt-2' style={{'maxWidth': '150px'}} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All</option>
              <option value="Biryani">Biryani</option>
              <option value="Parotta">Parotta</option>
              <option value="Dosa">Dosa</option>
              <option value="Rolls">Roll</option>
              <option value="Salad">Salad</option>
              <option value="Shawarma">Shawarma</option>
              <option value="Pizza">Pizza</option>
              <option value="Desserts">Desserts</option>
            </select>
            <input type="text" className='form-control mt-2' placeholder='Search your favourite dish...' 
              onChange={(e) => setSearchText(e.target.value)} value={searchText} />
            <button className='btn btn-primary mt-2' type='submit'>
              <i className='bi bi-search'></i>
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
    <div className="container">
      <div className="d-flex justify-content-end align-items-center gap-4 mb-3 flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <label className="fw-bold text-nowrap">Max Price: ₹{priceRange}</label>
          <input type="range" className="form-range" min={50} max={1000} step={50}
            value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))}
            style={{width: '150px'}} />
        </div>
        <select className="form-select" style={{maxWidth: '150px'}}
            value={vegFilter} onChange={(e) => setVegFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="veg">🟢 Veg</option>
            <option value="nonveg">🔴 Non-Veg</option>
        </select>
      </div>
    </div>
    <FoodDisplay category={category} searchText={searchText} vegFilter={vegFilter} priceRange={priceRange} />
    </>
  )
}

export default ExploreFood;