import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Building2, Phone, Mail, Globe, Receipt, Bell, Shield, Database, Loader2, Save, Image
} from 'lucide-react';
import { useSettings, useUpdateSettings } from '../../hooks/useMisc.js';
import { toast } from 'sonner';

function SettingsPage() {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [formData, setFormData] = useState({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      shopAddress: { ...prev.shopAddress, ...settings?.shopAddress, [field]: value }
    }));
  };

  const handleSubmit = () => {
    updateSettings.mutate(formData, {
      onSuccess: () => {
        setFormData({});
        toast.success('Settings saved successfully');
      }
    });
  };

  const getValue = (field, nested) => {
    if (formData[field] !== undefined) return formData[field];
    if (nested && formData[nested]?.[field] !== undefined) return formData[nested][field];
    return nested ? settings?.[nested]?.[field] : settings?.[field];
  };

  const sections = [
    {
      title: 'Shop Information',
      icon: Building2,
      fields: [
        { label: 'Shop Name', field: 'shopName', type: 'text' },
        { label: 'Phone', field: 'phone', type: 'text' },
        { label: 'Email', field: 'email', type: 'email' },
      ],
    },
    {
      title: 'Address',
      icon: Globe,
      fields: [
        { label: 'Street', field: 'street', type: 'text', nested: 'shopAddress' },
        { label: 'City', field: 'city', type: 'text', nested: 'shopAddress' },
        { label: 'State', field: 'state', type: 'text', nested: 'shopAddress' },
        { label: 'Zip Code', field: 'zipCode', type: 'text', nested: 'shopAddress' },
      ],
    },
    {
      title: 'Business Details',
      icon: Receipt,
      fields: [
        { label: 'GST/VAT Number', field: 'gstNumber', type: 'text' },
        { label: 'Currency', field: 'currency', type: 'select', options: ['INR', 'USD', 'EUR', 'GBP', 'PHP'] },
        { label: 'Currency Symbol', field: 'currencySymbol', type: 'text' },
        { label: 'Timezone', field: 'timezone', type: 'select', options: ['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Manila'] },
      ],
    },
    {
      title: 'Invoice Settings',
      icon: Receipt,
      fields: [
        { label: 'Invoice Prefix', field: 'invoicePrefix', type: 'text' },
        { label: 'Invoice Notes', field: 'invoiceNotes', type: 'textarea' },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 mt-1">Configure your shop preferences</p>
      </div>

      {sections.map(section => (
        <div key={section.title} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <section.icon className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold">{section.title}</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map(field => (
              <div key={field.field}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={getValue(field.field, field.nested) || ''}
                    onChange={e => field.nested ? handleAddressChange(field.field, e.target.value) : handleChange(field.field, e.target.value)}
                    disabled={!isAdmin}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:opacity-50"
                  >
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={getValue(field.field, field.nested) || ''}
                    onChange={e => field.nested ? handleAddressChange(field.field, e.target.value) : handleChange(field.field, e.target.value)}
                    disabled={!isAdmin}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:opacity-50"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={getValue(field.field, field.nested) || ''}
                    onChange={e => field.nested ? handleAddressChange(field.field, e.target.value) : handleChange(field.field, e.target.value)}
                    disabled={!isAdmin}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:opacity-50"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={updateSettings.isPending || Object.keys(formData).length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
