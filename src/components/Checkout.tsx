import React, { useState } from 'react';
import { ArrowLeft, Clock, Bike } from 'lucide-react';
import { CartItem, ServiceType } from '../types';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack }) => {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('pickup');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pickupTime, setPickupTime] = useState('5-10');
  const [customTime, setCustomTime] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<'LUZON' | 'VISAYAS' | 'MINDANAO' | 'ISLANDER' | ''>('');

  const shippingRates = {
    LUZON: { '3': 190, '5': 320, '10': 620, '19': 1220 },
    VISAYAS: { '3': 200, '5': 370, '10': 720, '19': 1420 },
    MINDANAO: { '3': 200, '5': 370, '10': 720, '19': 1420 },
    ISLANDER: { '3': 220, '5': 420, '10': 820, '19': 1620 }, // Defaulting slightly higher for Islander
  };

  const calculateTotalWeight = () => {
    return cartItems.reduce((acc, item) => acc + (item.weight || 0.5) * item.quantity, 0);
  };

  const calculateShippingFee = () => {
    if (serviceType !== 'delivery' || !location) return 0;
    const weight = calculateTotalWeight();
    const rates = shippingRates[location as keyof typeof shippingRates];

    if (weight <= 3) return rates['3'];
    if (weight <= 5) return rates['5'];
    if (weight <= 10) return rates['10'];
    if (weight <= 19) return rates['19'];
    // For anything over 19kg, we'll use 19kg rate + some extra or a flat max? 
    // Usually it's better to just cap or warn.
    return rates['19'];
  };

  const shippingFee = calculateShippingFee();
  const grandTotal = totalPrice + shippingFee;

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handlePlaceOrder = () => {
    const timeInfo = serviceType === 'pickup'
      ? (pickupTime === 'custom' ? customTime : `${pickupTime} minutes`)
      : '';

    const deliveryInfo = serviceType === 'delivery'
      ? `\nLocation: ${location}\nTotal Weight: ${calculateTotalWeight().toFixed(1)}kg\nShipping Fee: ₱${shippingFee}`
      : '';

    const orderDetails = `
ZWEREN PH ORDER

Customer: ${customerName}
Contact: ${contactNumber}
Service: ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
${serviceType === 'delivery' ? `Address: ${address}${landmark ? `\nLandmark: ${landmark}` : ''}${deliveryInfo}` : ''}
${serviceType === 'pickup' ? `Pickup Time: ${timeInfo}` : ''}

ORDER DETAILS:
${cartItems.map(item => {
      let itemDetails = `- ${item.name}`;
      if (item.selectedVariations && item.selectedVariations.length > 0) {
        itemDetails += ` (${item.selectedVariations.map(v => v.name).join(' + ')})`;
      } else if (item.selectedVariation) {
        itemDetails += ` (${item.selectedVariation.name})`;
      }
      if (item.selectedAddOns && item.selectedAddOns.length > 0) {
        itemDetails += ` + ${item.selectedAddOns.map(addOn =>
          addOn.quantity && addOn.quantity > 1
            ? `${addOn.name} x${addOn.quantity}`
            : addOn.name
        ).join(', ')}`;
      }
      itemDetails += ` x${item.quantity} - ₱${item.totalPrice * item.quantity}`;
      return itemDetails;
    }).join('\n')}

SUBTOTAL: ₱${totalPrice}
SHIPPING: ₱${shippingFee}
TOTAL: ₱${grandTotal}

Payment: GCash
Payment Screenshot: Please attach your payment receipt screenshot

${notes ? `Notes: ${notes}` : ''}

Please confirm this order to proceed. Elevate your daily style with Zweren Ph!
    `.trim();

    const encodedMessage = encodeURIComponent(orderDetails);
    const messengerUrl = `https://m.me/ZwerenPh?text=${encodedMessage}`;

    // Detect if mobile device for better compatibility
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // On mobile, use location.href for better compatibility
      window.location.href = messengerUrl;
    } else {
      // On desktop, open in new tab
      window.open(messengerUrl, '_blank');
    }
  };

  const isDetailsValid = customerName && contactNumber &&
    (serviceType !== 'delivery' || (address && location)) &&
    (serviceType !== 'pickup' || (pickupTime !== 'custom' || customTime));

  if (step === 'details') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-3xl font-black italic text-zweren-black ml-8 uppercase tracking-tighter">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-black text-zweren-black mb-6 uppercase tracking-widest italic border-b border-zweren-silver pb-2">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-zweren-silver/30">
                  <div className="flex-1">
                    <h4 className="font-medium text-black text-sm">{item.name}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                      {(item.weight || 0.5)}kg
                    </p>
                  </div>
                  <span className="font-black text-zweren-black italic text-sm">₱{item.totalPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t-2 border-zweren-black pt-4">
              <div className="flex items-center justify-between text-sm font-bold text-gray-600">
                <span>Weight:</span>
                <span>{calculateTotalWeight().toFixed(1)}kg</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-gray-600">
                <span>Subtotal:</span>
                <span>₱{totalPrice}</span>
              </div>
              {serviceType === 'delivery' && (
                <div className="flex items-center justify-between text-sm font-bold text-zweren-lavender">
                  <span>Shipping ({location || 'Select Location'}):</span>
                  <span>₱{shippingFee}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-2xl font-black text-zweren-black italic pt-2">
                <span>Total:</span>
                <span>₱{grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-black text-zweren-black mb-6 uppercase tracking-widest italic border-b border-zweren-silver pb-2">Information</h2>

            <form className="space-y-6">
              {/* Customer Information */}
              <div>
                <label className="block text-[10px] font-black text-zweren-black mb-2 uppercase tracking-widest">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-zweren-silver rounded-sm focus:ring-1 focus:ring-zweren-lavender focus:border-zweren-lavender transition-all duration-500 bg-zweren-gray/20 font-bold text-xs uppercase"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zweren-black mb-2 uppercase tracking-widest">Contact Number *</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-zweren-silver rounded-sm focus:ring-1 focus:ring-zweren-lavender focus:border-zweren-lavender transition-all duration-500 bg-zweren-gray/20 font-bold text-xs"
                  placeholder="09XX XXX XXXX"
                  required
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-[11px] font-black text-zweren-black mb-3 uppercase tracking-widest italic">Service Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'pickup', label: 'Store Pickup', icon: '🚶' },
                    { value: 'delivery', label: 'Doorstep Delivery', icon: '🛵' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setServiceType(option.value as ServiceType)}
                      className={`p-6 border-2 transition-all duration-300 rounded-sm ${serviceType === option.value
                        ? 'border-zweren-black bg-zweren-black text-white shadow-xl italic'
                        : 'border-zweren-silver bg-white text-gray-400 hover:border-zweren-lavender hover:text-zweren-black'
                        }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>


              {/* Pickup Time Selection */}
              {serviceType === 'pickup' && (
                <div>
                  <label className="block text-sm font-medium text-black mb-3">Pickup Time *</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: '5-10', label: '5-10 minutes' },
                        { value: '15-20', label: '15-20 minutes' },
                        { value: '25-30', label: '25-30 minutes' },
                        { value: 'custom', label: 'Custom Time' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPickupTime(option.value)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm ${pickupTime === option.value
                            ? 'border-zweren-black bg-zweren-black text-white'
                            : 'border-zweren-silver bg-white text-gray-700 hover:border-zweren-lavender'
                            }`}
                        >
                          <Clock className="h-4 w-4 mx-auto mb-1" />
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {pickupTime === 'custom' && (
                      <input
                        type="text"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-4 py-3 border border-zweren-silver rounded-sm focus:ring-1 focus:ring-zweren-lavender focus:border-zweren-lavender transition-all duration-500 bg-zweren-gray/20 font-bold text-xs"
                        placeholder="e.g., 45 minutes, 1 hour, 2:30 PM"
                        required
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {serviceType === 'delivery' && (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-zweren-black mb-2 uppercase tracking-widest">Shipping Location *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['LUZON', 'VISAYAS', 'MINDANAO', 'ISLANDER'].map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setLocation(loc as any)}
                          className={`py-3 px-2 border-2 transition-all duration-300 rounded-sm font-black text-[9px] uppercase tracking-widest ${location === loc
                            ? 'border-zweren-black bg-zweren-black text-white'
                            : 'border-zweren-silver bg-white text-gray-400 hover:border-zweren-lavender hover:text-zweren-black'
                            }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zweren-black mb-2 uppercase tracking-widest">Delivery Address *</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-zweren-silver rounded-sm focus:ring-1 focus:ring-zweren-lavender focus:border-zweren-lavender transition-all duration-500 bg-zweren-gray/20 font-bold text-xs uppercase"
                      placeholder="Enter your complete delivery address"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zweren-black mb-2 uppercase tracking-widest">Landmark</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-4 py-3 border border-zweren-silver rounded-sm focus:ring-1 focus:ring-zweren-lavender focus:border-zweren-lavender transition-all duration-500 bg-zweren-gray/20 font-bold text-xs uppercase"
                      placeholder="e.g., Near McDonald's, Beside 7-Eleven, In front of school"
                    />
                  </div>
                </>
              )}

              {/* Special Notes */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Special Instructions (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-zweren-silver rounded-sm focus:ring-1 focus:ring-zweren-lavender focus:border-zweren-lavender transition-all duration-500 bg-zweren-gray/20 font-bold text-xs uppercase"
                  placeholder="Any special requests or instructions..."
                  rows={3}
                />
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={!isDetailsValid}
                className={`w-full py-5 rounded-sm font-black text-xs uppercase tracking-[0.3em] italic transition-all duration-500 transform ${isDetailsValid
                  ? 'bg-zweren-black text-white hover:bg-zweren-lavender hover:text-black hover:shadow-[0_0_30px_rgba(188,166,255,0.3)] shadow-2xl active:scale-95'
                  : 'bg-zweren-gray text-gray-300 cursor-not-allowed border border-zweren-silver'
                  }`}
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => setStep('details')}
          className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Details</span>
        </button>
        <h1 className="text-3xl font-black italic text-zweren-black ml-8 uppercase tracking-tighter">Payment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GCash Payment Only */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-black text-zweren-black mb-6 uppercase tracking-widest italic border-b border-zweren-silver pb-2">💳 GCash Payment</h2>

          {/* GCash Payment Details with QR Code */}
          <div className="bg-zweren-gradient rounded-sm p-8 mb-6 border border-zweren-lavender/30 shadow-2xl shadow-zweren-lavender/10 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-zweren-lavender/10 rounded-full blur-3xl group-hover:bg-zweren-lavender/20 transition-all duration-1000"></div>

            <div className="flex items-center space-x-3 mb-6 relative z-10">
              <div className="w-12 h-12 bg-zweren-lavender rounded-sm flex items-center justify-center shadow-lg">
                <span className="text-zweren-black font-black text-xl italic">G</span>
              </div>
              <h3 className="font-black text-white text-lg uppercase tracking-widest italic">GCash Payment</h3>
            </div>

            <div className="bg-white rounded-sm p-6 mb-6 relative z-10 border border-zweren-silver/20 shadow-inner">
              <p className="text-2xl font-black text-zweren-black mb-6 text-center italic tracking-tight">Amount to Pay: ₱{grandTotal}</p>

              {/* QR Code - Displayed at proper size for scanning */}
              <div className="flex justify-center mb-6">
                <div className="w-72 h-72 rounded-sm border border-zweren-silver shadow-2xl overflow-hidden bg-white p-4 flex items-center justify-center relative">
                  <div className="absolute inset-0 border-4 border-zweren-lavender/20 pointer-events-none"></div>
                  <img
                    src="/images/payment-qr/gcash-qr-code.jpg"
                    alt="GCash QR Code - Scan to Pay"
                    className="w-full h-full object-contain"
                    style={{
                      imageRendering: 'crisp-edges'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = '/images/payment-qr/gcash-qr-code.png';
                    }}
                  />
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-zweren-black font-black uppercase tracking-[0.2em] mb-2 italic">📱 Scan QR Code to Pay</p>
                <div className="w-12 h-1 bg-zweren-lavender mx-auto rounded-full"></div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white/5 backdrop-blur-sm rounded-sm p-6 space-y-4 relative z-10 border border-white/10">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Method:</span>
                <span className="font-black text-zweren-lavender uppercase text-xs italic">GCash / InstaPay</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Number:</span>
                <span className="font-black text-white tracking-widest text-xs italic">0905 293 1408</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Name:</span>
                <span className="font-black text-white uppercase text-xs italic tracking-tighter">Zweren Ph</span>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-zweren-gray border border-zweren-silver rounded-sm p-6 shadow-inner">
            <h4 className="font-black text-zweren-black mb-4 flex items-center uppercase tracking-widest text-[11px] italic">
              <span className="text-xl mr-3">📸</span>
              Proof of Payment Required
            </h4>
            <ol className="text-[10px] text-zweren-gray font-bold space-y-3 list-decimal list-inside uppercase tracking-wider">
              <li>Scan the QR code using GCash</li>
              <li>Pay the total amount of <span className="font-black text-zweren-black">₱{grandTotal}</span></li>
              <li>Save a screenshot of receipt</li>
              <li>Attach it to your Messenger message</li>
            </ol>
            <p className="text-[9px] text-zweren-lavender font-black mt-6 italic uppercase tracking-widest">
              💡 Your order will be processed upon verification.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-sm shadow-2xl p-8 border border-zweren-gray relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-zweren-lavender/5 blur-3xl pointer-events-none"></div>
          <h2 className="text-xl font-black text-zweren-black mb-8 uppercase tracking-widest italic border-b border-zweren-silver pb-2">Final Summary</h2>

          <div className="space-y-4 mb-6">
            <div className="bg-zweren-gray p-6 rounded-sm border border-zweren-silver/50 mb-8">
              <h4 className="font-black text-zweren-black mb-4 uppercase text-[10px] tracking-widest italic border-b border-zweren-silver pb-1">Customer Details</h4>
              <p className="text-[10px] font-bold text-zweren-gray uppercase mb-2 tracking-wider"><span className="text-zweren-black">Name:</span> {customerName}</p>
              <p className="text-[10px] font-bold text-zweren-gray uppercase mb-2 tracking-wider"><span className="text-zweren-black">Contact:</span> {contactNumber}</p>
              <p className="text-[10px] font-bold text-zweren-gray uppercase tracking-wider"><span className="text-zweren-black">Service:</span> {serviceType}</p>
              {serviceType === 'delivery' && (
                <>
                  <p className="text-sm text-gray-600">Address: {address}</p>
                  {landmark && <p className="text-sm text-gray-600">Landmark: {landmark}</p>}
                </>
              )}
              {serviceType === 'pickup' && (
                <p className="text-sm text-gray-600">
                  Pickup Time: {pickupTime === 'custom' ? customTime : `${pickupTime} minutes`}
                </p>
              )}
            </div>

            {cartItems.map((item) => {
              return (
                <div key={item.id} className="flex items-center space-x-3 py-2 border-b border-zweren-silver/30">
                  {/* Variation Image - Only show if uploaded */}
                  {item.selectedVariation?.image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.selectedVariation.image}
                        alt={item.selectedVariation.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-black">{item.name}</h4>
                    {item.selectedVariations && item.selectedVariations.length > 0 ? (
                      <p className="text-sm text-gray-600">Flavors: {item.selectedVariations.map(v => v.name).join(' + ')}</p>
                    ) : item.selectedVariation ? (
                      <p className="text-sm text-gray-600">Flavor: {item.selectedVariation.name}</p>
                    ) : null}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Add-ons: {item.selectedAddOns.map(addOn =>
                          addOn.quantity && addOn.quantity > 1
                            ? `${addOn.name} x${addOn.quantity}`
                            : addOn.name
                        ).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">₱{item.totalPrice} x {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-black">₱{item.totalPrice * item.quantity}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-3 border-t-2 border-zweren-black pt-6 mb-10 mt-6">
            <div className="flex items-center justify-between text-sm font-bold text-gray-500">
              <span className="uppercase tracking-widest">Subtotal:</span>
              <span className="italic">₱{totalPrice}</span>
            </div>
            {serviceType === 'delivery' && (
              <div className="flex items-center justify-between text-sm font-bold text-zweren-lavender transition-all duration-500">
                <span className="uppercase tracking-widest">Shipping ({location}):</span>
                <span className="italic">₱{shippingFee}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-3xl font-black text-zweren-black italic pt-2">
              <span>Total:</span>
              <span>₱{grandTotal}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full py-6 rounded-sm font-black text-xs uppercase tracking-[0.3em] italic transition-all duration-700 transform bg-zweren-black text-white hover:bg-zweren-lavender hover:text-black hover:shadow-[0_0_40px_rgba(188,166,255,0.4)] shadow-2xl active:scale-95 border border-transparent hover:border-zweren-lavender/30"
          >
            Complete via Messenger
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            You'll be redirected to Facebook Messenger to confirm your order. Don't forget to attach your payment screenshot!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
