import React from 'react';
import { Calendar, Clock, Users, Video, CheckCircle2, ExternalLink } from 'lucide-react';
import { CalendarEventData } from '../../types';
import { useI18n } from '../../i18n';

interface CalendarEventCardProps {
  data: CalendarEventData;
}

export const CalendarEventCard: React.FC<CalendarEventCardProps> = ({ data }) => {
  const { t } = useI18n();

  return (
    <div className="mt-3 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 p-4 shadow-lg shadow-blue-950/20 text-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-blue-500/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block">
              Google Calendar
            </span>
            <h4 className="text-sm font-semibold text-white leading-tight">
              {data.title}
            </h4>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {t('tools.calendarCreated')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span><strong className="text-slate-400">{t('tools.date')}:</strong> {data.date}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span><strong className="text-slate-400">{t('tools.time')}:</strong> {data.time}</span>
        </div>
        {data.attendees && data.attendees.length > 0 && (
          <div className="flex items-center gap-2 text-slate-300 sm:col-span-2">
            <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">
              <strong className="text-slate-400">{t('tools.attendees')}:</strong> {data.attendees.join(', ')}
            </span>
          </div>
        )}
      </div>

      {data.meetingLink && (
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-indigo-300">
            <Video className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t('tools.meetingLink')}</span>
          </div>
          <a
            href={data.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-medium transition-colors"
          >
            <span>{t('tools.meetingLink')}</span>
            <ExternalLink className="w-3 h-3 rtl-mirror" />
          </a>
        </div>
      )}
    </div>
  );
};
