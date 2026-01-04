import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDoctor } from './useDoctor';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, getDay } from 'date-fns';

interface MonthlyData {
  month: string;
  patients: number;
  prescriptions: number;
}

interface WeeklyData {
  day: string;
  patients: number;
}

interface CategoryData {
  name: string;
  count: number;
}

interface MedicineUsage {
  name: string;
  count: number;
}

interface AnalyticsData {
  monthlyTrend: MonthlyData[];
  weeklyOverview: WeeklyData[];
  symptomCategories: CategoryData[];
  topMedicines: MedicineUsage[];
  totalPatients: number;
  thisMonthPatients: number;
  totalPrescriptions: number;
  thisMonthPrescriptions: number;
}

export function useAnalytics() {
  const { doctorId } = useDoctor();

  return useQuery({
    queryKey: ['analytics', doctorId],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!doctorId) {
        return {
          monthlyTrend: [],
          weeklyOverview: [],
          symptomCategories: [],
          topMedicines: [],
          totalPatients: 0,
          thisMonthPatients: 0,
          totalPrescriptions: 0,
          thisMonthPrescriptions: 0,
        };
      }

      const now = new Date();
      const thisMonthStart = startOfMonth(now).toISOString();
      const thisMonthEnd = endOfMonth(now).toISOString();

      // Fetch all data in parallel
      const [
        patientsResult,
        prescriptionsResult,
        thisMonthPatientsResult,
        thisMonthPrescriptionsResult,
      ] = await Promise.all([
        supabase
          .from('patients')
          .select('id, created_at, visit_date')
          .eq('doctor_id', doctorId),
        supabase
          .from('prescriptions')
          .select('id, created_at, symptoms, medicines')
          .eq('doctor_id', doctorId),
        supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .eq('doctor_id', doctorId)
          .gte('created_at', thisMonthStart)
          .lte('created_at', thisMonthEnd),
        supabase
          .from('prescriptions')
          .select('id', { count: 'exact', head: true })
          .eq('doctor_id', doctorId)
          .gte('created_at', thisMonthStart)
          .lte('created_at', thisMonthEnd),
      ]);

      const patients = patientsResult.data || [];
      const prescriptions = prescriptionsResult.data || [];

      // Calculate monthly trend (last 12 months)
      const monthlyTrend: MonthlyData[] = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const monthLabel = format(monthDate, 'MMM');

        const monthPatients = patients.filter((p) => {
          const date = parseISO(p.created_at);
          return date >= monthStart && date <= monthEnd;
        }).length;

        const monthPrescriptions = prescriptions.filter((p) => {
          const date = parseISO(p.created_at);
          return date >= monthStart && date <= monthEnd;
        }).length;

        monthlyTrend.push({
          month: monthLabel,
          patients: monthPatients,
          prescriptions: monthPrescriptions,
        });
      }

      // Calculate weekly overview (current week)
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      const weeklyOverview: WeeklyData[] = daysOfWeek.map((day, index) => {
        const dayPatients = patients.filter((p) => {
          const date = parseISO(p.visit_date);
          const dayOfWeek = getDay(date);
          // Convert Sunday (0) to 6, and shift others down by 1
          const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          return date >= weekStart && date <= weekEnd && adjustedDay === index;
        }).length;

        return { day, patients: dayPatients };
      });

      // Calculate symptom categories from prescriptions
      const categoryCount: Record<string, number> = {};
      prescriptions.forEach((p) => {
        const symptoms = p.symptoms as any[];
        if (Array.isArray(symptoms)) {
          symptoms.forEach((symptom: any) => {
            if (symptom.category) {
              categoryCount[symptom.category] = (categoryCount[symptom.category] || 0) + 1;
            }
          });
        }
      });

      const symptomCategories: CategoryData[] = Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Calculate top medicines from prescriptions
      const medicineCount: Record<string, number> = {};
      prescriptions.forEach((p) => {
        const medicines = p.medicines as any[];
        if (Array.isArray(medicines)) {
          medicines.forEach((medicine: any) => {
            if (medicine.name) {
              medicineCount[medicine.name] = (medicineCount[medicine.name] || 0) + 1;
            }
          });
        }
      });

      const topMedicines: MedicineUsage[] = Object.entries(medicineCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        monthlyTrend,
        weeklyOverview,
        symptomCategories,
        topMedicines,
        totalPatients: patients.length,
        thisMonthPatients: thisMonthPatientsResult.count ?? 0,
        totalPrescriptions: prescriptions.length,
        thisMonthPrescriptions: thisMonthPrescriptionsResult.count ?? 0,
      };
    },
    enabled: !!doctorId,
  });
}
