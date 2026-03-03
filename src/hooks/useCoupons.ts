import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Coupon } from '../types';

export const useCoupons = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            const mappedCoupons: Coupon[] = (data || []).map(row => ({
                id: row.id,
                code: row.code,
                discountType: row.discount_type,
                discountValue: row.discount_value,
                minSpend: row.min_spend,
                active: row.active,
                expiresAt: row.expires_at,
                created_at: row.created_at,
                updated_at: row.updated_at
            }));

            setCoupons(mappedCoupons);
            setError(null);
        } catch (err) {
            console.error('Error fetching coupons:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    const addCoupon = async (coupon: Omit<Coupon, 'id'>) => {
        try {
            const { error: insertError } = await supabase
                .from('coupons')
                .insert({
                    code: coupon.code,
                    discount_type: coupon.discountType,
                    discount_value: coupon.discountValue,
                    min_spend: coupon.minSpend,
                    active: coupon.active,
                    expires_at: coupon.expiresAt || null
                });

            if (insertError) throw insertError;
            await fetchCoupons();
        } catch (err) {
            console.error('Error adding coupon:', err);
            throw err;
        }
    };

    const updateCoupon = async (id: string, updates: Partial<Coupon>) => {
        try {
            const dbUpdates: any = {};
            if (updates.code !== undefined) dbUpdates.code = updates.code;
            if (updates.discountType !== undefined) dbUpdates.discount_type = updates.discountType;
            if (updates.discountValue !== undefined) dbUpdates.discount_value = updates.discountValue;
            if (updates.minSpend !== undefined) dbUpdates.min_spend = updates.minSpend;
            if (updates.active !== undefined) dbUpdates.active = updates.active;
            if (updates.expiresAt !== undefined) dbUpdates.expires_at = updates.expiresAt || null;

            const { error: updateError } = await supabase
                .from('coupons')
                .update(dbUpdates)
                .eq('id', id);

            if (updateError) throw updateError;
            await fetchCoupons();
        } catch (err) {
            console.error('Error updating coupon:', err);
            throw err;
        }
    };

    const deleteCoupon = async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('coupons')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            await fetchCoupons();
        } catch (err) {
            console.error('Error deleting coupon:', err);
            throw err;
        }
    };

    const validateCoupon = async (code: string): Promise<Coupon | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', code.toUpperCase())
                .eq('active', true)
                .single();

            if (fetchError) return null;
            if (!data) return null;

            // Check expiry
            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                return null;
            }

            return {
                id: data.id,
                code: data.code,
                discountType: data.discount_type,
                discountValue: data.discount_value,
                minSpend: data.min_spend,
                active: data.active,
                expiresAt: data.expires_at
            };
        } catch (err) {
            return null;
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    return {
        coupons,
        loading,
        error,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        validateCoupon,
        refetch: fetchCoupons
    };
};
