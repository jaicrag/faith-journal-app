import React, { useState, useMemo, useRef, useEffect } from 'react';
import { type Entry, EntryType, Status } from '../types.ts';
import { useLocalization } from '../hooks/useLocalization.ts';
import { exportToPDF } from '../services/pdfExporter.ts';
import Input from './ui/Input.tsx';
import Select from './ui/Select.tsx';
import Button from './ui/Button.tsx';
import Card from './ui/Card.tsx';
import { EditIcon, Trash2Icon, FileDownIcon, ChevronDownIcon, ChevronUpIcon } from './icons.tsx';

interface EntryListProps {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: number) => void;
}

const snakeToCamel = (str: string) => str.replace(/(_\w)/g, m => m[1].toUpperCase());

const EntryList: React.FC<EntryListProps> = ({ entries, onEdit, onDelete }) => {
  const { t } = useLocalization();
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: '',
    startDate: '',
    endDate: '',
    tags: [] as string[],
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Entry; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const tagFilterRef = useRef<HTMLDivElement>(null);

  const uniqueTags = useMemo(() => {
    const allTags = entries.flatMap(entry => entry.tags);
    return [...new Set(allTags)].sort();
  }, [entries]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagFilterRef.current && !tagFilterRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleTagChange = (tag: string) => {
    setFilters(prev => {
        const newTags = prev.tags.includes(tag)
            ? prev.tags.filter(t => t !== tag)
            : [...prev.tags, tag];
        return { ...prev, tags: newTags };
    });
  };

  const filteredEntries = useMemo(() => {
    let filtered = entries.filter(entry => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        entry.personName.toLowerCase().includes(searchLower) ||
        entry.title?.toLowerCase().includes(searchLower) ||
        entry.details.toLowerCase().includes(searchLower) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchLower));

      const matchesType = filters.type === 'all' || entry.type === filters.type;
      const matchesStatus = filters.status === 'all' || entry.status === filters.status;
      const matchesTags = filters.tags.length === 0 || entry.tags.some(tag => filters.tags.includes(tag));

      const entryDate = new Date(entry.date);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;
      
      if (startDate) startDate.setUTCHours(0,0,0,0);
      if (endDate) endDate.setUTCHours(23,59,59,999);
      
      const matchesDate = 
        (!startDate || entryDate >= startDate) && 
        (!endDate || entryDate <= endDate);

      return matchesSearch && matchesType && matchesStatus && matchesDate && matchesTags;
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];

        if (sortConfig.key === 'date') {
            aValue = new Date(`${a.date}T${a.time}`).getTime();
            bValue = new Date(`${b.date}T${b.time}`).getTime();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [entries, filters, sortConfig]);

  const requestSort = (key: keyof Entry) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: keyof Entry) => {
    if (!sortConfig || sortConfig.key !== key) {
        return null;
    }
    return sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4 ml-1" /> : <ChevronDownIcon className="w-4 h-4 ml-1" />;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-700">{t('entries')}</h1>
      
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-2 lg:col-span-4">
            <Input
              label={t('searchPlaceholder')}
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder={t('searchPlaceholder')}
            />
          </div>
           <Input
            label={t('startDate')}
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
           <Input
            label={t('endDate')}
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
          <Select label={t('type')} name="type" value={filters.type} onChange={handleFilterChange}>
            <option value="all">{t('allTypes')}</option>
            <option value={EntryType.Testimony}>{t('testimony')}</option>
            <option value={EntryType.Gratitude}>{t('gratitude')}</option>
            <option value={EntryType.PrayerRequest}>{t('prayerRequest')}</option>
          </Select>
          <Select label={t('status')} name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="all">{t('allStatuses')}</option>
            <option value={Status.Pending}>{t('pending')}</option>
            <option value={Status.InProgress}>{t('inProgress')}</option>
            <option value={Status.Answered}>{t('answered')}</option>
          </Select>
          
          <div className="relative sm:col-span-2 lg:col-span-2" ref={tagFilterRef}>
             <label className="block text-sm font-medium text-slate-700 mb-1">{t('tags')}</label>
             <button
                onClick={() => setIsTagDropdownOpen(prev => !prev)}
                className="w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm text-left flex justify-between items-center"
             >
                <span className={filters.tags.length > 0 ? 'text-slate-900' : 'text-slate-500'}>
                    {filters.tags.length > 0 ? `${filters.tags.length} ${t('tagsSelected')}` : t('filterByTags')}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-slate-500" />
             </button>
             {isTagDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <ul>
                        {uniqueTags.map(tag => (
                            <li key={tag} className="px-3 py-2 hover:bg-slate-100">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.tags.includes(tag)}
                                        onChange={() => handleTagChange(tag)}
                                        className="rounded text-primary-600 focus:ring-primary-500"
                                    />
                                    <span>{tag}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
             )}
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <Button onClick={() => exportToPDF(filteredEntries, t)} className="w-full flex items-center justify-center">
               <FileDownIcon className="w-4 h-4 mr-2" /> {t('exportToPDF')}
            </Button>
          </div>
        </div>
      </Card>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="w-full table-auto text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-slate-100" onClick={() => requestSort('date')}>
                <div className="flex items-center">{t('date')} {getSortIcon('date')}</div>
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-slate-100" onClick={() => requestSort('type')}>
                <div className="flex items-center">{t('type')} {getSortIcon('type')}</div>
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-slate-100" onClick={() => requestSort('personName')}>
                <div className="flex items-center">{t('personName')} {getSortIcon('personName')}</div>
              </th>
              <th scope="col" className="px-6 py-3">{t('title')}</th>
              <th scope="col" className="px-6 py-3">{t('status')}</th>
              <th scope="col" className="px-6 py-3 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map(entry => (
              <tr key={entry.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">{entry.date}</td>
                <td className="px-6 py-4">{t(snakeToCamel(entry.type))}</td>
                <td className="px-6 py-4">{entry.personName}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{entry.title}</td>
                <td className="px-6 py-4">{entry.status && t(snakeToCamel(entry.status))}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => onEdit(entry)} className="p-1 text-blue-600 hover:text-blue-800" aria-label={t('edit')}><EditIcon className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(entry.id)} className="p-1 text-red-600 hover:text-red-800" aria-label={t('delete')}><Trash2Icon className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredEntries.length === 0 && (
          <p className="text-center p-8 text-slate-500">{t('noEntriesFound')}</p>
        )}
      </div>
    </div>
  );
};
