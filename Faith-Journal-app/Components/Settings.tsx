
import React from 'react';
import { useLocalization } from '../hooks/useLocalization.ts';
import { type Language } from '../types.ts';
import Card from './ui/Card.tsx';
import Select from './ui/Select.tsx';
import Button from './ui/Button.tsx';

interface SettingsProps {
    onClearData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClearData }) => {
    const { language, setLanguage, t } = useLocalization();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);
    };

    const handleClearData = () => {
        if (window.confirm(t('confirmClearAllData'))) {
            onClearData();
            alert(t('dataCleared'));
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-700">{t('settings')}</h1>

            <Card>
                <h2 className="text-xl font-semibold mb-4 text-slate-700">{t('appSettings')}</h2>
                <div className="max-w-xs">
                    <Select
                        label={t('language')}
                        value={language}
                        onChange={handleLanguageChange}
                        name="language"
                    >
                        <option value="en">{t('english')}</option>
                        <option value="es">{t('spanish')}</option>
                    </Select>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold mb-4 text-red-700">{t('dangerZone')}</h2>
                <p className="text-slate-600 mb-4">{t('clearAllDataWarning')}</p>
                <Button variant="danger" onClick={handleClearData}>
                    {t('clearAllData')}
                </Button>
            </Card>
        </div>
    );
};
