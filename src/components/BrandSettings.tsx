import React from 'react';
import { BadgeCheck, Phone, Type, Eye, EyeOff } from 'lucide-react';
import { VideoProject } from '../types';

interface BrandSettingsProps {
  branding: VideoProject['branding'];
  onBrandingChange: (updated: VideoProject['branding']) => void;
}

export const BrandSettings: React.FC<BrandSettingsProps> = ({
  branding,
  onBrandingChange,
}) => {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white">Marca & Llamado a la Acción</h3>
        <p className="text-xs text-slate-400">
          Superposición de tu empresa, WhatsApp y subtítulos en el video
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Business Name */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">
            Nombre de la Empresa o Servicio
          </label>
          <div className="relative">
            <input
              type="text"
              value={branding.businessName}
              onChange={(e) =>
                onBrandingChange({ ...branding, businessName: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500/60"
              placeholder="Ej: DomoTech Hogar"
            />
          </div>
        </div>

        {/* WhatsApp / Phone */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">
            Teléfono / WhatsApp de Contacto
          </label>
          <div className="relative">
            <input
              type="text"
              value={branding.phoneOrWhatsapp}
              onChange={(e) =>
                onBrandingChange({ ...branding, phoneOrWhatsapp: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500/60"
              placeholder="+54 9 11 1234-5678"
            />
          </div>
        </div>
      </div>

      {/* CTA Message */}
      <div>
        <label className="text-xs font-medium text-slate-300 block mb-1">
          Mensaje de Cierre / CTA
        </label>
        <input
          type="text"
          value={branding.ctaMessage}
          onChange={(e) =>
            onBrandingChange({ ...branding, ctaMessage: e.target.value })
          }
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500/60"
          placeholder="Contáctanos y transforma tu hogar hoy mismo"
        />
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        {/* Watermark toggle */}
        <button
          onClick={() =>
            onBrandingChange({ ...branding, showWatermark: !branding.showWatermark })
          }
          className={`p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between ${
            branding.showWatermark
              ? 'bg-blue-950/40 border-blue-500/60 text-white'
              : 'bg-slate-950/50 border-slate-800 text-slate-400'
          }`}
        >
          <span className="text-xs font-medium">Logo / Marca Superior</span>
          {branding.showWatermark ? (
            <Eye className="w-3.5 h-3.5 text-blue-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>

        {/* Contact badge toggle */}
        <button
          onClick={() =>
            onBrandingChange({ ...branding, showContactBadge: !branding.showContactBadge })
          }
          className={`p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between ${
            branding.showContactBadge
              ? 'bg-blue-950/40 border-blue-500/60 text-white'
              : 'bg-slate-950/50 border-slate-800 text-slate-400'
          }`}
        >
          <span className="text-xs font-medium">Insignia WhatsApp</span>
          {branding.showContactBadge ? (
            <Eye className="w-3.5 h-3.5 text-blue-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>

        {/* Captions toggle */}
        <button
          onClick={() =>
            onBrandingChange({ ...branding, showCaptions: !branding.showCaptions })
          }
          className={`p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between ${
            branding.showCaptions
              ? 'bg-blue-950/40 border-blue-500/60 text-white'
              : 'bg-slate-950/50 border-slate-800 text-slate-400'
          }`}
        >
          <span className="text-xs font-medium">Subtítulos Animados</span>
          {branding.showCaptions ? (
            <Eye className="w-3.5 h-3.5 text-blue-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>
      </div>
    </div>
  );
};
