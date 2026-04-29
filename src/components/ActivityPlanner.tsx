import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Clock, Plus, Trash2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface PlannedActivity {
  id: string;
  title: string;
  type: 'workout' | 'session';
  day: string; // ISO Date or Day of week
  time?: string;
  completed: boolean;
}

interface ActivityPlannerProps {
  storageKey: string;
  type: 'workout' | 'session';
  title: string;
}

const ActivityPlanner: React.FC<ActivityPlannerProps> = ({ storageKey, type, title }) => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<PlannedActivity[]>([]);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setActivities(JSON.parse(saved));
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(activities));
  }, [activities, storageKey]);

  const addActivity = () => {
    if (!newActivityTitle.trim()) return;

    const newAct: PlannedActivity = {
      id: Math.random().toString(36).substr(2, 9),
      title: newActivityTitle,
      type,
      day: selectedDay,
      completed: false,
    };

    setActivities([...activities, newAct]);
    setNewActivityTitle('');
    toast.success(t('common.saved') || 'تم الحفظ');
  };

  const toggleComplete = (id: string) => {
    setActivities(activities.map(a => 
      a.id === id ? { ...a, completed: !a.completed } : a
    ));
  };

  const deleteActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const filteredActivities = activities.filter(a => a.day === selectedDay);

  return (
    <div className="bg-card border border-border/40 rounded-[2rem] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg font-naskh flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-accent" />
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl h-8 text-[10px] uppercase tracking-widest font-bold">
            <Bell className="w-3 h-3 mr-1" />
            تنبيه
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <input 
          type="date"
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="bg-muted/50 border border-border/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="flex-1 flex gap-2">
          <input 
            type="text"
            placeholder={type === 'workout' ? 'اسم التمرين...' : 'عنوان الجلسة...'}
            value={newActivityTitle}
            onChange={(e) => setNewActivityTitle(e.target.value)}
            className="flex-1 bg-muted/50 border border-border/40 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <Button onClick={addActivity} size="icon" className="rounded-xl shrink-0">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm font-naskh opacity-50">
            لا توجد مهام لهذا اليوم
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div 
              key={activity.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                activity.completed 
                  ? 'bg-primary/5 border-primary/20 opacity-70' 
                  : 'bg-card border-border/60 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleComplete(activity.id)}
                  className={`transition-colors ${activity.completed ? 'text-primary' : 'text-muted-foreground hover:text-accent'}`}
                >
                  <CheckCircle2 className="w-6 h-6" />
                </button>
                <div>
                  <p className={`font-bold text-sm font-naskh ${activity.completed ? 'line-through' : ''}`}>
                    {activity.title}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{activity.time || 'لم يحدد وقت'}</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => deleteActivity(activity.id)}
                className="text-muted-foreground hover:text-destructive rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityPlanner;
