
import React, { useState } from 'react';
import { XIcon, Logo, GoogleIcon, GitHubIcon, DiscordIcon } from './Icons';
import { supabase } from '../lib/supabase';
import { Provider } from '@supabase/supabase-js';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    // onLogin is updated to accept manual callback for test login
    onLogin: (email: string, name: string) => void; 
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { t } = useLanguage();

    if (!isOpen) return null;

    const handleSocialLogin = async (provider: Provider) => {
        setIsLoading(provider);
        setErrorMessage(null);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    // Redirect back to the current page after login
                    redirectTo: window.location.origin, 
                },
            });

            if (error) {
                throw error;
            }
            
            // Note: The app will reload/redirect here, so we don't need to manually close
        } catch (error: any) {
            console.error('Login error:', error);
            setErrorMessage(error.message || 'Failed to connect. Please check configuration.');
            setIsLoading(null);
        }
    };

    const handleTestLogin = () => {
        // Bypass Supabase for testing purposes
        onLogin('testuser@example.com', 'Developer Test User');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#161b22] border border-gray-800 rounded-3xl w-full max-w-[360px] p-8 shadow-2xl relative overflow-hidden">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors z-20 hover:bg-white/10 rounded-full p-1"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3.5 rounded-2xl shadow-lg shadow-blue-900/20 mb-5 border border-white/10">
                        <Logo className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white text-center tracking-tight">{t('auth.welcome')}</h2>
                    <p className="text-gray-400 text-xs mt-2 text-center font-medium">
                        {t('auth.subtitle')}
                    </p>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-xs text-center">
                        {errorMessage}
                    </div>
                )}

                {/* Social Login Stack */}
                <div className="space-y-3">
                    <SocialButton 
                        provider="Google" 
                        icon={GoogleIcon} 
                        bgColor="bg-white" 
                        textColor="text-gray-900" 
                        hoverColor="hover:bg-gray-200"
                        onClick={() => handleSocialLogin('google')}
                        loading={isLoading === 'google'}
                        labelPrefix={t('auth.continue')}
                    />
                    <SocialButton 
                        provider="GitHub" 
                        icon={GitHubIcon} 
                        bgColor="bg-[#24292e]" 
                        textColor="text-white" 
                        hoverColor="hover:bg-[#2f363d]"
                        onClick={() => handleSocialLogin('github')}
                        loading={isLoading === 'github'}
                        labelPrefix={t('auth.continue')}
                    />
                     <SocialButton 
                        provider="Discord" 
                        icon={DiscordIcon} 
                        bgColor="bg-[#5865F2]" 
                        textColor="text-white" 
                        hoverColor="hover:bg-[#4752c4]"
                        onClick={() => handleSocialLogin('discord')}
                        loading={isLoading === 'discord'}
                        labelPrefix={t('auth.continue')}
                    />
                </div>

                <div className="mt-8 border-t border-gray-800 pt-4 text-center">
                     <button 
                        onClick={handleTestLogin}
                        className="text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors"
                     >
                         {t('auth.devlogin')}
                     </button>
                     <p className="text-[10px] text-gray-600 mt-2 px-2 leading-relaxed whitespace-pre-line">
                        {t('auth.terms')}
                    </p>
                </div>
            </div>
        </div>
    );
};

interface SocialButtonProps {
    provider: string;
    icon: React.FC<{ className?: string }>;
    bgColor: string;
    textColor: string;
    hoverColor: string;
    onClick: () => void;
    loading: boolean;
    labelPrefix: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, icon: Icon, bgColor, textColor, hoverColor, onClick, loading, labelPrefix }) => (
    <button 
        onClick={onClick}
        disabled={loading}
        className={`w-full ${bgColor} ${hoverColor} ${textColor} font-bold text-sm py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 relative overflow-hidden group active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-md`}
    >
        {loading ? (
            <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Connecting...</span>
            </div>
        ) : (
            <>
                <div className="absolute left-4">
                    <Icon className="w-5 h-5" />
                </div>
                <span>{labelPrefix} {provider}</span>
            </>
        )}
    </button>
);
