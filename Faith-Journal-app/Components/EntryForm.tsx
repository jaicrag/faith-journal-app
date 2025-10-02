
import React, { useState, useEffect } from 'react';
import { type Entry, EntryType, Status } from '../types.ts';
import { useLocalization } from '../hooks/useLocalization.ts';
import Modal from './ui/Modal.tsx';
import Input from './ui/Input.tsx';
import Select from './ui/Select.tsx';
import Textarea from './ui/Textarea.tsx';
import Button from './ui/Button.tsx';

interface EntryFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => void;
    entry: Entry | null;
}

const EntryForm: React.FC<EntryFormProps> = ({ isOpen, onClose, onSave, entry }) => {
    const { t } = useLocalization();
    
    const getInitialState = () => {
        const now = new Date();
        const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
        const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[1].substring(0, 8);
        return {
            type: entry?.type || EntryType.Testimony,
            date: entry?.date || localDate,
            time: entry?.time || localTime,
            personName: entry?.personName || '',
            title: entry?.title || '',
            details: entry?.details || '',
            tags: entry?.tags?.join(', ') || '',
            status: entry?.status || Status.Pending,
        };
    };

    const [formState, setFormState] = useState(getInitialState);

    useEffect(() => {
        setFormState(getInitialState());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entry, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tagsArray = formState.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        const submission = {
            ...formState,
            tags: tagsArray,
        };
        // Remove status if not a prayer request
        if (submission.type !== EntryType.PrayerRequest) {
            delete (submission as Partial<typeof submission>).status;
        }

        onSave(submission);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={entry ? t('editEntry') : t('addNewEntry')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                    label={t('type')}
                    name="type"
                    value={formState.type}
                    onChange={handleChange}
                >
                    <option value={EntryType.Testimony}>{t('testimony')}</option>
                    <option value={EntryType.Gratitude}>{t('gratitude')}</option>
                    <option value={EntryType.PrayerRequest}>{t('prayerRequest')}</option>
                </Select>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label={t('date')}
                        type="date"
                        name="date"
                        value={formState.date}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label={t('time')}
                        type="time"
                        name="time"
                        step="1"
                        value={formState.time}
                        onChange={handleChange}
                        required
                    />
                </div>

                <Input
                    label={t('personName')}
                    type="text"
                    name="personName"
                    value={formState.personName}
                    onChange={handleChange}
                    required
                />
                <Input
                    label={t('title')}
                    type="text"
                    name="title"
                    value={formState.title}
                    onChange={handleChange}
                />
                <Textarea
                    label={t('details')}
                    name="details"
                    value={formState.details}
                    onChange={handleChange}
                    rows={4}
                    required
                />
                <Input
                    label={t('tags')}
                    type="text"
                    name="tags"
                    value={formState.tags}
                    onChange={handleChange}
                />

                {formState.type === EntryType.PrayerRequest && (
                    <Select
                        label={t('status')}
                        name="status"
                        value={formState.status}
                        onChange={handleChange}
                    >
                        <option value={Status.Pending}>{t('pending')}</option>
                        <option value={Status.InProgress}>{t('inProgress')}</option>
                        <option value={Status.Answered}>{t('answered')}</option>
                    </Select>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit">{t('save')}</Button>
                </div>
            </form>
        </Modal>
    );
};
