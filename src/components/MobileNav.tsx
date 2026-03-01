import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface MobileNavProps {
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeCategory, onCategoryClick }) => {
  const { categories } = useCategories();

  return (
    <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-zweren-silver/50 md:hidden shadow-sm">
      <div className="flex overflow-x-auto scrollbar-hide px-4 py-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category.id)}
            className={`flex-shrink-0 flex items-center space-x-2.5 px-6 py-3 rounded-sm mr-4 transition-all duration-500 border border-transparent shadow-sm ${activeCategory === category.id
                ? 'bg-zweren-lavender text-black shadow-lg shadow-zweren-lavender/20 border-zweren-lavender'
                : 'bg-zweren-gray text-zweren-black border-zweren-silver/50 hover:border-zweren-lavender hover:bg-white'
              }`}
          >
            <span className="text-base">{category.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest italic whitespace-nowrap">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;