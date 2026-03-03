import React, { useState } from 'react';
import { Plus, Trash2, Tag, Calendar, Check, X, DollarSign, Percent } from 'lucide-react';
import { useCoupons } from '../hooks/useCoupons';
import { Coupon } from '../types';

const CouponManager: React.FC = () => {
    const { coupons, loading, addCoupon, updateCoupon, deleteCoupon } = useCoupons();
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<Omit<Coupon, 'id'>>({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        minSpend: 0,
        active: true,
        expiresAt: ''
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!formData.code) return;
            await addCoupon({
                ...formData,
                code: formData.code.toUpperCase().trim()
            });
            setIsAdding(false);
            setFormData({
                code: '',
                discountType: 'percentage',
                discountValue: 0,
                minSpend: 0,
                active: true,
                expiresAt: ''
            });
        } catch (err) {
            alert('Failed to add coupon. Code might already exist.');
        }
    };

    const handleToggleActive = async (coupon: Coupon) => {
        await updateCoupon(coupon.id, { active: !coupon.active });
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this coupon?')) {
            await deleteCoupon(id);
        }
    };

    if (loading && coupons.length === 0) return <div className="p-8 text-center">Loading coupons...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black text-black uppercase tracking-tight font-montserrat">Coupon Management</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Create and manage promotional discount codes</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-sm hover:bg-shein-red transition-all duration-300 font-black text-[10px] uppercase tracking-widest font-montserrat"
                >
                    <Plus className="h-4 w-4" />
                    <span>New Coupon</span>
                </button>
            </div>

            {isAdding && (
                <div className="mb-8 bg-shein-gray p-8 border border-shein-border animate-in slide-in-from-top duration-300">
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-black mb-2 uppercase tracking-widest">Coupon Code *</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                className="w-full px-4 py-3 border border-shein-border focus:border-black outline-none font-bold uppercase text-xs"
                                placeholder="PROMO2026"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-black mb-2 uppercase tracking-widest">Discount Type *</label>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                                    className={`flex-1 flex items-center justify-center space-x-2 py-3 border transition-all ${formData.discountType === 'percentage' ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-shein-border'}`}
                                >
                                    <Percent className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Percentage</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                                    className={`flex-1 flex items-center justify-center space-x-2 py-3 border transition-all ${formData.discountType === 'fixed' ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-shein-border'}`}
                                >
                                    <DollarSign className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Fixed Amount</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-black mb-2 uppercase tracking-widest">Discount Value *</label>
                            <input
                                type="number"
                                value={formData.discountValue || ''}
                                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                className="w-full px-4 py-3 border border-shein-border focus:border-black outline-none font-black text-xs"
                                placeholder={formData.discountType === 'percentage' ? '20 (%)' : '50 (₱)'}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-black mb-2 uppercase tracking-widest">Min. Spend (Optional)</label>
                            <input
                                type="number"
                                value={formData.minSpend || ''}
                                onChange={(e) => setFormData({ ...formData, minSpend: Number(e.target.value) })}
                                className="w-full px-4 py-3 border border-shein-border focus:border-black outline-none font-black text-xs"
                                placeholder="500"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-black mb-2 uppercase tracking-widest">Expiry Date (Optional)</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="datetime-local"
                                    value={formData.expiresAt}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-shein-border focus:border-black outline-none font-bold text-xs"
                                    title="Expiry Date"
                                />
                            </div>
                        </div>

                        <div className="flex items-end space-x-3">
                            <button
                                type="submit"
                                className="flex-1 bg-black text-white py-3 font-black text-[10px] uppercase tracking-widest font-montserrat hover:bg-shein-red transition-all"
                            >
                                Create Coupon
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-6 py-3 border border-shein-border text-gray-400 hover:text-black hover:border-black transition-all"
                                title="Cancel"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white border border-shein-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-shein-gray border-b border-shein-border">
                            <th className="px-6 py-4 text-[10px] font-black text-black uppercase tracking-widest">Code</th>
                            <th className="px-6 py-4 text-[10px] font-black text-black uppercase tracking-widest">Discount</th>
                            <th className="px-6 py-4 text-[10px] font-black text-black uppercase tracking-widest">Min. Spend</th>
                            <th className="px-6 py-4 text-[10px] font-black text-black uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-black uppercase tracking-widest">Expires</th>
                            <th className="px-6 py-4 text-[10px] font-black text-black uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-shein-border">
                        {coupons.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No coupons found</td>
                            </tr>
                        ) : (
                            coupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-shein-gray/50 transition-colors duration-200">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <Tag className="h-3 w-3 text-shein-red" />
                                            <span className="font-black text-sm tracking-tight">{coupon.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-black">
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₱${coupon.discountValue}`}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                                        {coupon.minSpend > 0 ? `₱${coupon.minSpend}` : '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleActive(coupon)}
                                            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${coupon.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                                        >
                                            {coupon.active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            <span>{coupon.active ? 'Active' : 'Inactive'}</span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">
                                        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="p-2 text-gray-400 hover:text-shein-red transition-colors"
                                            title="Delete Coupon"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CouponManager;
