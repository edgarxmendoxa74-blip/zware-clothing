import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CartItem, ServiceType, Coupon } from '../types';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { usePaymentMethods } from '../hooks/usePaymentMethods';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number; // This is the total after discounts
  subtotal: number;
  discountTotal: number;
  appliedCoupon?: Coupon | null;
  onBack: () => void;
  onStepChange?: (step: 'details' | 'payment') => void;
}

const Checkout: React.FC<CheckoutProps> = ({
  cartItems,
  totalPrice,
  subtotal,
  discountTotal,
  appliedCoupon,
  onBack,
  onStepChange
}) => {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('regular');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<'LUZON' | 'VISAYAS' | 'MINDANAO' | 'ISLANDER' | ''>('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');
  const { siteSettings } = useSiteSettings();
  const { paymentMethods } = usePaymentMethods();

  // Set default payment method once loaded
  React.useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentId) {
      setSelectedPaymentId(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedPaymentId]);

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedPaymentId);

  const defaultShippingRates = {
    LUZON: { '3': 190, '5': 320, '10': 620, '19': 1220 },
    VISAYAS: { '3': 200, '5': 370, '10': 720, '19': 1420 },
    MINDANAO: { '3': 200, '5': 370, '10': 720, '19': 1420 },
    ISLANDER: { '3': 220, '5': 420, '10': 820, '19': 1620 },
  };

  const shippingRates = siteSettings?.shipping_rates || defaultShippingRates;

  const calculateTotalWeight = () => {
    return cartItems.reduce((acc, item) => acc + (item.weight || 0.5) * item.quantity, 0);
  };

  const calculateTotalQuantity = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  const totalQuantity = calculateTotalQuantity();

  const calculateShippingFee = () => {
    if (!location) return 0;
    const weight = calculateTotalWeight();
    const rates = shippingRates[location as keyof typeof shippingRates];

    if (weight <= 3) return rates['3'];
    if (weight <= 5) return rates['5'];
    if (weight <= 10) return rates['10'];
    if (weight <= 19) return rates['19'];
    return rates['19'];
  };

  const shippingFee = calculateShippingFee();
  const grandTotal = totalPrice + shippingFee;

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleProceedToPayment = () => {
    setStep('payment');
    onStepChange?.('payment');
  };

  const handlePlaceOrder = () => {
    const deliveryInfo = `\nLocation: ${location}\nTotal Weight: ${calculateTotalWeight().toFixed(1)}kg\nShipping Fee: ₱${shippingFee}`;

    const orderDetails = `
ZWEREN ORDER

Customer: ${customerName}
Contact: ${contactNumber}
Service: ${serviceType === 'regular' ? 'Regular Delivery' : 'Cash on Delivery'}
Address: ${address}${landmark ? `\nLandmark: ${landmark}` : ''}${deliveryInfo}

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

SUBTOTAL: ₱${subtotal}
${discountTotal > 0 ? `DISCOUNT${appliedCoupon ? ` (${appliedCoupon.code})` : ''}: -₱${discountTotal}\n` : ''}SHIPPING: ₱${shippingFee}
TOTAL: ₱${grandTotal}

Payment: ${serviceType === 'cod' ? 'Cash on Delivery' : (selectedPaymentMethod?.name || 'GCash')}
${serviceType === 'regular' ? 'Payment Screenshot: Please attach your payment receipt screenshot' : 'Pay when your item arrives!'}

${notes ? `Notes: ${notes}` : ''}

Please confirm this order to proceed. Elevate your style with ZWEREN!
    `.trim();

    const encodedMessage = encodeURIComponent(orderDetails);
    const messengerUrl = `https://m.me/ZwerenPh?text=${encodedMessage}`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = messengerUrl;
    } else {
      window.open(messengerUrl, '_blank');
    }
  };

  const isDetailsValid = customerName && contactNumber && address && location;

  if (step === 'details') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center mb-10 border-b border-shein-border pb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-black hover:text-shein-red transition-colors duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
          </button>
          <h1 className="text-2xl font-black text-black ml-8 uppercase tracking-tight font-montserrat">Order Information</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-black text-zweren-black mb-6 uppercase tracking-widest font-montserrat border-b border-zweren-silver pb-2">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-zweren-silver/30">
                  <div className="flex-1">
                    <h4 className="font-medium text-black text-sm">{item.name}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                      {(item.weight || 0.5)}kg
                    </p>
                  </div>
                  <span className="font-black text-zweren-black font-montserrat text-sm">₱{item.totalPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t-2 border-zweren-black pt-4">
              <div className="flex items-center justify-between text-sm font-bold text-gray-600">
                <span>Total Items:</span>
                <span className={totalQuantity > 9 ? 'text-shein-red' : ''}>{totalQuantity} / 9 max</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-gray-600">
                <span>Weight:</span>
                <span>{calculateTotalWeight().toFixed(1)}kg</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-gray-600">
                <span>Subtotal:</span>
                <span>₱{subtotal}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex items-center justify-between text-sm font-bold text-shein-red">
                  <span>Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ''}:</span>
                  <span>-₱{discountTotal}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center justify-between text-sm font-bold text-zweren-lavender">
                  <span>Shipping ({location}):</span>
                  <span>₱{shippingFee}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-2xl font-black text-zweren-black font-montserrat pt-2">
                <span>Total:</span>
                <span>₱{grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-black text-zweren-black mb-6 uppercase tracking-widest font-montserrat border-b border-zweren-silver pb-2">Information</h2>

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
                <label className="block text-[11px] font-black text-black mb-4 uppercase tracking-widest font-montserrat">Service Option *</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'regular', label: 'Regular Delivery', icon: '🛵' },
                    { value: 'cod', label: 'Cash on Delivery', icon: '💸' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setServiceType(option.value as ServiceType)}
                      className={`p-6 border transition-all duration-300 ${serviceType === option.value
                        ? 'border-black bg-black text-white'
                        : 'border-shein-border bg-white text-gray-400 hover:border-black hover:text-black'
                        }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
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

              {totalQuantity > 9 && (
                <div className="p-4 bg-shein-red/10 border border-shein-red rounded-sm">
                  <p className="text-[10px] font-black text-shein-red uppercase tracking-widest text-center">
                    ⚠️ Order Limit: Max 9 items per package
                  </p>
                  <p className="text-[9px] text-shein-red/70 font-bold uppercase tracking-wider text-center mt-1">
                    Please go back and reduce items in your bag
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={!isDetailsValid || totalQuantity > 9}
                className={`w-full py-5 rounded-sm font-black text-xs uppercase tracking-[0.3em] font-montserrat transition-all duration-300 transform ${isDetailsValid && totalQuantity <= 9
                  ? 'bg-black text-white hover:bg-shein-red active:scale-95 shadow-md'
                  : 'bg-shein-gray text-gray-300 cursor-not-allowed border border-shein-border'
                  }`}
              >
                {totalQuantity > 9 ? 'Limit Exceeded' : 'Go to Payment'}
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
      <div className="flex items-center mb-10 border-b border-shein-border pb-6">
        <button
          onClick={() => setStep('details')}
          className="flex items-center space-x-2 text-black hover:text-shein-red transition-colors duration-300"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>
        <h1 className="text-2xl font-black text-black ml-8 uppercase tracking-tight font-montserrat">
          {serviceType === 'cod' ? 'Confirm Order' : 'Payment Method'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Details */}
        <div className="bg-white border border-shein-border p-6 shadow-sm">
          {serviceType === 'regular' ? (
            <>
              <h2 className="text-xl font-black text-black mb-6 uppercase tracking-widest font-montserrat border-b border-shein-border pb-2">Select Payment Method</h2>

              {/* Payment Method Selection */}
              <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPaymentId(method.id)}
                    className={`flex-shrink-0 py-3 px-4 border-2 transition-all duration-300 rounded-sm font-black text-[9px] uppercase tracking-widest whitespace-nowrap ${selectedPaymentId === method.id
                      ? 'border-zweren-black bg-zweren-black text-white shadow-lg'
                      : 'border-zweren-silver bg-white text-gray-400 hover:border-zweren-lavender hover:text-black'
                      }`}
                  >
                    {method.name}
                  </button>
                ))}
              </div>

              {selectedPaymentMethod ? (
                <div className="bg-white border border-black p-8 mb-6 relative overflow-hidden group">
                  <div className="flex items-center space-x-3 mb-6 relative z-10">
                    <div className="w-12 h-12 bg-black flex items-center justify-center">
                      <span className="text-white font-black text-xl">{selectedPaymentMethod.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-black text-black text-lg uppercase tracking-widest font-montserrat">{selectedPaymentMethod.name} Transfer</h3>
                  </div>

                  <div className="bg-shein-gray p-6 mb-6 relative z-10 border border-shein-border">
                    <p className="text-2xl font-black text-black mb-6 text-center tracking-tight font-montserrat">Amount: ₱{grandTotal}</p>

                    <div className="flex justify-center mb-6">
                      <div className="w-64 h-64 border border-black overflow-hidden bg-white p-2 flex items-center justify-center">
                        <img
                          src={selectedPaymentMethod.qr_code_url}
                          alt={`${selectedPaymentMethod.name} QR Code`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] text-zweren-black font-black uppercase tracking-[0.2em] mb-2 font-montserrat">📱 Scan QR Code to Pay</p>
                      <div className="w-12 h-1 bg-zweren-lavender mx-auto rounded-full"></div>
                    </div>
                  </div>

                  <div className="bg-black p-6 space-y-4 relative z-10">
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Number:</span>
                      <span className="font-black text-white tracking-widest text-xs font-montserrat">{selectedPaymentMethod.account_number}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Name:</span>
                      <span className="font-black text-white uppercase text-xs font-montserrat tracking-tight">{selectedPaymentMethod.account_name}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-shein-gray p-12 border-2 border-dashed border-shein-border text-center rounded-sm transition-all duration-300">
                  <div className="animate-pulse mb-4 flex justify-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] font-montserrat">
                    {paymentMethods.length === 0 ? 'Establishing Secure Payment Channels...' : 'Select a payment gateway above'}
                  </p>
                </div>
              )}

              <div className="bg-shein-gray border border-shein-border p-6 mt-6">
                <h4 className="font-black text-black mb-4 flex items-center uppercase tracking-widest text-[11px] font-montserrat">
                  Proof of Payment Required
                </h4>
                <ol className="text-[10px] text-shein-text-gray font-bold space-y-3 list-decimal list-inside uppercase tracking-wider">
                  <li>Scan the QR code or send to number</li>
                  <li>Pay the total amount: <span className="text-black font-black">₱{grandTotal}</span></li>
                  <li>Take a screenshot of successful receipt</li>
                  <li>Attach receipt to Messenger chat</li>
                </ol>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-black text-black mb-6 uppercase tracking-widest font-montserrat border-b border-shein-border pb-2">Cash on Delivery</h2>
              <div className="bg-white border border-black p-8 mb-6 text-center">
                <div className="text-5xl mb-6">🤝</div>
                <h3 className="font-black text-black text-xl uppercase tracking-widest font-montserrat mb-4">Pay when you receive</h3>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wider leading-relaxed">
                  Your order will be processed and delivered to your address. Please prepare the exact amount of <span className="text-black font-black">₱{grandTotal}</span> upon delivery.
                </p>
              </div>
              <div className="bg-shein-gray border border-shein-border p-6">
                <h4 className="font-black text-black mb-4 uppercase tracking-widest text-[11px] font-montserrat">Next Steps</h4>
                <ul className="text-[10px] text-shein-text-gray font-bold space-y-3 list-disc list-inside uppercase tracking-wider">
                  <li>Click "Order via Messenger" to send your details</li>
                  <li>Wait for order confirmation from our team</li>
                  <li>Prepare payment for arrival</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-shein-border p-8 shadow-sm">
          <h2 className="text-xl font-black text-black mb-8 uppercase tracking-widest font-montserrat border-b border-shein-border pb-2">Final Summary</h2>

          <div className="space-y-4 mb-6">
            <div className="bg-shein-gray p-6 border border-shein-border mb-8">
              <h4 className="font-black text-black mb-4 uppercase text-[10px] tracking-widest font-montserrat border-b border-shein-border pb-1">Delivery Details</h4>
              <p className="text-[10px] font-bold text-shein-text-gray uppercase mb-2 tracking-wider"><span className="text-black">Name:</span> {customerName}</p>
              <p className="text-[10px] font-bold text-shein-text-gray uppercase mb-2 tracking-wider"><span className="text-black">Contact:</span> {contactNumber}</p>
              <p className="text-[10px] font-bold text-shein-text-gray uppercase mb-2 tracking-wider"><span className="text-black">Service:</span> {serviceType === 'regular' ? 'Regular Delivery' : 'Cash on Delivery'}</p>
              <p className="text-[10px] font-bold text-shein-text-gray uppercase tracking-wider"><span className="text-black">Address:</span> {address}</p>
              {landmark && (
                <p className="text-[10px] font-bold text-shein-text-gray uppercase mt-2 tracking-wider"><span className="text-black">Landmark:</span> {landmark}</p>
              )}
            </div>
          </div>

          {cartItems.map((item) => {
            return (
              <div key={item.id} className="flex items-center space-x-3 py-2 border-b border-zweren-silver/30">
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
                    <p className="text-sm text-gray-600">Variations: {item.selectedVariations.map(v => v.name).join(' + ')}</p>
                  ) : item.selectedVariation ? (
                    <p className="text-sm text-gray-600">Variation: {item.selectedVariation.name}</p>
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

          <div className="space-y-3 border-t-2 border-black pt-6 mb-10 mt-6 font-bold uppercase tracking-widest text-[10px]">
            <div className="flex items-center justify-between text-shein-text-gray">
              <span>Subtotal</span>
              <span className="font-montserrat">₱{subtotal}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex items-center justify-between text-shein-red">
                <span>Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ''}</span>
                <span className="font-montserrat">-₱{discountTotal}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-black border-b border-shein-border pb-2">
              <span>Shipping Fee</span>
              <span className="font-montserrat">₱{shippingFee}</span>
            </div>
            <div className="flex items-center justify-between text-3xl font-black text-black font-montserrat pt-2">
              <span>Total</span>
              <span className="text-shein-red">₱{grandTotal}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full py-6 rounded-sm font-black text-xs uppercase tracking-[0.3em] font-montserrat transition-all duration-300 transform bg-black text-white hover:bg-shein-red hover:shadow-lg active:scale-95 shadow-md"
          >
            ORDER VIA MESSENGER
          </button>

          <p className="text-[10px] text-shein-text-gray font-bold text-center mt-4 uppercase tracking-widest">
            {serviceType === 'regular' ? 'Send order & receipt screenshot to confirm' : 'Click to send order details via Messenger'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
