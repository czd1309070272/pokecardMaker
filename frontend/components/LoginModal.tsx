
import React, { useState } from 'react';
import { XIcon, Logo } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { loginWithEmail, registerWithEmail, requestPasswordReset } from '../services/authService';
import { User } from '../types';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (user: User) => void; 
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
    const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { t } = useLanguage();

    if (!isOpen) return null;

    const handleModeChange = (nextMode: 'signin' | 'signup' | 'reset') => {
        setMode(nextMode);
        setErrorMessage(null);
        setSuccessMessage(null);
        if (nextMode === 'reset') {
            setPassword('');
        }
    };

    const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedEmail = email.trim();
        if (!normalizedEmail) {
            setErrorMessage(t('auth.error_missing_email'));
            return;
        }

        if (mode !== 'reset' && !password) {
            setErrorMessage(t('auth.error_missing_fields'));
            return;
        }

        setIsLoading(mode);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            if (mode === 'signin') {
                const user = await loginWithEmail({
                    email: normalizedEmail,
                    password,
                });
                onLogin(user);
                setPassword('');
                onClose();
                return;
            }

            if (mode === 'signup') {
                const user = await registerWithEmail({
                    email: normalizedEmail,
                    password,
                    nickname: normalizedEmail.split('@')[0],
                });
                onLogin(user);
                setPassword('');
                onClose();
                return;
            }

            await requestPasswordReset();
            setPassword('');
            setSuccessMessage(t('auth.reset_success'));
        } catch (error: any) {
            console.error('Auth error:', error);
            setErrorMessage(
                error.message ||
                (mode === 'signin'
                    ? t('auth.error_password_failed')
                    : mode === 'signup'
                        ? t('auth.error_signup_failed')
                        : t('auth.error_reset_failed'))
            );
            setIsLoading(null);
            return;
        }

        setIsLoading(null);
    };

    const handleTestLogin = () => {
        onLogin({
            id: 0,
            email: 'testuser@example.com',
            name: 'Developer Test User',
            created: new Date().toISOString(),
            coins: 1000,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="relative w-full max-w-[380px] overflow-hidden rounded-[32px] border border-white/12 bg-[rgba(22,27,34,0.62)] p-8 shadow-[0_28px_120px_rgba(2,6,23,0.72)] backdrop-blur-[26px]">
                <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_34%),radial-gradient(circle_at_20%_18%,rgba(96,165,250,0.12),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(129,140,248,0.14),transparent_28%)]" />
                <div className="pointer-events-none absolute inset-[1px] rounded-[31px] border border-white/8" />
                <div className="pointer-events-none absolute -left-16 top-6 h-24 w-56 rotate-[-12deg] rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-40 rounded-full bg-blue-500/10 blur-3xl" />

                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-white/6 p-1.5 text-gray-400 backdrop-blur-md transition-all hover:bg-white/12 hover:text-white"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                <div className="relative z-10">
                {/* Header */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="mb-5 rounded-[22px] border border-white/14 bg-gradient-to-br from-blue-600/90 to-indigo-600/85 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_12px_38px_rgba(37,99,235,0.3)]">
                        <Logo className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-center text-2xl font-bold tracking-tight text-white drop-shadow-[0_1px_10px_rgba(255,255,255,0.08)]">
                        {mode === 'signin' ? t('auth.welcome') : mode === 'signup' ? t('auth.signup_title') : t('auth.reset_title')}
                    </h2>
                    <p className="mt-2 text-center text-xs font-medium text-gray-300/90">
                        {mode === 'signin' ? t('auth.subtitle') : mode === 'signup' ? t('auth.signup_subtitle') : t('auth.reset_subtitle')}
                    </p>
                </div>

                <div className="mb-5 grid grid-cols-3 gap-2 rounded-[20px] border border-white/10 bg-[rgba(13,17,23,0.34)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md">
                    <ModeButton active={mode === 'signin'} onClick={() => handleModeChange('signin')}>
                        {t('auth.mode_signin')}
                    </ModeButton>
                    <ModeButton active={mode === 'signup'} onClick={() => handleModeChange('signup')}>
                        {t('auth.mode_signup')}
                    </ModeButton>
                    <ModeButton active={mode === 'reset'} onClick={() => handleModeChange('reset')}>
                        {t('auth.mode_reset')}
                    </ModeButton>
                </div>

                {errorMessage && (
                    <div className="mb-4 rounded-2xl border border-red-300/18 bg-[rgba(127,29,29,0.28)] p-3 text-center text-xs text-red-100 backdrop-blur-md">
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 rounded-2xl border border-emerald-300/18 bg-[rgba(6,78,59,0.26)] p-3 text-center text-xs text-emerald-100 backdrop-blur-md">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-3">
                    <div>
                        <label className="sr-only" htmlFor="login-email">
                            {t('auth.email')}
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder={t('auth.email_placeholder')}
                            autoComplete="email"
                            className="w-full rounded-2xl border border-white/10 bg-[rgba(13,17,23,0.42)] px-4 py-3 text-sm text-white placeholder:text-gray-400/80 outline-none backdrop-blur-md transition focus:border-blue-400/70 focus:bg-[rgba(13,17,23,0.5)] focus:ring-2 focus:ring-blue-500/18"
                        />
                    </div>
                    {mode !== 'reset' && (
                        <div>
                            <label className="sr-only" htmlFor="login-password">
                                {t('auth.password')}
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder={t('auth.password_placeholder')}
                                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                                className="w-full rounded-2xl border border-white/10 bg-[rgba(13,17,23,0.42)] px-4 py-3 text-sm text-white placeholder:text-gray-400/80 outline-none backdrop-blur-md transition focus:border-blue-400/70 focus:bg-[rgba(13,17,23,0.5)] focus:ring-2 focus:ring-blue-500/18"
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading !== null}
                        className="w-full rounded-2xl border border-white/14 bg-[linear-gradient(180deg,rgba(59,130,246,0.92),rgba(37,99,235,0.82))] px-4 py-3 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_30px_rgba(37,99,235,0.28)] transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {mode === 'signin' && (isLoading === 'signin' ? t('auth.signing_in') : t('auth.signin_email'))}
                        {mode === 'signup' && (isLoading === 'signup' ? t('auth.signing_up') : t('auth.signup_email'))}
                        {mode === 'reset' && (isLoading === 'reset' ? t('auth.sending_reset') : t('auth.reset_email'))}
                    </button>
                </form>

                <div className="mt-8 border-t border-white/8 pt-4 text-center">
                     <div className="mb-3 flex items-center justify-center gap-4 text-xs text-gray-400">
                        {mode !== 'signin' && (
                            <button onClick={() => handleModeChange('signin')} className="transition-colors hover:text-white">
                                {t('auth.back_to_signin')}
                            </button>
                        )}
                        {mode === 'signin' && (
                            <>
                                <button onClick={() => handleModeChange('signup')} className="transition-colors hover:text-white">
                                    {t('auth.create_account')}
                                </button>
                                <button onClick={() => handleModeChange('reset')} className="transition-colors hover:text-white">
                                    {t('auth.forgot_password')}
                                </button>
                            </>
                        )}
                     </div>
                     <button 
                        onClick={handleTestLogin}
                        disabled={isLoading !== null}
                        className="text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
                     >
                         {t('auth.devlogin')}
                     </button>
                     <p className="mt-2 whitespace-pre-line px-2 text-[10px] leading-relaxed text-gray-500">
                        {t('auth.terms')}
                    </p>
                </div>
                </div>
            </div>
        </div>
    );
};

const ModeButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`rounded-2xl px-2 py-2 text-xs font-bold transition-all ${
            active
                ? 'border border-white/12 bg-[linear-gradient(180deg,rgba(59,130,246,0.9),rgba(37,99,235,0.76))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_24px_rgba(37,99,235,0.2)]'
                : 'text-gray-400 hover:bg-white/6 hover:text-gray-200'
        }`}
    >
        {children}
    </button>
);
