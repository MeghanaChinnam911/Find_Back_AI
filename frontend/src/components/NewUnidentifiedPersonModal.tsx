import React, { useState } from 'react';
import { UnidentifiedPersonsAPI } from '../services/api';
import { X, Upload, Building2, AlertCircle } from 'lucide-react';

interface NewUnidentifiedPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRecord: any) => void;
}

export const NewUnidentifiedPersonModal: React.FC<NewUnidentifiedPersonModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [photoUrl, setPhotoUrl] = useState('');
  const [location, setLocation] = useState('Vijayawada Railway Station');
  const [latitude, setLatitude] = useState('16.5170');
  const [longitude, setLongitude] = useState('80.6272');
  const [uploaderPhone, setUploaderPhone] = useState('+91 98765 12345');
  
  // Optional Fields
  const [name, setName] = useState('');
  const [approximateAge, setApproximateAge] = useState('');
  const [nativeLocation, setNativeLocation] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateDefaultAvatar = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" rx="20" fill="#2F6B57"/>
      <circle cx="100" cy="75" r="40" fill="#ffffff" opacity="0.9"/>
      <path d="M40 170 C40 125, 160 125, 160 170 Z" fill="#ffffff" opacity="0.9"/>
      <text x="100" y="85" font-family="Arial" font-size="28" font-weight="bold" fill="#2F6B57" text-anchor="middle">UP</text>
    </svg>`;
    const b64 = btoa(svg);
    return `data:image/svg+xml;base64,${b64}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !uploaderPhone) {
      alert('Location and Uploader Phone number are required.');
      return;
    }

    setIsSubmitting(true);
    const finalPhoto = photoUrl || generateDefaultAvatar();

    try {
      const created = await UnidentifiedPersonsAPI.create({
        photo_url: finalPhoto,
        location,
        latitude: parseFloat(latitude) || 16.5170,
        longitude: parseFloat(longitude) || 80.6272,
        uploader_phone: uploaderPhone,
        name: name.trim() || undefined,
        approximate_age: approximateAge ? parseInt(approximateAge, 10) : undefined,
        native_location: nativeLocation.trim() || undefined,
        additional_details: additionalDetails.trim() || undefined
      });

      onSuccess(created);
      onClose();
    } catch (err) {
      alert('Failed to upload record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-xl p-6 shadow-modal space-y-5">
        
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-text-main">Upload Found / Unidentified Person Record</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-surface-subtle border border-border text-text-muted hover:text-text-main">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Photo Intake */}
          <div className="p-3.5 rounded-lg bg-surface-subtle border border-border flex items-center gap-4">
            {photoUrl ? (
              <img src={photoUrl} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-border bg-surface" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-surface border border-dashed border-border-strong flex flex-col items-center justify-center text-text-muted">
                <Upload className="w-4 h-4 mb-0.5 text-accent" />
                <span className="text-[9px] font-bold">Photo *</span>
              </div>
            )}
            <div className="flex-1 space-y-1">
              <label className="block text-text-main font-bold">
                Photograph of Individual <span className="text-danger">* Required</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="block w-full text-xs text-text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-hover cursor-pointer"
              />
            </div>
          </div>

          {/* REQUIRED FIELDS */}
          <div className="p-3.5 rounded-lg bg-surface-subtle border border-border space-y-3">
            <h4 className="font-bold text-text-main uppercase text-[11px] tracking-wider border-b border-border pb-1">
              Required Information
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-text-main font-semibold mb-1">
                  Found Location <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Vijayawada Railway Station Platform 2"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-text-main font-semibold mb-1">
                  Uploader Contact Phone <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={uploaderPhone}
                  onChange={e => setUploaderPhone(e.target.value)}
                  placeholder="+91 98765 12345"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* OPTIONAL FIELDS */}
          <div className="p-3.5 rounded-lg bg-surface-subtle border border-border space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-1">
              <h4 className="font-bold text-text-muted uppercase text-[11px] tracking-wider">
                Optional Information
              </h4>
              <span className="text-[10px] text-text-muted italic">Provide only if known</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-text-muted font-medium mb-1">Name (Optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">Approximate Age (Optional)</label>
                <input
                  type="number"
                  value={approximateAge}
                  onChange={e => setApproximateAge(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">Native Location (Optional)</label>
                <input
                  type="text"
                  value={nativeLocation}
                  onChange={e => setNativeLocation(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-muted font-medium mb-1">Additional Details (Optional)</label>
              <textarea
                value={additionalDetails}
                onChange={e => setAdditionalDetails(e.target.value)}
                placeholder="Clothing details, backpack, or shelter condition (optional)..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface border border-border text-text-muted hover:text-text-main"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-bold text-xs transition-colors"
            >
              {isSubmitting ? 'Searching Matches...' : 'Submit Intake Record & Match'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
