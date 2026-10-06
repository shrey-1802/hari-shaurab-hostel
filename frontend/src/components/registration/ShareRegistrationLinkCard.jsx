import React, { useState, useEffect } from 'react';
import { registrationService } from '../../services/registrationService';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Link2, Copy, Check, QrCode, ExternalLink, Sparkles, Shield } from 'lucide-react';

export const ShareRegistrationLinkCard = () => {
  const { user } = useAuth();
  const [linkData, setLinkData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyLink();
  }, [user]);

  const loadMyLink = async () => {
    setLoading(true);
    try {
      const link = await registrationService.getMyLink(user);
      setLinkData(link);
    } catch (err) {
      console.warn('Failed to load wing leader registration link:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!linkData?.shareable_url) return;
    navigator.clipboard.writeText(linkData.shareable_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <Card className="animate-pulse p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-10 bg-gray-100 rounded w-full" />
      </Card>
    );
  }

  const linkUrl = linkData?.shareable_url || `${window.location.origin}/register/wl-a`;

  return (
    <Card hover={true} className="border-2 border-gold-400/50 bg-gradient-to-br from-gold-50/80 via-white to-amber-50/50 shadow-soft-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800 text-[11px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Shareable Student Self-Registration Link
          </div>
          <h3 className="text-lg font-extrabold text-[#4A4A4A] flex items-center gap-2">
            Floor {user?.assigned_floor || linkData?.assigned_floor || 4} Registration Portal
          </h3>
          <p className="text-xs text-gray-500">
            Share this unique link with incoming residents. Floor {user?.assigned_floor || linkData?.assigned_floor || 4} will be automatically assigned.
          </p>
        </div>

        <Badge variant="gold" size="md" className="shrink-0 font-bold">
          Rooms {linkData?.room_start || '401'} - {linkData?.room_end || '405'}
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-gold-200 shadow-inner">
        <div className="flex-1 min-w-0 w-full">
          <div className="text-[10px] uppercase font-bold text-gray-400">Shareable Registration URL</div>
          <div className="text-xs sm:text-sm font-mono font-bold text-gold-700 truncate">
            {linkUrl}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Button
            size="sm"
            onClick={copyToClipboard}
            className={`flex-1 sm:flex-none font-bold text-xs ${
              copied ? 'bg-green-600 text-white' : 'bg-gold-500 hover:bg-gold-600 text-white'
            }`}
            icon={copied ? Check : Copy}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>

          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gold-100 hover:text-gold-700 transition-colors"
            title="Open Registration Form"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gold-100 flex items-center justify-between text-[11px] text-gray-500">
        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          Permanent Leader Link • Secure Token: <code className="font-mono font-bold text-gray-700">{linkData?.registration_token || 'wl-a'}</code>
        </span>
        <span className="hidden sm:inline text-gray-400">Capacity: Max 2 Students / Room</span>
      </div>
    </Card>
  );
};
