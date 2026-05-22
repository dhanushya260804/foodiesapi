import React, { useState } from 'react';

const AddOnsModal = ({ food, onConfirm, onClose }) => {
  const hasVariants   = food.variants && food.variants.length > 0;
  const hasAddOns     = food.addOns && food.addOns.length > 0;
  const hasPrefs      = food.preferences && food.preferences.length > 0;

  const [selectedVariant, setSelectedVariant]       = useState(hasVariants ? food.variants[0] : null);
  const [selectedAddOns, setSelectedAddOns]         = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);

  const toggleAddOn = (addOn) => {
    setSelectedAddOns(prev =>
      prev.find(a => a.name === addOn.name)
        ? prev.filter(a => a.name !== addOn.name)
        : [...prev, addOn]
    );
  };

  const togglePref = (pref) => {
    setSelectedPreferences(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const basePrice   = selectedVariant ? selectedVariant.price : (food.variantRequired ? 0 : food.price) ;
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const totalPrice  = basePrice + addOnsTotal;

  const handleConfirm = () => {
  onConfirm({
    selectedVariant: selectedVariant ? `${selectedVariant.name} (₹${selectedVariant.price})` : null,
    selectedAddOns: selectedAddOns.map(a => `${a.name} (+₹${a.price})`),
    selectedPreferences,
    addOnsPrice: addOnsTotal,
    variantPrice: selectedVariant ? selectedVariant.price : food.price,
  });
};

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">

          <div className="modal-header">
            <div>
              <h5 className="modal-title fw-bold">Customise {food.name}</h5>
              <small className="text-muted">Make it exactly how you like it</small>
            </div>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">

            {/* Variants — radio buttons, pick one */}
            {hasVariants && (
              <div className="mb-4">
                <h6 className="fw-bold mb-2">📐 Size / Variant <span className="text-danger">*</span></h6>
                {food.variants.map((v, i) => (
                  <div key={i}
                    className={`d-flex align-items-center justify-content-between p-2 rounded mb-2 border ${selectedVariant?.name === v.name ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedVariant(v)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <input type="radio" className="form-check-input mt-0"
                        name="variant"
                        checked={selectedVariant?.name === v.name}
                        onChange={() => setSelectedVariant(v)} />
                      <span className="fw-semibold">{v.name}</span>
                    </div>
                    <span className="text-primary fw-bold">₹{v.price}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Add-ons — checkboxes */}
            {hasAddOns && (
              <div className="mb-4">
                <h6 className="fw-bold mb-2">🧩 Add-ons</h6>
                {food.addOns.map((addOn, i) => {
                  const checked = !!selectedAddOns.find(a => a.name === addOn.name);
                  return (
                    <div key={i}
                      className={`d-flex align-items-center justify-content-between p-2 rounded mb-2 border ${checked ? 'border-success bg-success bg-opacity-10' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleAddOn(addOn)}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <input type="checkbox" className="form-check-input mt-0"
                          checked={checked} onChange={() => {}} />
                        <span className="fw-semibold">{addOn.name}</span>
                      </div>
                      <span className="text-success fw-bold">+₹{addOn.price}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Preferences — toggle badges */}
            {hasPrefs && (
              <div className="mb-3">
                <h6 className="fw-bold mb-2">⚙️ Preferences <span className="text-muted fw-normal small">(free)</span></h6>
                <div className="d-flex flex-wrap gap-2">
                  {food.preferences.map((pref, i) => {
                    const checked = selectedPreferences.includes(pref);
                    return (
                      <span key={i}
                        className={`badge px-3 py-2 ${checked ? 'bg-dark' : 'bg-light text-dark border'}`}
                        style={{ cursor: 'pointer', fontSize: '0.88rem' }}
                        onClick={() => togglePref(pref)}
                      >
                        {checked ? '✓ ' : ''}{pref}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div className="bg-light rounded p-3 mt-3">
              {selectedVariant && (
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>{selectedVariant.name}</span>
                  <span>₹{selectedVariant.price}</span>
                </div>
              )}
              
              {selectedAddOns.map((a, i) => (
                <div key={i} className="d-flex justify-content-between small text-muted mb-1">
                  <span>{a.name}</span>
                  <span>+₹{a.price}</span>
                </div>
              ))}
              <hr className="my-2" />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total per set</span>
                <span className="text-primary">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleConfirm}
              disabled={food.variantRequired && ! selectedVariant}>
                {food.variantRequired && !selectedVariant ? 'Select a variant first' : `Add to Cart - ₹${totalPrice.toFixed(2)}`}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddOnsModal;