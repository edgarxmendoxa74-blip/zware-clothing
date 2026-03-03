import React, { useState } from 'react';
import { Save, Upload, X, Loader } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useImageUpload } from '../hooks/useImageUpload';
import MultiImageUpload from './MultiImageUpload';

const SiteSettingsManager: React.FC = () => {
  const { siteSettings, loading, updateSiteSettings } = useSiteSettings();
  const { uploadImage, uploading } = useImageUpload();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    site_name: '',
    site_description: '',
    currency: '',
    currency_code: '',
    hero_subtitle: '',
    hero_images: [] as string[]
  });
  const [heroFiles, setHeroFiles] = useState<File[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  React.useEffect(() => {
    if (siteSettings) {
      setFormData({
        site_name: siteSettings.site_name,
        site_description: siteSettings.site_description,
        currency: siteSettings.currency,
        currency_code: siteSettings.currency_code,
        hero_subtitle: siteSettings.hero_subtitle || '',
        hero_images: siteSettings.hero_images || []
      });
      setLogoPreview(siteSettings.site_logo);
    }
  }, [siteSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let logoUrl = logoPreview;

      // Upload new logo if selected
      if (logoFile) {
        try {
          console.log('Uploading logo...');
          const uploadedUrl = await uploadImage(logoFile);
          logoUrl = uploadedUrl;
          console.log('Logo uploaded successfully:', uploadedUrl);
        } catch (uploadError) {
          console.error('Logo upload error:', uploadError);
          alert(`❌ Failed to upload logo: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}\n\nPlease try again or use a different image.`);
          setIsSaving(false);
          return; // Don't proceed if logo upload fails
        }
      }

      // Handle Hero Images Upload
      const finalHeroImages = [...formData.hero_images];

      // We need to match base64 previews with their corresponding File objects
      // To simplify, if heroFiles has content, we'll upload them
      if (heroFiles.length > 0) {
        console.log(`Uploading ${heroFiles.length} hero images...`);
        const uploadPromises = heroFiles.map(file => uploadImage(file));
        const uploadedUrls = await Promise.all(uploadPromises);

        // Filter out base64 strings and add new URLs
        // Note: This logic assumes all base64s should be replaced by the newly uploaded ones
        // If the user mixed existing URLs and new files, we'd need more complex matching.
        // For now, let's replace matches or append.

        const nonBase64Images = finalHeroImages.filter(img => !img.startsWith('data:image'));
        finalHeroImages.length = 0;
        finalHeroImages.push(...nonBase64Images, ...uploadedUrls);
      }

      // Update all settings
      console.log('Updating settings...');
      await updateSiteSettings({
        site_name: formData.site_name,
        site_description: formData.site_description,
        currency: formData.currency,
        currency_code: formData.currency_code,
        site_logo: logoUrl,
        hero_subtitle: formData.hero_subtitle,
        hero_images: finalHeroImages
      });

      alert('✅ Site settings saved successfully! The changes will appear after page refresh.');
      setIsEditing(false);
      setLogoFile(null);
      setHeroFiles([]);

      // Refresh page to show updated settings
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error saving site settings:', error);
      alert(`❌ Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (siteSettings) {
      setFormData({
        site_name: siteSettings.site_name,
        site_description: siteSettings.site_description,
        currency: siteSettings.currency,
        currency_code: siteSettings.currency_code,
        hero_subtitle: siteSettings.hero_subtitle || '',
        hero_images: siteSettings.hero_images || []
      });
      setLogoPreview(siteSettings.site_logo);
    }
    setIsEditing(false);
    setLogoFile(null);
    setHeroFiles([]);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-sm shadow-2xl p-8 border border-zweren-silver">
      {/* Saving Indicator */}
      {isSaving && (
        <div className="bg-zweren-gray border-l-4 border-zweren-lavender rounded-sm p-6 mb-10 flex items-center space-x-5 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-zweren-lavender/5 animate-pulse"></div>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-zweren-lavender border-t-transparent relative z-10"></div>
          <div className="relative z-10">
            <p className="font-black text-[11px] text-zweren-black uppercase tracking-[0.2em] font-montserrat">
              {uploading ? 'Processing Assets...' : 'Syncing Brand Profile...'}
            </p>
            <p className="text-[9px] text-zweren-gray font-bold uppercase mt-1 tracking-wider">Establishing new identity parameters.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-10">
        <h2 className="text-xl font-black text-zweren-black uppercase tracking-tighter font-montserrat">Store Settings</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-zweren-black text-white px-8 py-3 rounded-sm hover:bg-zweren-lavender hover:text-black transition-all duration-700 flex items-center space-x-3 font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 border border-transparent hover:border-zweren-lavender/30"
          >
            <Save className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="bg-gray-100 text-gray-500 px-6 py-3 rounded-sm hover:bg-gray-200 transition-all duration-300 flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              <span>Discard</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || uploading}
              className="bg-zweren-black text-white px-10 py-3 rounded-sm hover:bg-zweren-lavender hover:text-black transition-all duration-700 flex items-center space-x-3 font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl disabled:opacity-50 active:scale-95 border border-transparent hover:border-zweren-lavender/30"
            >
              {isSaving || uploading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin text-zweren-lavender" />
                  <span>{uploading ? 'Uploading...' : 'Processing...'}</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Commit Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Site Logo */}
        <div>
          <label className="block text-[11px] font-black text-zweren-black mb-3 uppercase tracking-widest font-montserrat">
            Brand Identity
          </label>
          <div className="flex items-center space-x-6 bg-zweren-gray/50 p-6 rounded-sm border border-zweren-silver/50">
            <div className="w-24 h-24 rounded-sm overflow-hidden bg-white flex items-center justify-center ring-1 ring-zweren-silver shadow-2xl">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Site Logo"
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`text-4xl font-black text-zweren-black font-montserrat ${logoPreview ? 'hidden' : ''}`}>Z</div>
            </div>
            <div className="flex-1">
              {isEditing && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                    disabled={isSaving || uploading}
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`bg-white text-zweren-black px-6 py-3 rounded-sm hover:border-zweren-lavender transition-all duration-500 flex items-center space-x-3 cursor-pointer border border-zweren-silver font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-[0_0_20px_rgba(188,166,255,0.2)] ${isSaving || uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    <Upload className="h-4 w-4" />
                    <span>{uploading ? 'Uploading...' : 'Update Logo'}</span>
                  </label>
                  <p className="text-[9px] text-gray-400 mt-3 font-bold uppercase tracking-tighter">
                    Optimal: 512x512px • JPG, PNG, WebP
                  </p>
                  {logoFile && (
                    <p className="text-[9px] text-zweren-lavender mt-3 font-black uppercase tracking-[0.2em] font-montserrat animate-pulse">
                      ✓ Ready: {logoFile.name}
                    </p>
                  )}
                </div>
              )}
              {!isEditing && (
                <div>
                  <p className="text-[10px] font-black text-zweren-black uppercase tracking-widest">Active Identity</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Logo displayed across all channels</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Site Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="site_name"
              value={formData.site_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-zweren-silver rounded-sm focus:ring-1 focus:ring-zweren-lavender focus:border-zweren-lavender bg-zweren-gray/20 text-xs font-black uppercase tracking-[0.2em] font-montserrat"
              placeholder="Enter store name"
            />
          ) : (
            <p className="text-base font-black text-zweren-black uppercase font-montserrat">{siteSettings?.site_name?.replace(/ Ph$/i, '')}</p>
          )}
        </div>

        {/* Site Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Description
          </label>
          {isEditing ? (
            <textarea
              name="site_description"
              value={formData.site_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-zweren-silver rounded-sm focus:ring-1 focus:ring-zweren-lavender focus:border-zweren-lavender bg-zweren-gray/20 text-[10px] font-bold uppercase tracking-widest leading-relaxed"
              placeholder="Enter brand description"
            />
          ) : (
            <p className="text-xs text-gray-500 font-medium leading-relaxed">{siteSettings?.site_description}</p>
          )}
        </div>

        {/* Currency Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency Symbol
            </label>
            {isEditing ? (
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-zweren-silver rounded-sm focus:ring-1 focus:ring-zweren-lavender focus:border-zweren-lavender bg-zweren-gray/20 text-xs font-black font-montserrat"
                placeholder="e.g., ₱, $, €"
              />
            ) : (
              <p className="text-base font-black text-zweren-black">{siteSettings?.currency}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency Code
            </label>
            {isEditing ? (
              <input
                type="text"
                name="currency_code"
                value={formData.currency_code}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-zweren-silver rounded-sm focus:ring-1 focus:ring-zweren-lavender focus:border-zweren-lavender bg-zweren-gray/20 text-xs font-black tracking-widest font-montserrat"
                placeholder="e.g., PHP, USD, EUR"
              />
            ) : (
              <p className="text-lg font-medium text-black">{siteSettings?.currency_code}</p>
            )}
          </div>
        </div>

        {/* Hero Settings */}
        <div className="pt-6 border-t border-zweren-silver/50">
          <h3 className="text-lg font-black text-zweren-black mb-6 uppercase tracking-tighter font-montserrat">Hero Section Customization</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Subtitle
              </label>
              {isEditing ? (
                <textarea
                  name="hero_subtitle"
                  value={formData.hero_subtitle}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 border border-zweren-silver rounded-sm focus:ring-1 focus:ring-zweren-lavender focus:border-zweren-lavender bg-zweren-gray/20 text-[10px] font-bold uppercase tracking-widest leading-relaxed"
                  placeholder="Enter hero subtitle"
                />
              ) : (
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{siteSettings?.hero_subtitle}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Hero Banner Images (Slideshow)
              </label>
              {isEditing ? (
                <MultiImageUpload
                  images={formData.hero_images}
                  onImagesChange={(images) => setFormData(prev => ({ ...prev, hero_images: images }))}
                  onFilesSelected={(files) => setHeroFiles(prev => [...prev, ...files])}
                  className="bg-zweren-gray/10 p-4 rounded-sm"
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {siteSettings?.hero_images?.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-sm overflow-hidden border border-zweren-silver">
                      <img src={img} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {(!siteSettings?.hero_images || siteSettings.hero_images.length === 0) && (
                    <p className="text-xs text-gray-400 italic">No hero images set. Using defaults.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettingsManager;
