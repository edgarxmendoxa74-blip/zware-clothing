import React, { useState } from 'react';
import { ArrowLeft, Search, Save, Package, AlertCircle, RefreshCw } from 'lucide-react';
import { MenuItem } from '../types';
import { useMenu } from '../hooks/useMenu';
import { useCategories } from '../hooks/useCategories';

interface InventoryManagerProps {
    onBack: () => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ onBack }) => {
    const { menuItems, updateMenuItem } = useMenu();
    const { categories } = useCategories();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});
    const [variationStockUpdates, setVariationStockUpdates] = useState<Record<string, Record<string, number>>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Memoize filtered items for performance
    const filteredItems = React.useMemo(() => {
        return menuItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [menuItems, searchTerm, selectedCategory]);

    const handleStockChange = (itemId: string, value: number) => {
        setStockUpdates(prev => ({ ...prev, [itemId]: value }));
    };

    const handleVariationStockChange = (itemId: string, variationId: string, value: number) => {
        setVariationStockUpdates(prev => ({
            ...prev,
            [itemId]: { ...(prev[itemId] || {}), [variationId]: value }
        }));
    };

    // Memoize hasChanges
    const hasChanges = React.useMemo(() =>
        Object.keys(stockUpdates).length > 0 || Object.keys(variationStockUpdates).length > 0
        , [stockUpdates, variationStockUpdates]);

    const handleSaveAll = async () => {
        try {
            setIsSaving(true);
            const updatePromises: Promise<void>[] = [];

            // Parallelize updates with main stock changes
            for (const itemId of Object.keys(stockUpdates)) {
                const item = menuItems.find(i => i.id === itemId);
                if (item) {
                    updatePromises.push(updateMenuItem(itemId, { ...item, stock: stockUpdates[itemId] }));
                }
            }

            // Parallelize updates with variation stock changes
            for (const itemId of Object.keys(variationStockUpdates)) {
                const item = menuItems.find(i => i.id === itemId);
                if (item && item.variations) {
                    const updatedVariations = item.variations.map(v => ({
                        ...v,
                        stock: variationStockUpdates[itemId][v.id] !== undefined
                            ? variationStockUpdates[itemId][v.id]
                            : (v.stock || 0)
                    }));
                    updatePromises.push(updateMenuItem(itemId, { ...item, variations: updatedVariations }));
                }
            }

            // Run all updates in parallel for maximum speed
            await Promise.all(updatePromises);

            alert('✅ Inventory synchronized successfully!');
            setStockUpdates({});
            setVariationStockUpdates({});
        } catch (error) {
            console.error('Inventory save error:', error);
            alert('❌ Failed to update inventory. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span>Back</span>
                            </button>
                            <h1 className="text-2xl font-black text-black uppercase tracking-tighter font-montserrat">Inventory Management</h1>
                        </div>
                        {hasChanges && (
                            <button
                                onClick={handleSaveAll}
                                disabled={isSaving}
                                className="flex items-center space-x-2 bg-zweren-black text-white px-6 py-2 rounded-sm hover:shadow-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest font-montserrat disabled:opacity-50"
                            >
                                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                <span>{isSaving ? 'Syncing...' : 'Save Stock Changes'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search items by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="category-filter" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Filter Category</label>
                        <select
                            id="category-filter"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent min-w-[200px]"
                            title="Filter items by category"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Inventory List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {filteredItems.map(item => {
                            const currentStock = stockUpdates[item.id] !== undefined ? stockUpdates[item.id] : (item.stock || 0);
                            const isLowStock = currentStock < 5;

                            return (
                                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                                                {item.available ? (
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                ) : (
                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4">{categories.find(c => c.id === item.category)?.name}</p>

                                            {item.variations && item.variations.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                                    {item.variations.map(variation => {
                                                        const vStock = variationStockUpdates[item.id]?.[variation.id] !== undefined
                                                            ? variationStockUpdates[item.id][variation.id]
                                                            : (variation.stock || 0);

                                                        return (
                                                            <div key={variation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                                <span className="text-xs font-bold uppercase text-gray-600">{variation.name}</span>
                                                                <div className="flex items-center space-x-3">
                                                                    {vStock < 5 && <AlertCircle className="h-4 w-4 text-orange-500" title="Low Stock" />}
                                                                    <input
                                                                        type="number"
                                                                        value={vStock}
                                                                        onChange={(e) => handleVariationStockChange(item.id, variation.id, Number(e.target.value))}
                                                                        className={`w-20 px-2 py-1 border rounded text-sm font-black text-center ${variationStockUpdates[item.id]?.[variation.id] !== undefined ? 'border-zweren-lavender bg-zweren-lavender/5' : 'border-gray-300'
                                                                            }`}
                                                                        title={`Stock level for ${variation.name}`}
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-4">
                                                    <label className="text-sm font-bold text-gray-600 uppercase">Stock Level:</label>
                                                    <div className="flex items-center space-x-3">
                                                        {currentStock < 5 && <AlertCircle className="h-4 w-4 text-orange-500" title="Low Stock" />}
                                                        <input
                                                            type="number"
                                                            value={currentStock}
                                                            onChange={(e) => handleStockChange(item.id, Number(e.target.value))}
                                                            className={`w-24 px-3 py-2 border rounded-lg text-lg font-black text-center ${stockUpdates[item.id] !== undefined ? 'border-zweren-lavender bg-zweren-lavender/5' : 'border-gray-300'
                                                                }`}
                                                            title={`Stock level for ${item.name}`}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredItems.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No products found with current filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryManager;
