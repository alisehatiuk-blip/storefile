import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z
    .string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .regex(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد')
    .regex(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد'),
  firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد').max(100),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد').max(100),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل نامعتبر است').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'توکن الزامی است'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'توکن الزامی است'),
  password: z
    .string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .regex(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد')
    .regex(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
