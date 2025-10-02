
import React from 'react';
import { useLocalization } from '../hooks/useLocalization.ts';
import { type View } from '../types.ts';
import { LayoutDashboardIcon, ListIcon, SettingsIcon, BookOpenIcon } from './icons.tsx';

interface HeaderProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
    const { t } = useLocalization();

    const navItems = [
        { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboardIcon className="w-5 h-5" /> },
        { id: 'list', label: t('entries'), icon: <ListIcon className="w-5 h-5" /> },
        { id: 'settings', label: t('settings'), icon: <SettingsIcon className="w-5 h-5" /> },
    ];

    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <nav className="container mx-auto px-4 max-w-4xl">
                <div className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-2">
                        <BookOpenIcon className="w-8 h-8 text-primary-600"/>
                        <span className="text-xl font-bold text-slate-700">{t('appName')}</span>
                    </div>
                    <div className="flex space-x-2 md:space-x-4">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id as View)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    currentView === item.id
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {item.icon}
                                <span className="hidden md:inline">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>
        </header>
    );
};
