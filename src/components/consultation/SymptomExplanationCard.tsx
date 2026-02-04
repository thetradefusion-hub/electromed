import { SymptomExplanation } from '@/hooks/useAISymptomExplainer';
import { BookOpen, AlertTriangle, Stethoscope, Activity, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SymptomExplanationCardProps {
  explanation: SymptomExplanation;
  isLoading?: boolean;
}

export const SymptomExplanationCard = ({ explanation, isLoading }: SymptomExplanationCardProps) => {
  if (isLoading) {
    return (
      <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Fetching medical information...</span>
        </div>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <div className="mt-2 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-blue-600" />
        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
          Medical Reference
        </span>
      </div>

      {/* Medical Definition */}
      <div>
        <p className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
          <Stethoscope className="h-3 w-3" />
          Definition
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          {explanation.medicalDefinition}
        </p>
      </div>

      {/* Pathophysiology */}
      <div>
        <p className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Pathophysiology
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          {explanation.pathophysiology}
        </p>
      </div>

      {/* Associated Conditions */}
      {explanation.associatedConditions && explanation.associatedConditions.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1.5">
            Associated Conditions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {explanation.associatedConditions.map((condition, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className="text-xs bg-white/80 border border-slate-200"
              >
                {condition}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Significance */}
      <div className="rounded-md bg-amber-50 border border-amber-200 p-2">
        <p className="text-xs font-medium text-amber-700 mb-1 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Clinical Significance
        </p>
        <p className="text-xs text-amber-800 leading-relaxed">
          {explanation.clinicalSignificance}
        </p>
      </div>

      {/* Differential Considerations */}
      <div>
        <p className="text-xs font-medium text-slate-600 mb-1">
          Differential Considerations
        </p>
        <p className="text-xs text-slate-600 italic leading-relaxed">
          {explanation.differentialConsiderations}
        </p>
      </div>
    </div>
  );
};
