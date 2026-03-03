import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface SubNavProps {
  selectedCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ selectedCategory, onCategoryClick }) => {
  const { categories, loading } = useCategories();

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-shein-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1.5 scrollbar-hide">
          {loading ? (
            <div className="flex space-x-1.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-6 w-16 bg-shein-gray rounded-sm animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <button
                onClick={() => onCategoryClick('all')}
                className={`px-4 py-2 rounded-none text-xs font-bold uppercase tracking-widest transition-all duration-300 border font-montserrat ${selectedCategory === 'all'
                  ? 'bg-shein-gray border-black text-black'
                  : 'bg-white text-black border-shein-border hover:border-black'
                  }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCategoryClick(c.id)}
                  className={`px-4 py-2 rounded-none text-xs font-bold uppercase tracking-widest transition-all duration-300 border flex items-center space-x-2 font-montserrat ${selectedCategory === c.id
                    ? 'bg-shein-gray border-black text-black'
                    : 'bg-white text-black border-shein-border hover:border-black'
                    }`}
                >
                  <span className="text-sm">{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubNav;


