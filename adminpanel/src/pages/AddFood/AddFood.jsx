import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import { addFood } from '../../services/foodService';
import { toast } from 'react-toastify';

const AddFood = () => {
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
      name:'',
      description:'',
      price:'',
      category:'Biryani',
      veg: false
  });

  const onChangeHandler = (event) => {
      const name = event.target.name;
      const value = event.target.name === 'veg' ? event.target.value === 'true' : event.target.value;
      setData(data => ({...data, [name]: value}));
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!image) {
      toast.error('Please select an image.')
      return;
    }
    try {
       await addFood(data, image);
       toast.success('Food added successfully!');
       setData({name: '', description: '', category: 'Briyani', price: '', veg: false});
       setImage(null);
   } catch (error) {
        toast.error('Error adding food.');
   }
  }
  return (
    <div className="mx-2 mt-2">
  <div className="row">
    <div className="card col-md-4">
      <div className="card-body">
        <h2 className="mb-4">Add Food</h2>
        <form onSubmit={onSubmitHandler}>
            <div className="mb-3">
            <label htmlFor="image" className="form-label">
                <img src={image ? URL.createObjectURL(image): assets.upload} alt="" width={98}/>
            </label>
            <input type="file" className="form-control" id="image" hidden onChange={(e) => setImage(e.target.files[0])} />
          </div>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="text" placeholder='Chicken Briyani' className="form-control" id="name" required name='name' onChange={onChangeHandler} value={data.name}/>
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea className="form-control" placeholder='Write content here...' id="description" rows="5" required name='description' onChange={onChangeHandler} value={data.description}></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="category" className="form-label">Category</label>
            <select name="category" id="category" className='form-control' onChange={onChangeHandler} value={data.category}>
                <option value="Briyani">Briyani</option>
                <option value="Parotta">Parotta</option>
                <option value="Dosa">Dosa</option>
                <option value="Rolls">Rolls</option>
                <option value="Salad">Salad</option>
                <option value="Shawarma">Shawarma</option>
                <option value="Pizza">Pizza</option>
                <option value="Desserts">Desserts</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Type</label>
            < div className="d-flex gap-3">
            <div className="form-check">
              <input className="form-check-input" type="radio" name="veg" id="veg" value="true" onChange={onChangeHandler} required />
              <label className="form-check-label text-success fw-bold" htmlFor="veg">
                🟢 Veg
                </label> 
            </div>
            <div className="form-check">
            <input className="form-check-input" type="radio" name="veg" id="nonveg"
                value="false" onChange={onChangeHandler} required />
            <label className="form-check-label text-danger fw-bold" htmlFor="nonveg">
                🔴 Non-Veg
            </label>
            </div>
          </div>
          </div>

          <div className="mb-3">
            <label htmlFor="price" className="form-label">Price</label>
            <input type="number" name="price" id="price" placeholder='&#8377;200' className='form-control' onChange={onChangeHandler} value={data.price}/>
          </div>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      </div>
    </div>
  </div>
</div>
  )
}

export default AddFood;