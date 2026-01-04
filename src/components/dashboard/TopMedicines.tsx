import { Pill, TrendingUp, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDoctor } from '@/hooks/useDoctor';

interface MedicineUsage {
  name: string;
  count: number;
  percentage: number;
}

export function TopMedicines() {
  const { doctorId } = useDoctor();

  const { data: topMedicines = [], isLoading } = useQuery({
    queryKey: ['top-medicines', doctorId],
    queryFn: async (): Promise<MedicineUsage[]> => {
      if (!doctorId) return [];

      const { data, error } = await supabase
        .from('prescriptions')
        .select('medicines')
        .eq('doctor_id', doctorId);

      if (error) {
        console.error('Error fetching prescriptions:', error);
        return [];
      }

      // Count medicine usage
      const medicineCount: Record<string, number> = {};
      (data || []).forEach((prescription) => {
        const medicines = prescription.medicines as any[];
        if (Array.isArray(medicines)) {
          medicines.forEach((medicine: any) => {
            if (medicine.name) {
              medicineCount[medicine.name] = (medicineCount[medicine.name] || 0) + 1;
            }
          });
        }
      });

      // Convert to array and sort
      const sorted = Object.entries(medicineCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate percentages based on max count
      const maxCount = sorted.length > 0 ? sorted[0].count : 1;
      return sorted.map((m) => ({
        ...m,
        percentage: Math.round((m.count / maxCount) * 100),
      }));
    },
    enabled: !!doctorId,
  });

  return (
    <div className="medical-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top Medicines</h3>
          <p className="text-sm text-muted-foreground">Most prescribed</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
          <TrendingUp className="h-5 w-5 text-accent" />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && topMedicines.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Pill className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No prescriptions yet</p>
        </div>
      )}

      {!isLoading && topMedicines.length > 0 && (
        <div className="space-y-4">
          {topMedicines.map((medicine, index) => (
            <div
              key={medicine.name}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{medicine.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{medicine.count} times</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full gradient-primary transition-all duration-500"
                  style={{ width: `${medicine.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
