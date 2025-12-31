'use client';

import { useState, useEffect } from 'react';
import { updateAd, createAd, Ad } from '@/services/firebase';

interface Props {
  ad: Ad | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EditAdModal({ ad, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Ad>(ad || {
    title: '',
    subtitle: '',
    image: '',
    link: '',
    active: true,
    createdAt: new Date(),
  });
  const [saving, setSaving] = useState(false);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (ad?.id) {
        // Update existing
        await updateAd(ad.id, formData);
      } else {
        // Create new
        await createAd(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving ad:', error);
      alert('Failed to save ad');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-[#121215] rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-white/10 relative mx-4">
        <div className="p-4 sm:p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-lg sm:text-xl font-bold font-display text-white">{ad ? 'Edit Ad' : 'Create Ad'}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all placeholder:text-gray-600 text-base"
                placeholder="Enter ad title"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all placeholder:text-gray-600 text-base"
                placeholder="Enter ad subtitle"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all placeholder:text-gray-600 text-base"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Link URL</label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all placeholder:text-gray-600 text-base"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-white/5 cursor-pointer hover:bg-white/10 transition w-full">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 bg-black/40 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-white">📢 Ad is Active</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 text-gray-300 hover:text-white glass-button rounded-xl transition hover:bg-white/10 font-medium order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 transition active:scale-95 font-medium flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              ad ? 'Save Changes' : 'Create Ad'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}