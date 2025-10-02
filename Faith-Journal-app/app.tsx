
import React, { useState, useCallback } from 'react';
import { LocalizationProvider, useLocalization } from './hooks/useLocalization.ts';
import { useEntries } from './hooks/useEntries.ts';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import EntryList from './components/EntryList.tsx';
import Settings from './components/Settings.tsx';
import EntryForm from './components/EntryForm.tsx';
import { type Entry, type EntryType, type View } from './types.ts';
import { PlusIcon } from './components/icons.tsx';

const AppContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

    const { t } = useLocalization();
    const { addEntry, updateEntry, deleteEntry, entries, clearAllEntries } = useEntries();

    const handleOpenForm = useCallback((entry: Entry | null = null) => {
        setEditingEntry(entry);
        setIsFormOpen(true);
    }, []);

    const handleCloseForm = useCallback(() => {
        setIsFormOpen(false);
        setEditingEntry(null);
    }, []);

    const handleSaveEntry = useCallback(async (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingEntry) {
            await updateEntry({ ...entry, id: editingEntry.id, createdAt: editingEntry.createdAt });
        } else {
            await addEntry(entry);
        }
        handleCloseForm();
    }, [addEntry, updateEntry, editingEntry, handleCloseForm]);

    const handleDeleteEntry = useCallback(async (id: number) => {
        if (window.confirm(t('confirmDelete'))) {
            await deleteEntry(id);
        }
    }, [deleteEntry, t]);

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard entries={entries} onEdit={handleOpenForm} onDelete={handleDeleteEntry} />;
            case 'list':
                return <EntryList entries={entries} onEdit={handleOpenForm} onDelete={handleDeleteEntry} />;
            case 'settings':
                return <Settings onClearData={clearAllEntries} />;
            default:
                return <Dashboard entries={entries} onEdit={handleOpenForm} onDelete={handleDeleteEntry} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
            <Header currentView={currentView} setCurrentView={setCurrentView} />
            <main className="p-4 mx-auto max-w-4xl">
                {renderView()}
            </main>
            <button
                onClick={() => handleOpenForm()}
                className="fixed bottom-6 right-6 bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-transform duration-200 hover:scale-110"
                aria-label={t('addNewEntry')}
            >
                <PlusIcon className="h-6 w-6" />
            </button>
            {isFormOpen && (
                <EntryForm
                    isOpen={isFormOpen}
                    onClose={handleCloseForm}
                    onSave={handleSaveEntry}
                    entry={editingEntry}
                />
            )}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <LocalizationProvider>
            <AppContent />
        </LocalizationProvider>
    );
};

export default App;
