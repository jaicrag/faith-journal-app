import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { type Entry, EntryType, Status } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import Card from './ui/Card';
import { TagIcon, UserIcon } from './icons';

interface DashboardProps {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: number) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
type DateRange = 'today' | 'week' | 'month' | 'all';

const Dashboard: React.FC<DashboardProps> = ({ entries, onEdit, onDelete }) => {
  const { t } = useLocalization();
  const [dateRange, setDateRange] = useState<DateRange>('all');

  const filteredEntries = useMemo(() => {
    if (dateRange === 'all') {
      return entries;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0); 
    
    let startDate: Date;

    switch (dateRange) {
        case 'today':
            startDate = now;
            break;
        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay()); // Assuming Sunday is day 0
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
    }

    return entries.filter(e => {
        const [year, month, day] = e.date.split('-').map(Number);
        // Create date in local timezone by passing parts
        const entryDate = new Date(year, month - 1, day);
        return entryDate >= startDate;
    });

  }, [entries, dateRange]);


  const summary = React.useMemo(() => {
    const prayerRequests = filteredEntries.filter(e => e.type === EntryType.PrayerRequest);
    return {
      total: filteredEntries.length,
      testimonies: filteredEntries.filter(e => e.type === EntryType.Testimony).length,
      gratitudes: filteredEntries.filter(e => e.type === EntryType.Gratitude).length,
      prayerRequests: prayerRequests.length,
      pending: prayerRequests.filter(e => e.status === Status.Pending).length,
      inProgress: prayerRequests.filter(e => e.status === Status.InProgress).length,
      answered: prayerRequests.filter(e => e.status === Status.Answered).length,
    };
  }, [filteredEntries]);

  const entriesByTypeData = [
    { name: t('testimony'), count: summary.testimonies },
    { name: t('gratitude'), count: summary.gratitudes },
    { name: t('prayerRequest'), count: summary.prayerRequests },
  ];

  const prayerStatusData = [
    { name: t('pending'), value: summary.pending },
    { name: t('inProgress'), value: summary.inProgress },
    { name: t('answered'), value: summary.answered },
  ].filter(item => item.value > 0);

  const topPeople = React.useMemo(() => {
    const counts = filteredEntries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.personName] = (acc[entry.personName] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredEntries]);

  const trendingTags = React.useMemo(() => {
    const counts = filteredEntries.flatMap(e => e.tags).reduce<Record<string, number>>((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredEntries]);

  const recentAnswered = React.useMemo(() => {
    return filteredEntries
        .filter(e => e.type === EntryType.PrayerRequest && e.status === Status.Answered)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3);
  }, [filteredEntries]);
  
  const dateRangeOptions: {key: DateRange, label: string}[] = [
      { key: 'today', label: t('today') },
      { key: 'week', label: t('thisWeek') },
      { key: 'month', label: t('thisMonth') },
      { key: 'all', label: t('allTime') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-700">{t('dashboard')}</h1>
        <div className="flex items-center bg-slate-200 rounded-lg p-1 text-sm self-start sm:self-auto">
            {dateRangeOptions.map(option => (
                <button
                    key={option.key}
                    onClick={() => setDateRange(option.key)}
                    className={`px-3 py-1 rounded-md transition-colors duration-200 font-medium ${
                        dateRange === option.key
                            ? 'bg-white text-primary-700 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-300'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="font-bold text-lg text-slate-600">{t('totalEntries')}</h3>
          <p className="text-4xl font-bold text-primary-600">{summary.total}</p>
        </Card>
        <Card>
          <h3 className="font-bold text-lg text-slate-600">{t('testimonies')}</h3>
          <p className="text-4xl font-bold text-green-500">{summary.testimonies}</p>
        </Card>
        <Card>
          <h3 className="font-bold text-lg text-slate-600">{t('gratitude')}</h3>
          <p className="text-4xl font-bold text-amber-500">{summary.gratitudes}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-slate-700">{t('entriesByType')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={entriesByTypeData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-slate-700">{t('prayerRequestsByStatus')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={prayerStatusData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label>
                {prayerStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <h3 className="text-xl font-semibold mb-4 text-slate-700">{t('topPeople')}</h3>
          <ul className="space-y-2">
            {topPeople.map(([name, count]) => (
              <li key={name} className="flex items-center justify-between text-slate-600">
                <span className="flex items-center"><UserIcon className="w-4 h-4 mr-2 text-primary-500"/> {name}</span>
                <span className="font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full text-sm">{count}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="md:col-span-2">
          <h3 className="text-xl font-semibold mb-4 text-slate-700">{t('recentAnsweredPrayers')}</h3>
          <div className="space-y-2">
            {recentAnswered.length > 0 ? recentAnswered.map(entry => (
                <div key={entry.id} className="p-2 bg-slate-50 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-slate-700">{entry.title || t('prayerRequest')}</p>
                        <p className="text-sm text-slate-500">{entry.personName} - {entry.date}</p>
                    </div>
                    <button onClick={() => onEdit(entry)} className="text-primary-600 hover:underline text-sm font-medium">{t('edit')}</button>
                </div>
            )) : <p className="text-slate-500">{t('noEntriesFound')}</p>}
          </div>
        </Card>
      </div>
       <Card>
          <h3 className="text-xl font-semibold mb-4 text-slate-700">{t('trendingTags')}</h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map(([tag, count]) => (
              <div key={tag} className="flex items-center bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                <TagIcon className="w-4 h-4 mr-1"/>
                {tag}
                <span className="ml-2 bg-white text-gray-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </Card>

    </div>
  );
};