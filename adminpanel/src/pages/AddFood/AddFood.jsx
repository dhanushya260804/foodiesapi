import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import { addFood } from '../../services/foodService';
import { toast } from 'react-toastify';

const UNITS = ['piece', 'plate', 'roll', 'glass', 'bowl', 'cup', 'slice', 'serving'];
const PREDEFINED_PREFERENCES = ['Less Spicy', 'No Onion', 'No Garlic', 'Extra Spicy', 'No Salt'];
const MAX_ADDONS   = 5;
const MAX_PREFS    = 5;
const MAX_VARIANTS = 5;

const AddFood = () => {
  const [image, setImage] = useState(null);
  const [data, setData] = useState({
    name: '', description: '', price: '',
    category: 'Biryani', veg: false,
    quantityPerSet: 1, unit: 'piece',
    addOnsEnabled: false,
    variantRequired: false,
  });

  const [addOns, setAddOns]           = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [variants, setVariants]       = useState([]);
  const [newAddOn, setNewAddOn]       = useState({ name: '', price: '' });
  const [customPref, setCustomPref]   = useState('');
  const [newVariant, setNewVariant]   = useState({ name: '', price: '' });

  const onChangeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    setData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'veg' ? value === 'true' : value
    }));
  };

  // Add-on handlers
  const addAddOn = () => {
    if (addOns.length >= MAX_ADDONS)       { toast.warning('Max 5 add-ons'); return; }
    if (!newAddOn.name.trim())             { toast.warning('Add-on name required'); return; }
    if (!newAddOn.price || isNaN(newAddOn.price)) { toast.warning('Valid price required'); return; }
    setAddOns(prev => [...prev, { name: newAddOn.name.trim(), price: parseFloat(newAddOn.price) }]);
    setNewAddOn({ name: '', price: '' });
  };
  const removeAddOn = (i) => setAddOns(prev => prev.filter((_, idx) => idx !== i));

  // Preference handlers
  const addPredefinedPref = (p) => {
    if (preferences.length >= MAX_PREFS) { toast.warning('Max 5 preferences'); return; }
    if (preferences.includes(p))         { toast.warning('Already added'); return; }
    setPreferences(prev => [...prev, p]);
  };
  const addCustomPref = () => {
    if (preferences.length >= MAX_PREFS)          { toast.warning('Max 5 preferences'); return; }
    if (!customPref.trim())                        { toast.warning('Enter a preference'); return; }
    if (preferences.includes(customPref.trim()))   { toast.warning('Already added'); return; }
    setPreferences(prev => [...prev, customPref.trim()]);
    setCustomPref('');
  };
  const removePref = (i) => setPreferences(prev => prev.filter((_, idx) => idx !== i));

  // Variant handlers
  const addVariant = () => {
    if (variants.length >= MAX_VARIANTS)             { toast.warning('Max 5 variants'); return; }
    if (!newVariant.name.trim())                     { toast.warning('Variant name required'); return; }
    if (!newVariant.price || isNaN(newVariant.price)){ toast.warning('Valid price required'); return; }
    setVariants(prev => [...prev, { name: newVariant.name.trim(), price: parseFloat(newVariant.price) }]);
    setNewVariant({ name: '', price: '' });
  };
  const removeVariant = (i) => setVariants(prev => prev.filter((_, idx) => idx !== i));

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!image) { toast.error('Please select an image.'); return; }
    try {
      await addFood({
        ...data,
        addOns: data.addOnsEnabled ? addOns : [],
        preferences: data.addOnsEnabled ? preferences : [],
        variants: data.addOnsEnabled ? variants : [],
      }, image);
      toast.success('Food added successfully!');
      setData({ name: '', description: '', category: 'Biryani', price: '', veg: false, quantityPerSet: 1, unit: 'piece', addOnsEnabled: false, variantRequired: false });
      setAddOns([]); setPreferences([]); setVariants([]); setImage(null);
    } catch { toast.error('Error adding food.'); }
  };

  return (
    <div className="mx-2 mt-2">
      <div className="row">
        <div className="card col-md-6">
          <div className="card-body">
            <h2 className="mb-4">Add Food</h2>
            <form onSubmit={onSubmitHandler}>

              {/* Image */}
              <div className="mb-3">
                <label htmlFor="image" className="form-label">
                  <img src={image ? URL.createObjectURL(image) : assets.upload} alt="" width={98} />
                </label>
                <input type="file" className="form-control" id="image" hidden onChange={(e) => setImage(e.target.files[0])} />
              </div>

              {/* Name */}
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" name="name" placeholder="Chicken Biryani"
                  required value={data.name} onChange={onChangeHandler} />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" rows="3"
                  placeholder="Write content here..." required value={data.description} onChange={onChangeHandler} />
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="form-label">Category</label>
                <select name="category" className="form-control" value={data.category} onChange={onChangeHandler}>
                  {['Biryani','Parotta','Dosa','Rolls','Salad','Shawarma','Pizza','Desserts'].map(c =>
                    <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Veg */}
              <div className="mb-3">
                <label className="form-label">Type</label>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="veg" id="veg" value="true" onChange={onChangeHandler} required />
                    <label className="form-check-label text-success fw-bold" htmlFor="veg">🟢 Veg</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="veg" id="nonveg" value="false" onChange={onChangeHandler} required />
                    <label className="form-check-label text-danger fw-bold" htmlFor="nonveg">🔴 Non-Veg</label>
                  </div>
                </div>
              </div>

              {/* Quantity per set */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Quantity per Set</label>
                <div className="row g-2">
                  <div className="col-5">
                    <input type="number" className="form-control" name="quantityPerSet"
                      min="1" value={data.quantityPerSet} onChange={onChangeHandler} required />
                    <small className="text-muted">Pieces per set</small>
                  </div>
                  <div className="col-7">
                    <select className="form-control" name="unit" value={data.unit} onChange={onChangeHandler}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <small className="text-muted">Unit name</small>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-3">
                <label className="form-label">Base Price ₹ <small className="text-muted">(used when no variant selected)</small></label>
                <input type="number" name="price" className="form-control"
                  placeholder="200" value={data.price} onChange={onChangeHandler} required />
              </div>

              {/* Add-ons Toggle */}
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch"
                    id="addOnsSwitch" name="addOnsEnabled"
                    checked={data.addOnsEnabled} onChange={onChangeHandler} />
                  <label className="form-check-label fw-bold" htmlFor="addOnsSwitch">
                    🧩 Enable Customisation (Add-ons, Preferences & Variants)
                  </label>
                </div>
              </div>

              {/* Customization Section - Only shows when addOnsEnabled is true */}
              {data.addOnsEnabled && (
                <div className="border rounded p-3 mb-3 bg-light">

                  {/* Variant Required Toggle */}
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" role="switch"
                      id="variantRequired" name="variantRequired"
                      checked={data.variantRequired || false}
                      onChange={onChangeHandler} />
                    <label className="form-check-label fw-bold text-primary" htmlFor="variantRequired">
                      🍕 Variant Required (customer must pick a size/variant)
                    </label>
                  </div>

                  {/* ── Variants ── */}
                  <h6 className="fw-bold mb-2">📐 Variants <small className="text-muted fw-normal">(max 5 — e.g. Small/Medium/Large, customer picks one)</small></h6>
                  {variants.map((v, i) => (
                    <div key={i} className="d-flex align-items-center justify-content-between bg-white rounded px-3 py-2 mb-1 border">
                      <span>{v.name}</span>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-primary fw-semibold">₹{v.price}</span>
                        <button type="button" className="btn btn-sm btn-outline-danger py-0"
                          onClick={() => removeVariant(i)}>✕</button>
                      </div>
                    </div>
                  ))}
                  {variants.length < MAX_VARIANTS && (
                    <div className="row g-2 mt-1 mb-3">
                      <div className="col-6">
                        <input type="text" className="form-control form-control-sm"
                          placeholder="e.g. Small (4 slices)"
                          value={newVariant.name}
                          onChange={e => setNewVariant(p => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="col-3">
                        <input type="number" className="form-control form-control-sm"
                          placeholder="₹199"
                          value={newVariant.price}
                          onChange={e => setNewVariant(p => ({ ...p, price: e.target.value }))} />
                      </div>
                      <div className="col-3">
                        <button type="button" className="btn btn-sm btn-primary w-100" onClick={addVariant}>+ Add</button>
                      </div>
                    </div>
                  )}

                  <hr />

                  {/* ── Add-ons ── */}
                  <h6 className="fw-bold mb-2">Add-ons <small className="text-muted fw-normal">(max 5, with price)</small></h6>
                  {addOns.map((a, i) => (
                    <div key={i} className="d-flex align-items-center justify-content-between bg-white rounded px-3 py-2 mb-1 border">
                      <span>{a.name}</span>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-success fw-semibold">+₹{a.price}</span>
                        <button type="button" className="btn btn-sm btn-outline-danger py-0" onClick={() => removeAddOn(i)}>✕</button>
                      </div>
                    </div>
                  ))}
                  {addOns.length < MAX_ADDONS && (
                    <div className="row g-2 mt-1">
                      <div className="col-6">
                        <input type="text" className="form-control form-control-sm" placeholder="e.g. Extra Cheese"
                          value={newAddOn.name} onChange={e => setNewAddOn(p => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="col-3">
                        <input type="number" className="form-control form-control-sm" placeholder="₹20"
                          value={newAddOn.price} onChange={e => setNewAddOn(p => ({ ...p, price: e.target.value }))} />
                      </div>
                      <div className="col-3">
                        <button type="button" className="btn btn-sm btn-dark w-100" onClick={addAddOn}>+ Add</button>
                      </div>
                    </div>
                  )}

                  <hr />

                  {/* ── Preferences ── */}
                  <h6 className="fw-bold mb-2">Preferences <small className="text-muted fw-normal">(max 5, free)</small></h6>
                  {preferences.map((p, i) => (
                    <span key={i} className="badge bg-secondary me-1 mb-1 px-2 py-1" style={{ fontSize: '0.85rem' }}>
                      {p}
                      <button type="button" className="btn-close btn-close-white ms-1"
                        style={{ fontSize: '0.6rem' }} onClick={() => removePref(i)} />
                    </span>
                  ))}
                  {preferences.length < MAX_PREFS && (
                    <>
                      <div className="d-flex flex-wrap gap-1 mt-2 mb-2">
                        {PREDEFINED_PREFERENCES.filter(p => !preferences.includes(p)).map(p => (
                          <button key={p} type="button" className="btn btn-sm btn-outline-secondary py-0 px-2"
                            onClick={() => addPredefinedPref(p)}>+ {p}</button>
                        ))}
                      </div>
                      <div className="row g-2">
                        <div className="col-8">
                          <input type="text" className="form-control form-control-sm" placeholder="Custom preference..."
                            value={customPref} onChange={e => setCustomPref(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomPref())} />
                        </div>
                        <div className="col-4">
                          <button type="button" className="btn btn-sm btn-dark w-100" onClick={addCustomPref}>+ Add</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <button type="submit" className="btn btn-primary">Save Food</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFood;