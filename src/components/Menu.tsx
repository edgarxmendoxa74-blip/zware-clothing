import React from 'react';
import { MenuItem, CartItem } from '../types';
import { useCategories } from '../hooks/useCategories';
import MenuItemCard from './MenuItemCard';

// Preload images for better performance
const preloadImages = (items: MenuItem[]) => {
  items.forEach(item => {
    if (item.image) {
      const img = new Image();
      img.src = item.image;
    }
  });
};

interface MenuProps {
  menuItems: MenuItem[];
  addToCart: (item: MenuItem, quantity?: number, variation?: any, addOns?: any[]) => void;
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  selectedCategory?: string;
}

const Menu: React.FC<MenuProps> = ({ menuItems, addToCart, cartItems, updateQuantity, selectedCategory = 'all' }) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const [activeCategory, setActiveCategory] = React.useState('hot-coffee');

  // Memoize filtered categories to avoid unnecessary recalculations
  const filteredCategories = React.useMemo(() => {
    return categories.filter(category => selectedCategory === 'all' || category.id === selectedCategory);
  }, [categories, selectedCategory]);

  // Preload images when menu items change
  React.useEffect(() => {
    if (menuItems.length > 0) {
      // Preload images for visible category first
      const visibleItems = menuItems.filter(item => item.category === activeCategory);
      preloadImages(visibleItems);

      // Then preload other images after a short delay
      setTimeout(() => {
        const otherItems = menuItems.filter(item => item.category !== activeCategory);
        preloadImages(otherItems);
      }, 1000);
    }
  }, [menuItems, activeCategory]);

  React.useEffect(() => {
    if (categories.length > 0) {
      // Set default to dim-sum if it exists, otherwise first category
      const defaultCategory = categories.find(cat => cat.id === 'dim-sum') || categories[0];
      if (!categories.find(cat => cat.id === activeCategory)) {
        setActiveCategory(defaultCategory.id);
      }
    }
  }, [categories, activeCategory]);

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = categories.map(cat => document.getElementById(cat.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveCategory(categories[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* How to Order Section */}
        <div className="mb-6 bg-white rounded-sm shadow-md p-3 border border-zweren-silver/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-zweren-lavender/5 blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-4 gap-2">
            {/* Step 1 */}
            <div className="text-center flex flex-col items-center">
              <span className="text-sm mb-1">📱</span>
              <h4 className="font-black text-zweren-black text-[8px] uppercase">1. Browse</h4>
            </div>

            {/* Step 2 */}
            <div className="text-center flex flex-col items-center">
              <span className="text-sm mb-1">👕</span>
              <h4 className="font-black text-zweren-black text-[8px] uppercase">2. Choose</h4>
            </div>

            {/* Step 3 */}
            <div className="text-center flex flex-col items-center">
              <span className="text-sm mb-1">🛒</span>
              <h4 className="font-black text-zweren-black text-[8px] uppercase">3. Add</h4>
            </div>

            {/* Step 4 */}
            <div className="text-center flex flex-col items-center">
              <span className="text-sm mb-1">✅</span>
              <h4 className="font-black text-zweren-black text-[8px] uppercase">4. Pay</h4>
            </div>
          </div>
        </div>

        {categoriesLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-24" />
                    <div className="h-10 bg-gray-200 rounded w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          filteredCategories.map((category) => {
            const categoryItems = menuItems.filter(item => item.category === category.id);

            if (categoryItems.length === 0) return null;

            return (
              <section key={category.id} id={category.id} className="mb-16">
                {/* Hide category headers on mobile since they're in the sticky nav */}
                <div className="hidden md:flex items-center mb-10 border-l-4 border-zweren-lavender pl-6">
                  <span className="text-3xl mr-4">{category.icon}</span>
                  <h3 className="text-3xl font-black italic tracking-tighter text-zweren-black uppercase">{category.name}</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {categoryItems.map((item) => {
                    const cartItem = cartItems.find(cartItem => cartItem.id === item.id);
                    return (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={addToCart}
                        quantity={cartItem?.quantity || 0}
                        onUpdateQuantity={updateQuantity}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </main>
    </>
  );
};

export default Menu;