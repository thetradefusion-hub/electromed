import { Pill, TrendingUp } from 'lucide-react';

const topMedicines = [
  { name: 'S1 (Scrofoloso)', count: 45, percentage: 85 },
  { name: 'A3 (Antisifilitico)', count: 38, percentage: 72 },
  { name: 'F1 (Febrifugo)', count: 32, percentage: 61 },
  { name: 'P1 (Pettorale)', count: 28, percentage: 53 },
  { name: 'L1 (Linfatico)', count: 24, percentage: 46 },
];

export function TopMedicines() {
  return (
    <div className="medical-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top Medicines</h3>
          <p className="text-sm text-muted-foreground">Most prescribed this month</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
          <TrendingUp className="h-5 w-5 text-accent" />
        </div>
      </div>

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
    </div>
  );
}
