import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';

const Home = () => {
  const [category, setCategory] = useState('All');
  const [vegFilter, setVegFilter] = useState('all');
  const [priceRange, setPriceRange] = useState(1000);

  return (
    <main className='container'>
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />
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
      <FoodDisplay category={category} searchText={''} vegFilter={vegFilter} priceRange={priceRange} />
    </main>
  )
}

export default Home;
