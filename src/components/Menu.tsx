import React from 'react';
import { MenuItem, CartItem } from '../types';
import { useCategories } from '../hooks/useCategories';
import MenuItemCard from './MenuItemCard';

// Preload set to track what's already being loaded
const preloadedImages = new Set<string>();

const preloadImages = (items: MenuItem[]) => {
  items.forEach(item => {
    if (item.image && !preloadedImages.has(item.image)) {
      preloadedImages.add(item.image);
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
  loading?: boolean;
  onBuyNow: (item: MenuItem, quantity?: number, variation?: any, addOns?: any[]) => void;
}

const Menu: React.FC<MenuProps> = ({ menuItems, addToCart, onBuyNow, cartItems, updateQuantity, selectedCategory = 'all', loading = false }) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const [activeCategory, setActiveCategory] = React.useState('hot-coffee');

  // Memoize filtered categories and grouped items to avoid unnecessary recalculations
  const filteredCategories = React.useMemo(() => {
    return categories.filter(category => selectedCategory === 'all' || category.id === selectedCategory);
  }, [categories, selectedCategory]);

  const groupedMenuItems = React.useMemo(() => {
    return menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [menuItems]);

  React.useEffect(() => {
    if (menuItems.length === 0) return;

    // Preload images for active category as a priority
    const priorityItems = groupedMenuItems[activeCategory] || [];
    preloadImages(priorityItems);

    // Defer non-priority preloading to idle time
    const otherItems = menuItems.filter(item => item.category !== activeCategory);
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => preloadImages(otherItems));
    } else {
      setTimeout(() => preloadImages(otherItems), 2000);
    }
  }, [menuItems, activeCategory, groupedMenuItems]);

  React.useEffect(() => {
    if (categories.length === 0 || categoriesLoading || loading) return;

    // Use IntersectionObserver for high performance scroll tracking
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -70% 0px',
      threshold: [0, 0.1]
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Find the best entry currently in view
      const visibleEntry = entries.find(entry => entry.isIntersecting);
      if (visibleEntry) {
        setActiveCategory(visibleEntry.target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Re-observe whenever categories or items change and finish rendering
    const timer = setTimeout(() => {
      categories.forEach(cat => {
        const element = document.getElementById(cat.id);
        if (element) observer.observe(element);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [categories, categoriesLoading, loading, groupedMenuItems]);


  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">



        {(categoriesLoading || loading) ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
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
            const categoryItems = groupedMenuItems[category.id] || [];

            if (categoryItems.length === 0) return null;

            return (
              <section key={category.id} id={category.id} className="mb-16">
                {/* Category Header */}
                <div className="flex items-center justify-center mb-10 border-b border-shein-border pb-6">
                  <h3 className="text-2xl font-bold tracking-[0.2em] text-black uppercase font-montserrat">{category.name}</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {categoryItems.map((item) => {
                    const cartItem = cartItems.find(cartItem => cartItem.id === item.id);
                    return (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={addToCart}
                        onBuyNow={onBuyNow}
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