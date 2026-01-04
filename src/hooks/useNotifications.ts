import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { addDays, isAfter, isBefore, startOfDay, endOfDay, differenceInDays } from 'date-fns';

export interface Notification {
  id: string;
  type: 'followup_today' | 'followup_upcoming' | 'followup_overdue';
  title: string;
  message: string;
  date: string;
  patientId: string;
  patientName: string;
  prescriptionId: string;
  read: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    // Load read notification IDs from localStorage
    const stored = localStorage.getItem('readNotifications');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  useEffect(() => {
    const fetchFollowUps = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Get doctor ID
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!doctorData) {
        setLoading(false);
        return;
      }

      // Fetch prescriptions with follow-up dates
      const { data: prescriptions, error } = await supabase
        .from('prescriptions')
        .select(`
          id,
          follow_up_date,
          patient:patients(id, name, patient_id)
        `)
        .eq('doctor_id', doctorData.id)
        .not('follow_up_date', 'is', null)
        .order('follow_up_date', { ascending: true });

      if (error) {
        console.error('Error fetching follow-ups:', error);
        setLoading(false);
        return;
      }

      const today = startOfDay(new Date());
      const upcomingLimit = addDays(today, 7); // Show follow-ups within next 7 days
      const newNotifications: Notification[] = [];

      prescriptions?.forEach((rx) => {
        if (!rx.follow_up_date || !rx.patient) return;

        const followUpDate = startOfDay(new Date(rx.follow_up_date));
        const patient = rx.patient as { id: string; name: string; patient_id: string };
        const daysDiff = differenceInDays(followUpDate, today);

        // Overdue follow-ups (up to 30 days in the past)
        if (isBefore(followUpDate, today) && daysDiff >= -30) {
          newNotifications.push({
            id: `overdue-${rx.id}`,
            type: 'followup_overdue',
            title: 'Overdue Follow-up',
            message: `${patient.name} missed their follow-up ${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? 's' : ''} ago`,
            date: rx.follow_up_date,
            patientId: patient.id,
            patientName: patient.name,
            prescriptionId: rx.id,
            read: readIds.has(`overdue-${rx.id}`),
          });
        }
        // Today's follow-ups
        else if (daysDiff === 0) {
          newNotifications.push({
            id: `today-${rx.id}`,
            type: 'followup_today',
            title: 'Follow-up Today',
            message: `${patient.name} has a follow-up scheduled for today`,
            date: rx.follow_up_date,
            patientId: patient.id,
            patientName: patient.name,
            prescriptionId: rx.id,
            read: readIds.has(`today-${rx.id}`),
          });
        }
        // Upcoming follow-ups (next 7 days)
        else if (isAfter(followUpDate, today) && isBefore(followUpDate, upcomingLimit)) {
          newNotifications.push({
            id: `upcoming-${rx.id}`,
            type: 'followup_upcoming',
            title: 'Upcoming Follow-up',
            message: `${patient.name} has a follow-up in ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`,
            date: rx.follow_up_date,
            patientId: patient.id,
            patientName: patient.name,
            prescriptionId: rx.id,
            read: readIds.has(`upcoming-${rx.id}`),
          });
        }
      });

      // Sort: overdue first, then today, then upcoming
      newNotifications.sort((a, b) => {
        const priority = { followup_overdue: 0, followup_today: 1, followup_upcoming: 2 };
        if (priority[a.type] !== priority[b.type]) {
          return priority[a.type] - priority[b.type];
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      setNotifications(newNotifications);
      setLoading(false);
    };

    fetchFollowUps();

    // Refresh every 5 minutes
    const interval = setInterval(fetchFollowUps, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, readIds]);

  const markAsRead = (notificationId: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(notificationId);
      localStorage.setItem('readNotifications', JSON.stringify([...next]));
      return next;
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds((prev) => {
      const next = new Set([...prev, ...allIds]);
      localStorage.setItem('readNotifications', JSON.stringify([...next]));
      return next;
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};
