import React, { useState } from 'react';
import { MissingPersonsAPI } from '../services/api';
import { X, Upload, Shield, User, MapPin, Phone } from 'lucide-react';

interface NewMissingPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewMissingPersonModal: React.FC<NewMissingPersonModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [missingDate, setMissingDate] = useState(new Date().toISOString().split('T')[0]);
  const [missingLocation, setMissingLocation] = useState('Vijayawada Central');
  const [latitude, setLatitude] = useState('16.5062');
  const [longitude, setLongitude] = useState('80.6480');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
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
    const initials = (name || 'MP').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" rx="20" fill="#17324D"/>
      <circle cx="100" cy="75" r="40" fill="#ffffff" opacity="0.9"/>
      <path d="M40 170 C40 125, 160 125, 160 170 Z" fill="#ffffff" opacity="0.9"/>
      <text x="100" y="85" font-family="Arial" font-size="28" font-weight="bold" fill="#17324D" text-anchor="middle">${initials}</text>
    </svg>`;
    const b64 = btoa(svg);
    return `data:image/svg+xml;base64,${b64}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !missingDate || !missingLocation) {
      alert('Please complete all required case fields.');
      return;
    }

    setIsSubmitting(true);
    const finalPhoto = photoUrl || generateDefaultAvatar();

    try {
      await MissingPersonsAPI.create({
        name,
        age: parseInt(age, 10),
        missing_date: missingDate,
        missing_location: missingLocation,
        latitude: parseFloat(latitude) || 16.5062,
        longitude: parseFloat(longitude) || 80.6480,
        guardian_name: guardianName,
        guardian_phone: guardianPhone,
        photo_url: finalPhoto
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert('Error registering missing person case.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-xl p-6 shadow-modal space-y-5">
        
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-text-main">Register Missing Person Case</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-surface-subtle border border-border text-text-muted hover:text-text-main">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* SECTION 1: PERSON DETAILS */}
          <div className="space-y-3 p-3.5 rounded-lg bg-surface-subtle border border-border">
            <h4 className="font-bold text-primary uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-border pb-1">
              <User className="w-3.5 h-3.5" />
              1. Person Details
            </h4>

            <div className="flex items-center gap-4">
              {photoUrl ? (
                <img src={photoUrl} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-border bg-surface" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-surface border border-dashed border-border-strong flex flex-col items-center justify-center text-text-muted">
                  <Upload className="w-4 h-4 mb-0.5" />
                  <span className="text-[9px]">Upload</span>
                </div>
              )}
              <div className="flex-1 space-y-1">
                <label className="block font-semibold text-text-main">Photograph (JPG, PNG up to 10MB)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="block w-full text-xs text-text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-text-main font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-text-main font-semibold mb-1">Age *</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="Age in years"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={missingDate}
                  onChange={e => setMissingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: CASE DETAILS */}
          <div className="space-y-3 p-3.5 rounded-lg bg-surface-subtle border border-border">
            <h4 className="font-bold text-primary uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-border pb-1">
              <MapPin className="w-3.5 h-3.5" />
              2. Case & Location Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-text-main font-semibold mb-1">Missing Date *</label>
                <input
                  type="date"
                  required
                  value={missingDate}
                  onChange={e => setMissingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-text-main font-semibold mb-1">Last Seen Location *</label>
                <input
                  type="text"
                  required
                  value={missingLocation}
                  onChange={e => setMissingLocation(e.target.value)}
                  placeholder="e.g. Vijayawada Central"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={e => setLatitude(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={e => setLongitude(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: CONTACT */}
          <div className="space-y-3 p-3.5 rounded-lg bg-surface-subtle border border-border">
            <h4 className="font-bold text-primary uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-border pb-1">
              <Phone className="w-3.5 h-3.5" />
              3. Parent / Guardian Contact
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-text-muted font-medium mb-1">Guardian Name</label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={e => setGuardianName(e.target.value)}
                  placeholder="Guardian full name"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">Guardian Phone Number</label>
                <input
                  type="tel"
                  value={guardianPhone}
                  onChange={e => setGuardianPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-primary"
                />
              </div>
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
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors"
            >
              {isSubmitting ? 'Registering...' : 'Register Missing Person'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
