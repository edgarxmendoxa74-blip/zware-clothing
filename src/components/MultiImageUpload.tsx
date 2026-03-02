import React, { useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';

interface MultiImageUploadProps {
    images?: string[];
    onImagesChange: (images: string[]) => void;
    className?: string;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
    images = [],
    onImagesChange,
    className = ''
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { deleteImage } = useImageUpload();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsLoading(true);

        const newImages = [...images];

        // Process each file
        const filePromises = Array.from(files).map(file => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error('Failed to read image file'));
                reader.readAsDataURL(file);
            });
        });

        try {
            const results = await Promise.all(filePromises);
            onImagesChange([...newImages, ...results]);
        } catch (error) {
            alert('Failed to read one or more image files');
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = async (index: number) => {
        const imageUrl = images[index];
        const newImages = images.filter((_, i) => i !== index);

        // Proactively call delete if it looks like a supabase URL, 
        // but for base64 or other URLs we just update the list
        if (imageUrl && imageUrl.includes('supabase.co')) {
            try {
                await deleteImage(imageUrl);
            } catch (error) {
                console.error('Error removing image from storage:', error);
            }
        }

        onImagesChange(newImages);
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <label className="block text-[11px] font-black text-zweren-black uppercase tracking-widest font-montserrat">
                Product Images (Shopee Style)
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((image, index) => (
                    <div key={`${image}-${index}`} className="relative group aspect-square">
                        <img
                            src={image}
                            alt={`Product preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-sm border border-zweren-silver transition-all duration-300 group-hover:opacity-75"
                            loading="lazy"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 shadow-md z-10"
                            title="Remove image"
                        >
                            <X className="h-3 w-3" />
                        </button>
                        {index === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-zweren-black/70 text-white text-[8px] font-black uppercase tracking-widest py-1 text-center">
                                Main Image
                            </div>
                        )}
                    </div>
                ))}

                {/* Add more Button */}
                <button
                    type="button"
                    onClick={triggerFileSelect}
                    disabled={isLoading}
                    className="aspect-square border-2 border-dashed border-zweren-silver rounded-sm flex flex-col items-center justify-center hover:border-zweren-lavender hover:bg-zweren-gray/30 transition-all duration-500 group disabled:opacity-50"
                >
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zweren-lavender"></div>
                    ) : (
                        <>
                            <Plus className="h-6 w-6 text-zweren-gray group-hover:text-zweren-lavender transition-colors duration-500" />
                            <span className="text-[9px] font-black text-zweren-gray uppercase tracking-widest mt-1 group-hover:text-zweren-black transition-colors duration-500">
                                Add Photo
                            </span>
                        </>
                    )}
                </button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={isLoading}
                title="Upload images"
            />

            {/* URL Input Helper */}
            <div className="mt-6 pt-4 border-t border-zweren-silver/50">
                <label className="block text-[10px] font-bold text-zweren-gray uppercase tracking-widest mb-2">
                    Or Add via URL
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        id="image-url-input"
                        title="Image URL"
                        className="flex-1 px-4 py-2 border border-zweren-silver rounded-sm focus:ring-1 focus:ring-zweren-lavender focus:border-zweren-lavender bg-zweren-gray/20 text-[10px] font-bold"
                        placeholder="https://example.com/image.jpg"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.currentTarget as HTMLInputElement;
                                if (input.value) {
                                    onImagesChange([...images, input.value]);
                                    input.value = '';
                                }
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => {
                            const input = document.getElementById('image-url-input') as HTMLInputElement;
                            if (input.value) {
                                onImagesChange([...images, input.value]);
                                input.value = '';
                            }
                        }}
                        className="px-4 py-2 bg-zweren-black text-white rounded-sm hover:bg-zweren-lavender hover:text-black transition-all duration-500 font-black text-[9px] uppercase tracking-widest"
                    >
                        Add URL
                    </button>
                </div>
                <p className="text-[9px] text-zweren-gray mt-2 font-medium">
                    💡 The first image in the grid will be used as the main cover photo for the product card.
                </p>
            </div>
        </div>
    );
};

export default MultiImageUpload;
