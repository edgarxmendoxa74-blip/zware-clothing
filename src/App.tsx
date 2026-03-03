import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import Header from './components/Header';
import SubNav from './components/SubNav';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import FloatingCartButton from './components/FloatingCartButton';
import AdminDashboard from './components/AdminDashboard';
import Hero from './components/Hero';
import StepIndicator from './components/StepIndicator';
import { useMenu } from './hooks/useMenu';

function MainApp() {
  const cart = useCart();
  const { menuItems } = useMenu();
  const [currentView, setCurrentView] = React.useState<'menu' | 'cart' | 'checkout'>('menu');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [checkoutStep, setCheckoutStep] = React.useState<'details' | 'payment'>('details');

  const handleViewChange = (view: 'menu' | 'cart' | 'checkout') => {
    setCurrentView(view);
    if (view !== 'checkout') {
      setCheckoutStep('details');
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const getStepNumber = (): 1 | 2 | 3 | 4 => {
    if (currentView === 'menu') return 1;
    if (currentView === 'cart') return 2;
    if (currentView === 'checkout') {
      return checkoutStep === 'details' ? 3 : 4;
    }
    return 1;
  };

  return (
    <div className="min-h-screen bg-zweren-gray font-inter">
      <Header
        cartItemsCount={cart.getTotalItems()}
        onCartClick={() => handleViewChange('cart')}
        onMenuClick={() => handleViewChange('menu')}
      />

      <StepIndicator currentStep={getStepNumber()} />

      {currentView === 'menu' && (
        <SubNav
          selectedCategory={selectedCategory}
          onCategoryClick={handleCategoryClick}
        />
      )}

      {currentView === 'menu' && <Hero />}

      {currentView === 'menu' && (
        <Menu
          menuItems={menuItems}
          addToCart={cart.addToCart}
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
          selectedCategory={selectedCategory}
        />
      )}

      {currentView === 'cart' && (
        <Cart
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
          removeFromCart={cart.removeFromCart}
          clearCart={cart.clearCart}
          getTotalPrice={cart.getTotalPrice}
          onContinueShopping={() => handleViewChange('menu')}
          onCheckout={() => handleViewChange('checkout')}
        />
      )}

      {currentView === 'checkout' && (
        <Checkout
          cartItems={cart.cartItems}
          totalPrice={cart.getTotalPrice()}
          onBack={() => handleViewChange('cart')}
          onStepChange={setCheckoutStep}
        />
      )}

      {currentView === 'menu' && (
        <FloatingCartButton
          itemCount={cart.getTotalItems()}
          onCartClick={() => handleViewChange('cart')}
        />
      )}

    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;