import { useState } from 'react';
import { MessageSquare, Send, Loader2, HelpCircle, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDoctor } from '@/hooks/useDoctor';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const quickHelp = [
  { title: 'How to add a patient?', link: '/patients/new' },
  { title: 'Create prescription', link: '/consultation' },
  { title: 'Manage medicines', link: '/medicines' },
  { title: 'View follow-ups', link: '/follow-ups' },
];

export function SupportWidget() {
  const { doctorId } = useDoctor();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium',
  });

  const handleSubmit = async () => {
    if (!doctorId) {
      toast.error('Please wait, loading your profile...');
      return;
    }

    if (!ticket.subject.trim() || !ticket.description.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          doctor_id: doctorId,
          subject: ticket.subject,
          description: ticket.description,
          category: ticket.category,
          priority: ticket.priority,
        });

      if (error) throw error;

      toast.success('Support ticket created! We\'ll get back to you soon.');
      setTicket({ subject: '', description: '', category: 'general', priority: 'medium' });
      setOpen(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    }

    setSubmitting(false);
  };

  return (
    <div className="medical-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <HelpCircle className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Need Help?</h3>
            <p className="text-sm text-muted-foreground">Quick links & support</p>
          </div>
        </div>
      </div>

      {/* Quick Help Links */}
      <div className="mb-4 space-y-2">
        {quickHelp.map((item) => (
          <a
            key={item.link}
            href={item.link}
            className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-all hover:border-primary/30 hover:bg-primary/5"
          >
            <span className="text-foreground">{item.title}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>
        ))}
      </div>

      {/* Create Support Ticket */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="w-full medical-btn-secondary">
            <MessageSquare className="h-4 w-4" />
            Create Support Ticket
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Category
              </label>
              <Select
                value={ticket.category}
                onValueChange={(value) => setTicket({ ...ticket, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Priority
              </label>
              <Select
                value={ticket.priority}
                onValueChange={(value) => setTicket({ ...ticket, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Subject
              </label>
              <input
                type="text"
                value={ticket.subject}
                onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                placeholder="Brief description of the issue"
                className="medical-input"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                value={ticket.description}
                onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                placeholder="Describe your issue in detail..."
                rows={4}
                className="medical-input resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full medical-btn-primary"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit Ticket
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
