
import React, { useState, useRef, useEffect } from 'react';
import { Logo, ChevronDownIcon, CartIcon, UserIcon, DiscordIcon, PrinterIcon, StickerIcon, TranslateIcon, SwordsIcon, MagicWandIcon, GlobeIcon, GridIcon, CoinIcon, GavelIcon } from './Icons';
import { User } from '../types';
import { SpotlightCard } from './Effects';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
    currentView: 'create' | 'browse' | 'cart' | 'profile' | 'arena' | 'appraiser' | 'recharge';
    setView: (view: 'create' | 'browse' | 'cart' | 'profile' | 'arena' | 'appraiser' | 'recharge') => void;
    cartCount: number;
    user: User | null;
    onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, cartCount, user, onLoginClick }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
              setIsMoreOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
      if (user) {
          setView('profile');
          setIsMoreOpen(false);
      } else {
          onLoginClick();
          setIsMoreOpen(false);
      }
  };

  const handleSignOut = async () => {
      await supabase.auth.signOut();
      // App.tsx listener will handle state update
      setIsMoreOpen(false);
  };

  const handleViewChange = (view: 'create' | 'browse' | 'arena') => {
      if (view === 'arena' && !user) {
          onLoginClick();
          return;
      }
      setView(view);
  };

  const NavLink = ({ view, label, icon: Icon }: { view: 'create' | 'browse' | 'arena', label: string, icon?: React.FC<{className?: string}> }) => (
      <SpotlightCard className="rounded-full">
          <button
            onClick={() => handleViewChange(view)}
            className={`relative px-3 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 z-10 flex items-center gap-2 active:scale-95 ${
                currentView === view
                    ? 'text-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title={label}
        >
            {Icon && <Icon className={`w-5 h-5 md:w-4 md:h-4 transition-transform duration-300 ${currentView === view ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'group-hover:scale-110'}`} />}
            <span className="hidden md:inline">{label}</span>
        </button>
      </SpotlightCard>
  );

  return (
    <nav className="w-full bg-[#020617]/80 backdrop-blur-md border-b border-white/5 h-16 sm:h-[72px] flex items-center justify-between px-3 sm:px-6 z-50 sticky top-0">
      {/* Logo Section */}
      <div className="flex items-center gap-3 cursor-pointer group no-scale shrink-0" onClick={() => setView('create')}>
        <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-20 group-hover:opacity-60 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg border border-white/10 group-hover:scale-105 transition-transform duration-300 group-active:scale-95">
                <Logo className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
        </div>
        <div className="flex flex-col justify-center hidden sm:flex">
            <span className="text-xl font-bold font-heading tracking-tight text-white leading-none group-hover:text-blue-200 transition-colors">
                PokeCard<span className="text-blue-500 group-hover:text-blue-400">Maker</span>
            </span>
        </div>
      </div>

      {/* Center Navigation Pills */}
      <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-full p-1 sm:p-1.5 shadow-inner backdrop-blur-sm mx-2">
        <NavLink view="create" label={t('nav.create')} icon={MagicWandIcon} />
        <NavLink view="browse" label={t('nav.browse')} icon={GlobeIcon} />
        <NavLink view="arena" label={t('nav.arena')} icon={SwordsIcon} />

        {/* More Dropdown Trigger */}
        <div className="relative" ref={moreRef}>
            <SpotlightCard className="rounded-full">
                <button
                    className={`relative z-10 flex items-center gap-1.5 px-3 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 active:scale-95 ${
                        isMoreOpen ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    title={t('nav.more')}
                >
                    <GridIcon className="w-5 h-5 md:w-4 md:h-4" />
                    <span className="hidden md:inline">{t('nav.more')}</span> 
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                    )}
                    <ChevronDownIcon className={`w-3 h-3 transition-transform duration-300 ${isMoreOpen ? 'rotate-180' : ''}`} />
                </button>
            </SpotlightCard>
            
            {/* Dropdown Menu */}
            {isMoreOpen && (
                <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-64 bg-[#161b22]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 flex flex-col z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                    
                    {user && (
                        <div className="px-4 py-3 border-b border-white/5 mb-1">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Signed in as</p>
                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                        </div>
                    )}

                    <button 
                        onClick={handleProfileClick}
                        className="relative flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-gray-200 hover:text-white group"
                    >
                        <div className="p-1.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                            <UserIcon className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="font-medium">{t('nav.myprofile')}</span>
                    </button>

                    <button 
                        onClick={() => {
                            if (user) {
                                setView('cart');
                            } else {
                                onLoginClick();
                            }
                            setIsMoreOpen(false);
                        }}
                        className="relative flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-gray-200 hover:text-white group"
                    >
                        <div className="p-1.5 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                            <CartIcon className="w-4 h-4 text-orange-400" />
                        </div>
                        <span className="font-medium">{t('cart.title')}</span>
                        {cartCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                {cartCount}
                            </span>
                        )}
                    </button>
                    
                    <button 
                        onClick={() => { setView('appraiser'); setIsMoreOpen(false); }}
                        className="relative flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-gray-200 hover:text-white group"
                    >
                        <div className="p-1.5 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                            <GavelIcon className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="font-medium">{t('nav.appraiser')}</span>
                    </button>

                    {/* Mobile Only: Language Switcher inside Dropdown */}
                    <button 
                        onClick={() => { setLanguage(language === 'en' ? 'zh' : 'en'); setIsMoreOpen(false); }}
                        className="relative flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-gray-200 hover:text-white group md:hidden"
                    >
                        <div className="p-1.5 bg-gray-500/10 rounded-lg group-hover:bg-gray-500/20 transition-colors">
                            <TranslateIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="font-medium">Language: {language === 'en' ? 'EN' : '中文'}</span>
                    </button>

                    <div className="h-px bg-white/5 my-1 mx-4" />
                    <a href="#" className="relative flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-gray-200 hover:text-white group">
                         <div className="p-1.5 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                            <DiscordIcon className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="font-medium">{t('nav.discord')}</span>
                    </a>
                    <a href="#" className="relative flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-gray-200 hover:text-white group">
                         <div className="p-1.5 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                            <PrinterIcon className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="font-medium">{t('nav.print')}</span>
                    </a>
                    <a href="#" className="relative flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-gray-200 hover:text-white group">
                        <div className="p-1.5 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
                            <StickerIcon className="w-4 h-4 text-pink-400" />
                        </div>
                        <span className="font-medium">{t('nav.stickers')}</span>
                    </a>

                    {user && (
                        <>
                            <div className="h-px bg-white/5 my-1 mx-4" />
                            <button 
                                onClick={handleSignOut}
                                className="relative flex items-center gap-3 px-4 py-3 text-left hover:bg-red-900/20 transition-colors text-red-400 hover:text-red-300"
                            >
                                <span className="font-medium w-full text-center">{t('nav.signout')}</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        
        {/* Coin Balance Display */}
        {user && (
            <div 
                onClick={() => setView('recharge')}
                className="flex items-center gap-1 sm:gap-1.5 bg-[#1e232b] px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-yellow-500/20 text-yellow-400 font-bold text-[10px] sm:text-xs shadow-sm hover:bg-[#272d38] transition-colors cursor-pointer"
            >
                <CoinIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-500" />
                <span>{user.coins?.toLocaleString() || 0}</span>
            </div>
        )}

        {/* Language Toggle (Hidden on mobile to save space) */}
        <button
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="hidden sm:flex items-center justify-center p-2 rounded-lg bg-[#1e232b] hover:bg-[#272d38] border border-white/10 text-gray-300 transition-colors active:scale-95"
            title="Switch Language"
        >
            <TranslateIcon className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline text-xs font-bold uppercase">{language === 'en' ? 'EN' : '中'}</span>
        </button>

        {/* Cart Button was removed from here */}
        
        {user ? (
            <button 
                onClick={() => setView('profile')}
                className="flex items-center gap-2 p-1.5 sm:pl-1.5 sm:pr-4 bg-[#1e232b] hover:bg-[#272d38] border border-white/10 hover:border-blue-500/30 rounded-full transition-all group active:scale-95 hover:shadow-lg hover:shadow-blue-900/20"
            >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg border border-white/10 overflow-hidden group-hover:scale-105 transition-transform shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-bold text-gray-200 group-hover:text-white max-w-[100px] truncate">{user.name}</span>
            </button>
        ) : (
            <button 
                onClick={onLoginClick}
                className="relative group px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm text-white overflow-hidden shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:brightness-110" />
                <span className="relative flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('nav.signin')}</span>
                </span>
            </button>
        )}
      </div>
    </nav>
  );
};
