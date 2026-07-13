import React, { useEffect, useState } from 'react';
import { Globe, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { superadminFetch } from '@/lib/superadminFetch';

const SETTINGS_ENDPOINT = '/scrape-proxy-settings';

const getDefaultForm = () => ({
  proxiesText: '',
  requestsPerProxy: 100,
  maxRetries: 1,
  requestDelayMs: 100,
  discoveryDelayMs: 0,
  proxyTrainingOnly: true,
  proxyFallbackDirect: true,
});

/** Convert stored comma-separated proxies into one-entry-per-line for editing */
const proxiesToTextarea = (proxies) => {
  if (!proxies || typeof proxies !== 'string') return '';
  return proxies
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .join('\n');
};

/** Convert textarea (lines or commas) back to comma-separated storage format */
const textareaToProxies = (text) =>
  String(text || '')
    .replace(/\r?\n/g, ',')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .join(',');

const ProxySettingsPanel = () => {
  const [form, setForm] = useState(getDefaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const apiCall = async (endpoint, options = {}) => {
    const { headers: optHeaders = {}, ...rest } = options;
    const response = await superadminFetch(`${apiUrl}${endpoint}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...optHeaders,
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiCall(SETTINGS_ENDPOINT);
      const data = response.data || {};
      setForm({
        proxiesText: proxiesToTextarea(data.proxies),
        requestsPerProxy: data.requestsPerProxy ?? 100,
        maxRetries: data.maxRetries ?? 1,
        requestDelayMs: data.requestDelayMs ?? 100,
        discoveryDelayMs: data.discoveryDelayMs ?? 0,
        proxyTrainingOnly: data.proxyTrainingOnly !== false,
        proxyFallbackDirect: data.proxyFallbackDirect !== false,
      });
    } catch (error) {
      console.error('Failed to load proxy settings:', error);
      toast.error(error.message || 'Failed to load proxy settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const proxyCount = form.proxiesText
    .split(/[\n,]/)
    .map((p) => p.trim())
    .filter(Boolean).length;

  const handleSave = async () => {
    if (Number(form.requestsPerProxy) < 1) {
      toast.error('Requests per proxy must be at least 1');
      return;
    }

    try {
      setSaving(true);
      await apiCall(SETTINGS_ENDPOINT, {
        method: 'PUT',
        body: JSON.stringify({
          proxies: textareaToProxies(form.proxiesText),
          requestsPerProxy: Number(form.requestsPerProxy),
          maxRetries: Number(form.maxRetries),
          requestDelayMs: Number(form.requestDelayMs),
          discoveryDelayMs: Number(form.discoveryDelayMs),
          proxyTrainingOnly: Boolean(form.proxyTrainingOnly),
          proxyFallbackDirect: Boolean(form.proxyFallbackDirect),
        }),
      });
      toast.success('IP proxy settings saved');
      await loadSettings();
    } catch (error) {
      console.error('Failed to save proxy settings:', error);
      toast.error(error.message || 'Failed to save proxy settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-left">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600 shrink-0" />
            IP Proxy Setting
          </h1>
          <p className="text-gray-600 mt-2 pl-11">
            Configure scrape proxy rotation used for website training. Changes apply immediately.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 text-left">Proxy list</h2>
                
              </div>

              <textarea
                value={form.proxiesText}
                onChange={(e) => updateField('proxiesText', e.target.value)}
                rows={12}
                placeholder={'31.59.20.176:6754:user:pass\n31.56.127.193:7684:user:pass'}
                className="w-full font-mono text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 text-left">Rotation & timing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-left">
                  <span className="text-sm font-medium text-gray-700">Requests per proxy</span>
                  <input
                    type="number"
                    min={1}
                    value={form.requestsPerProxy}
                    onChange={(e) => updateField('requestsPerProxy', e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="block text-left">
                  <span className="text-sm font-medium text-gray-700">Max retries</span>
                  <input
                    type="number"
                    min={0}
                    value={form.maxRetries}
                    onChange={(e) => updateField('maxRetries', e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="block text-left">
                  <span className="text-sm font-medium text-gray-700">Request delay (ms)</span>
                  <input
                    type="number"
                    min={0}
                    value={form.requestDelayMs}
                    onChange={(e) => updateField('requestDelayMs', e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="block text-left">
                  <span className="text-sm font-medium text-gray-700">Discovery delay (ms)</span>
                  <input
                    type="number"
                    min={0}
                    value={form.discoveryDelayMs}
                    onChange={(e) => updateField('discoveryDelayMs', e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 text-left">Behavior</h2>
              <div className="space-y-4">
                <label className="inline-flex items-start gap-3 cursor-pointer text-left max-w-full">
                  <input
                    type="checkbox"
                    checked={form.proxyTrainingOnly}
                    onChange={(e) => updateField('proxyTrainingOnly', e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-left">
                    <span className="block text-sm font-medium text-gray-900">
                      Proxy training only
                    </span>
                    <span className="block text-sm text-gray-500">
                      Use proxies for page training scrapes; discovery/CSS/logo stay on direct connection.
                    </span>
                  </span>
                </label>

                <label className="inline-flex items-start gap-3 cursor-pointer text-left max-w-full">
                  <input
                    type="checkbox"
                    checked={form.proxyFallbackDirect}
                    onChange={(e) => updateField('proxyFallbackDirect', e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-left">
                    <span className="block text-sm font-medium text-gray-900">
                      Fallback to direct
                    </span>
                    <span className="block text-sm text-gray-500">
                      After proxy attempts fail, retry once without a proxy.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProxySettingsPanel;
