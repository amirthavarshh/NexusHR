import React, { useState, useEffect } from 'react';
import { 
  useDirectReports, useEmployeeReviews, useCreateReview 
} from '../hooks/useManagerQuery';
import { 
  Card, CardContent, CardHeader,
  Button, Select, Dialog
} from '../../admin/components/ui';
import { 
  Award, Plus, Star, ClipboardCheck
} from 'lucide-react';

export const PerformanceReviews: React.FC = () => {
  const { data: reports = [] } = useDirectReports();
  const [selectedReportId, setSelectedReportId] = useState<number | ''>('');

  // Fetch reviews for selected report
  const { data: reviews = [], isLoading: isReviewsLoading } = useEmployeeReviews(selectedReportId as number);
  const createReviewMutation = useCreateReview();

  // Selected report details helper
  const activeReport = reports.find(r => r.id === selectedReportId);

  // Auto-select first report
  useEffect(() => {
    if (reports.length > 0 && !selectedReportId) {
      setSelectedReportId(reports[0].id);
    }
  }, [reports, selectedReportId]);

  // Dialog Form states
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState('5');
  const [feedback, setFeedback] = useState('');

  // Status notification helper
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (text: string) => {
    setStatusMessage(text);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setRating('5');
    setFeedback('');
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId || !feedback) return;

    try {
      await createReviewMutation.mutateAsync({
        employeeId: selectedReportId as number,
        rating: Number(rating),
        feedback
      });
      showStatus('Performance evaluation submitted successfully!');
      setFormOpen(false);
    } catch {
      showStatus('Could not save performance evaluation.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Team Performance Reviews</h2>
          <p className="text-xs text-slate-500">Submit review statements, rate operational accomplishments, and audit histories.</p>
        </div>
        <Button 
          onClick={handleOpenCreate} 
          disabled={!selectedReportId}
          className="btn-primary self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Write Evaluation</span>
        </Button>
      </div>

      {/* Global Status Banner */}
      {statusMessage && (
        <div className="p-3 rounded text-xs font-bold bg-emerald-50 text-emerald-705 border border-emerald-205 dark:bg-emerald-950/20 dark:text-emerald-400 animate-fadeIn">
          {statusMessage}
        </div>
      )}

      {/* Employee Selector Bar */}
      <Card className="accent-border-mint">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold shrink-0">
                <ClipboardCheck size={14} />
                <span>Select Employee:</span>
              </div>
              <Select 
                value={selectedReportId} 
                onChange={(e) => setSelectedReportId(Number(e.target.value))}
                className="w-full md:w-60"
              >
                {reports.map(r => (
                  <option key={r.id} value={r.id}>{r.firstName} {r.lastName} ({r.position})</option>
                ))}
              </Select>
            </div>
            
            {activeReport && (
              <div className="flex items-center gap-3 text-xs font-bold font-mono">
                <span className="text-slate-450">Current Rating:</span>
                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1 dark:bg-amber-955/20 dark:text-amber-400">
                  <Star size={11} fill="currentColor" />
                  <span>{activeReport.performanceRating ? activeReport.performanceRating.toFixed(1) : 'N/A'}</span>
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance logs timeline */}
      <div className="space-y-4">
        <span className="text-[10px] font-extrabold text-slate-450 block uppercase tracking-wider">Evaluation logs timeline</span>
        
        {isReviewsLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading logs...</div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <Card key={rev.id} className="accent-border-lavender">
                <CardHeader className="pb-2 border-b border-slate-50 dark:border-slate-800/40 flex flex-row justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-indigo-500" />
                    <span className="text-xs font-bold text-slate-705 dark:text-slate-350">Reviewed By: {rev.reviewerName}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-750 px-1.5 py-0.5 rounded font-extrabold font-mono text-[10px] dark:bg-amber-955/15 dark:text-amber-400">
                    <Star size={10} fill="currentColor" />
                    <span>{rev.rating.toFixed(1)} / 5.0</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 text-xs leading-relaxed text-slate-655 dark:text-slate-400 font-semibold italic">
                  "{rev.feedback}"
                  <span className="text-[9px] text-slate-400 block not-italic mt-2 font-mono">
                    Evaluation Date: {new Date(rev.reviewDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs bg-white dark:bg-slate-850 rounded border border-slate-100 dark:border-slate-800">
            No performance evaluation logs written for this employee.
          </div>
        )}
      </div>

      {/* Review creation Form modal */}
      <Dialog
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Write Performance Evaluation"
        description="Provide comprehensive review statements and assign rating metrics."
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={createReviewMutation.isPending}>Submit Evaluation</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">Rating Score (1-5 Stars)</label>
            <Select value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="5">5.0 - Outstanding Exceptional Performance</option>
              <option value="4">4.0 - Exceeds Job Expectations</option>
              <option value="3">3.0 - Meets Expectations Competently</option>
              <option value="2">2.0 - Needs Development Support</option>
              <option value="1">1.0 - Unacceptable Performance Level</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Review Feedback Statement *</label>
            <textarea 
              value={feedback} 
              onChange={(e) => setFeedback(e.target.value)} 
              placeholder="Alice is an exceptionally skilled engineer. She demonstrated outstanding leadership refactoring the layout..."
              className="w-full bg-slate-50 border border-slate-100 rounded p-2.5 text-xs h-32 outline-none focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
        </form>
      </Dialog>

    </div>
  );
};
