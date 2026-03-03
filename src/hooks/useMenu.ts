import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MenuItem, Variation, AddOn } from '../types';

// Helper: map DB row → MenuItem (camelCase frontend type)
const mapRowToMenuItem = (row: any, variations: Variation[], addOns: AddOn[]): MenuItem => {
    const now = new Date().toISOString();
    const isOnDiscount =
        !!row.discount_active &&
        !!row.discount_price &&
        row.discount_price < row.base_price &&
        (!row.discount_start_date || new Date(row.discount_start_date) <= new Date(now)) &&
        (!row.discount_end_date || new Date(row.discount_end_date) >= new Date(now));

    return {
        id: row.id,
        name: row.name,
        description: row.description,
        basePrice: row.base_price,
        category: row.category,
        image: row.image_url || undefined,
        images: row.images || [],
        popular: row.popular ?? false,
        available: row.available ?? true,
        weight: row.weight ?? 0.5,
        discountPrice: row.discount_price ?? undefined,
        discountStartDate: row.discount_start_date ?? undefined,
        discountEndDate: row.discount_end_date ?? undefined,
        discountActive: row.discount_active ?? false,
        effectivePrice: isOnDiscount ? row.discount_price : row.base_price,
        isOnDiscount,
        variations,
        addOns,
        stock: row.stock ?? 0,
    };
};

export const useMenu = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMenuItems = async () => {
        try {
            setLoading(true);

            // Fetch menu items, their variations, and their add-ons in parallel
            const [itemsRes, variationsRes, addOnsRes] = await Promise.all([
                supabase.from('menu_items').select('*').order('created_at', { ascending: true }),
                supabase.from('variations').select('*'),
                supabase.from('add_ons').select('*'),
            ]);

            if (itemsRes.error) throw itemsRes.error;
            if (variationsRes.error) throw variationsRes.error;
            if (addOnsRes.error) throw addOnsRes.error;

            const items = (itemsRes.data || []).map((row) => {
                const variations: Variation[] = (variationsRes.data || [])
                    .filter((v: any) => v.menu_item_id === row.id)
                    .map((v: any) => ({
                        id: v.id,
                        name: v.name,
                        price: v.price,
                        image: v.image || undefined,
                        stock: v.stock ?? 0,
                    }));

                const addOns: AddOn[] = (addOnsRes.data || [])
                    .filter((a: any) => a.menu_item_id === row.id)
                    .map((a: any) => ({
                        id: a.id,
                        name: a.name,
                        price: a.price,
                        category: a.category,
                    }));

                return mapRowToMenuItem(row, variations, addOns);
            });

            setMenuItems(items);
            setError(null);
        } catch (err) {
            console.error('Error fetching menu items:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch menu items');
        } finally {
            setLoading(false);
        }
    };

    const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
        // Insert main menu item row
        const { data: newRow, error: insertError } = await supabase
            .from('menu_items')
            .insert({
                name: item.name,
                description: item.description,
                base_price: item.basePrice,
                category: item.category,
                image_url: item.image || null,
                images: item.images || [],
                popular: item.popular ?? false,
                available: item.available ?? true,
                weight: item.weight ?? 0.5,
                discount_price: item.discountPrice ?? null,
                discount_start_date: item.discountStartDate ?? null,
                discount_end_date: item.discountEndDate || null,
                discount_active: item.discountActive ?? false,
                stock: item.stock ?? 0,
            })
            .select()
            .single();

        if (insertError) throw insertError;

        const menuItemId = newRow.id;

        // Insert variations
        if (item.variations && item.variations.length > 0) {
            const { error: varError } = await supabase.from('variations').insert(
                item.variations.map((v) => ({
                    menu_item_id: menuItemId,
                    name: v.name,
                    price: v.price,
                    image: v.image || null,
                    stock: v.stock ?? 0,
                }))
            );
            if (varError) throw varError;
        }

        // Insert add-ons
        if (item.addOns && item.addOns.length > 0) {
            const { error: addOnError } = await supabase.from('add_ons').insert(
                item.addOns.map((a) => ({
                    menu_item_id: menuItemId,
                    name: a.name,
                    price: a.price,
                    category: a.category,
                }))
            );
            if (addOnError) throw addOnError;
        }

        await fetchMenuItems();
        return newRow;
    };

    const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
        // Update main menu item row
        const { error: updateError } = await supabase
            .from('menu_items')
            .update({
                name: updates.name,
                description: updates.description,
                base_price: updates.basePrice,
                category: updates.category,
                image_url: updates.image ?? null,
                images: updates.images ?? [],
                popular: updates.popular,
                available: updates.available,
                weight: updates.weight,
                discount_price: updates.discountPrice ?? null,
                discount_start_date: updates.discountStartDate ?? null,
                discount_end_date: updates.discountEndDate ?? null,
                discount_active: updates.discountActive ?? false,
                stock: updates.stock,
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // Replace variations: delete old, insert new
        if (updates.variations !== undefined) {
            const { error: delVarError } = await supabase
                .from('variations')
                .delete()
                .eq('menu_item_id', id);
            if (delVarError) throw delVarError;

            if (updates.variations.length > 0) {
                const { error: insVarError } = await supabase.from('variations').insert(
                    updates.variations.map((v) => ({
                        menu_item_id: id,
                        name: v.name,
                        price: v.price,
                        image: v.image || null,
                        stock: v.stock ?? 0,
                    }))
                );
                if (insVarError) throw insVarError;
            }
        }

        // Replace add-ons: delete old, insert new
        if (updates.addOns !== undefined) {
            const { error: delAddOnError } = await supabase
                .from('add_ons')
                .delete()
                .eq('menu_item_id', id);
            if (delAddOnError) throw delAddOnError;

            if (updates.addOns.length > 0) {
                const { error: insAddOnError } = await supabase.from('add_ons').insert(
                    updates.addOns.map((a) => ({
                        menu_item_id: id,
                        name: a.name,
                        price: a.price,
                        category: a.category,
                    }))
                );
                if (insAddOnError) throw insAddOnError;
            }
        }

        await fetchMenuItems();
    };

    const deleteMenuItem = async (id: string) => {
        // Variations and add-ons should cascade delete via DB foreign keys,
        // but we delete them explicitly as a safety measure.
        await supabase.from('variations').delete().eq('menu_item_id', id);
        await supabase.from('add_ons').delete().eq('menu_item_id', id);

        const { error: deleteError } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        await fetchMenuItems();
    };

    useEffect(() => {
        fetchMenuItems();
    }, []);

    return {
        menuItems,
        loading,
        error,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        refetch: fetchMenuItems,
    };
};
