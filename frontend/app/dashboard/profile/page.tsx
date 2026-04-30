'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, User } from 'lucide-react';
import api from '@/lib/api';
import { User as UserType } from '@/types';

const profileSchema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  phone: z.string().regex(/^09\d{9}$/).optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/users/me');
      return data.data as UserType;
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phone: profile?.phone || '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const { data: res } = await api.put('/users/me', data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">پروفایل</h1>
        <p className="text-slate-400">مدیریت اطلاعات حساب کاربری</p>
      </div>

      {/* Avatar */}
      <div className="card p-6 mb-6 flex items-center gap-5">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/20">
          {profile?.firstName?.[0] || profile?.email?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <h2 className="text-white font-semibold text-lg">
            {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : profile?.email}
          </h2>
          <p className="text-slate-400 text-sm">{profile?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge bg-emerald-400/10 text-emerald-400 text-xs">
              {profile?.isEmailVerified ? 'ایمیل تایید شده' : 'ایمیل تایید نشده'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="card p-6">
        <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          اطلاعات شخصی
        </h3>

        {success && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            پروفایل با موفقیت به‌روزرسانی شد
          </div>
        )}

        {mutation.isError && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            خطا در به‌روزرسانی پروفایل
          </div>
        )}

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">نام</label>
              <input {...register('firstName')} className="input" />
              {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">نام خانوادگی</label>
              <input {...register('lastName')} className="input" />
              {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium mb-1.5 block">ایمیل</label>
            <input value={profile?.email || ''} disabled className="input opacity-50 cursor-not-allowed" dir="ltr" />
            <p className="text-slate-600 text-xs mt-1">ایمیل قابل تغییر نیست</p>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium mb-1.5 block">شماره موبایل</label>
            <input {...register('phone')} placeholder="09XXXXXXXXX" className="input" dir="ltr" />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </form>
      </div>
    </div>
  );
}
