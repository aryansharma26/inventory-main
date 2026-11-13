import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, Link } from 'react-router-dom';
import { Package, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { resetPasswordSchema } from '../../utils/validationSchemas.js';
import { useResetPassword } from '../../hooks/useAuth.js';

function ResetPasswordPage() {
  const { token } = useParams();
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data) => {
    resetPasswordMutation.mutate({ token, password: data.password });
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reset password
        </h1>
        <p className="text-gray-500 mt-2">Create a new password for your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            New password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              {...register('password')}
              type="password"
              placeholder="Enter new password"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="Confirm new password"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={resetPasswordMutation.isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {resetPasswordMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting...
            </>
          ) : (
            'Reset password'
          )}
        </button>
      </form>

      <p className="text-center mt-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default ResetPasswordPage;
