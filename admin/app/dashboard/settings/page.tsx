'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Save, Settings } from 'lucide-react';
import api from '@/lib/api';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data } = await api.get('/admin/settings');
      return data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      await api.put(`/admin/settings/${key}`, { value });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setSaved(variables.key);
      setTimeout(() => setSaved(null), 2000);
    },
  });

  const settings = data || [];

  const groups = [...new Set(settings.map((s: any) => s.group))];

  return (
    <div className="space-y-6 max-w-3xl">
      {isLoading ? (
        <div className="p-10 text-center text-slate-500">در حال بارگذاری...</div>
      ) : (
        groups.map((group) => {
          const groupSettings = settings.filter((s: any) => s.group === group);
          return (
            <div key={group as string} className="card">
              <div className="p-5 border-b border-white/[0.06]">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-400" />
                  {group as string}
                </h3>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {groupSettings.map((setting: any) => (
                  <SettingRow key={setting.key} setting={setting} onSave={updateMutation.mutate} isSaved={saved === setting.key} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function SettingRow({ setting, onSave, isSaved }: { setting: any; onSave: any; isSaved: boolean }) {
  const [value, setValue] = useState(setting.value || '');

  return (
    <div className="p-5 flex items-center gap-4">
      <div className="flex-1">
        <label className="text-white text-sm font-medium block mb-0.5">{setting.label || setting.key}</label>
        {setting.description && <p className="text-slate-500 text-xs">{setting.description}</p>}
      </div>
      <div className="flex items-center gap-2 w-64">
        <input value={value} onChange={(e) => setValue(e.target.value)} className="input flex-1" />
        <button
          onClick={() => onSave({ key: setting.key, value })}
          className={`btn text-sm py-2 px-3 transition-all ${isSaved ? 'bg-emerald-500/20 text-emerald-400' : 'btn-secondary'}`}
        >
          <Save className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
