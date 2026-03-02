import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface MobileNavProps {
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeCategory, onCategoryClick }) => {
  const { categories } = useCategories();

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-shein-border md:hidden shadow-sm">
      <div className="flex overflow-x-auto scrollbar-hide px-4 py-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category.id)}
            className={`flex-shrink-0 flex items-center space-x-2.5 px-6 py-3 rounded-sm mr-4 transition-all duration-300 border shadow-sm ${activeCategory === category.id
              ? 'bg-black text-white border-black'
              : 'bg-shein-gray text-black border-shein-border hover:border-black'
              }`}
          >
            <span className="text-base">{category.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest font-montserrat whitespace-nowrap">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;