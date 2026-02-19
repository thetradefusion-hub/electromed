import { ScrollText, Shield, Beaker, Pill, ClipboardList, HeartPulse, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TreatmentSummaryCardProps {
  summary: string;
  isLoading: boolean;
}

// Parse markdown-like summary into structured sections
const parseSummary = (text: string) => {
  const sections: { title: string; content: string; icon: 'shield' | 'beaker' | 'pill' | 'clipboard' | 'heart' }[] = [];
  
  // Split by bold headers like **Title**
  const lines = text.split('\n');
  let currentSection: { title: string; content: string; icon: 'shield' | 'beaker' | 'pill' | 'clipboard' | 'heart' } | null = null;
  
  const getIcon = (title: string): 'shield' | 'beaker' | 'pill' | 'clipboard' | 'heart' => {
    const lower = title.toLowerCase();
    if (lower.includes('अवस्था') || lower.includes('classification') || lower.includes('positive') || lower.includes('negative')) return 'shield';
    if (lower.includes('सारांश') || lower.includes('उपचार') || lower.includes('treatment')) return 'beaker';
    if (lower.includes('मिश्रण') || lower.includes('खुराक') || lower.includes('dosage') || lower.includes('तालिका')) return 'pill';
    if (lower.includes('निर्देश') || lower.includes('सलाह') || lower.includes('instruction')) return 'heart';
    return 'clipboard';
  };

  for (const line of lines) {
    const headerMatch = line.match(/^\*\*(.+?)\*\*:?\s*$/);
    const numberedHeaderMatch = line.match(/^\d+\.\s*\*\*(.+?)\*\*:?\s*$/);
    
    if (headerMatch || numberedHeaderMatch) {
      if (currentSection) sections.push(currentSection);
      const title = (headerMatch?.[1] || numberedHeaderMatch?.[1] || '').trim();
      currentSection = { title, content: '', icon: getIcon(title) };
    } else if (currentSection) {
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    } else {
      // Content before any header
      if (line.trim()) {
        if (!currentSection) {
          currentSection = { title: 'विश्लेषण', content: line, icon: 'shield' };
        }
      }
    }
  }
  if (currentSection) sections.push(currentSection);
  
  return sections;
};

const iconMap = {
  shield: Shield,
  beaker: Beaker,
  pill: Pill,
  clipboard: ClipboardList,
  heart: HeartPulse,
};

const iconColorMap = {
  shield: 'text-blue-600 bg-blue-100',
  beaker: 'text-emerald-600 bg-emerald-100',
  pill: 'text-purple-600 bg-purple-100',
  clipboard: 'text-amber-600 bg-amber-100',
  heart: 'text-rose-600 bg-rose-100',
};

// Format content: bold text, bullet points, tables
const FormattedContent = ({ content }: { content: string }) => {
  const lines = content.trim().split('\n').filter(l => l.trim());
  
  // Check if lines look like a table (contain | separator)
  const isTable = lines.some(l => l.includes('|') && l.split('|').length >= 3);
  
  if (isTable) {
    const tableLines = lines.filter(l => l.includes('|'));
    const rows = tableLines.map(l => 
      l.split('|').map(cell => cell.trim()).filter(cell => cell && !cell.match(/^-+$/))
    ).filter(r => r.length > 0);
    
    if (rows.length > 1) {
      return (
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border">
                {rows[0].map((cell, i) => (
                  <th key={i} className="py-2 px-3 text-left font-semibold text-foreground bg-muted/50">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).filter(r => !r.every(c => c.match(/^-+$/))).map((row, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="py-2 px-3 text-foreground/80">
                      <InlineFormatted text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }
  
  return (
    <div className="space-y-1.5 mt-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.match(/^[\*\-]\s/)) {
          return (
            <div key={i} className="flex gap-2 text-sm text-foreground/85 pl-1">
              <span className="text-primary mt-0.5 shrink-0">•</span>
              <span><InlineFormatted text={trimmed.replace(/^[\-\•\*]\s*/, '')} /></span>
            </div>
          );
        }
        return (
          <p key={i} className="text-sm text-foreground/85 leading-relaxed">
            <InlineFormatted text={trimmed} />
          </p>
        );
      })}
    </div>
  );
};

// Handle inline bold formatting **text**
const InlineFormatted = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export const TreatmentSummaryCard = ({ summary, isLoading }: TreatmentSummaryCardProps) => {
  if (!summary && !isLoading) return null;

  const sections = summary ? parseSummary(summary) : [];

  return (
    <div className="medical-card border-primary/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <ScrollText className="h-4.5 w-4.5 text-primary" />
          </div>
          उपचार सारांश
        </h3>
        <Badge variant="outline" className="text-xs font-medium border-primary/30 text-primary bg-primary/5">
          <Shield className="h-3 w-3 mr-1" />
          Rule Engine Analysis
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-2 border-primary/20 flex items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground">
              उपचार सारांश तैयार हो रहा है...
            </p>
            <p className="text-xs text-muted-foreground">
              Rule Engine लक्षणों और दवाओं का विश्लेषण कर रहा है
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => {
            const IconComponent = iconMap[section.icon];
            const colorClass = iconColorMap[section.icon];
            
            return (
              <div
                key={index}
                className="rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/20"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                    <IconComponent className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground mb-1">
                      {section.title}
                    </h4>
                    <FormattedContent content={section.content} />
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Footer */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] text-muted-foreground">
              यह सारांश इलेक्ट्रो-होम्योपैथी Rule Engine द्वारा स्वचालित रूप से तैयार किया गया है
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
