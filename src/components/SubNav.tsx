import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface SubNavProps {
  selectedCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ selectedCategory, onCategoryClick }) => {
  const { categories, loading } = useCategories();

  return (
    <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-zweren-silver/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1.5 scrollbar-hide">
          {loading ? (
            <div className="flex space-x-1.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-6 w-16 bg-zweren-silver/10 rounded-sm animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <button
                onClick={() => onCategoryClick('all')}
                className={`px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-tight transition-all duration-300 border ${selectedCategory === 'all'
                  ? 'bg-zweren-lavender text-black border-zweren-lavender'
                  : 'bg-white text-zweren-black border-zweren-silver/50 hover:border-zweren-lavender'
                  }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCategoryClick(c.id)}
                  className={`px-2.5 py-1 rounded-sm text-[8px] font-black uppercase tracking-tight transition-all duration-300 border flex items-center space-x-1 shadow-sm ${selectedCategory === c.id
                    ? 'bg-zweren-lavender text-black border-zweren-lavender'
                    : 'bg-white text-zweren-black border-zweren-silver/50 hover:border-zweren-lavender'
                    }`}
                >
                  <span className="text-[10px]">{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubNav;


