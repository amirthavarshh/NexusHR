import React, { useState } from 'react';
import { useAllEmployees, useEmployeeReviews, useCreateReview } from '../hooks/useHrQuery';
import type { Employee } from '../types';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Dialog
} from '../../components/ui';
import { Star, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const StarRating: React.FC<{ rating: number; onChange?: (r: number) => void }> = ({ rating, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`transition-transform ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <Star
            size={18}
            className={star <= (hover || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}
          />
        </button>
      ))}
    </div>
  );
};

export const ReviewsManagement: React.FC = () => {
  const { data: employees = [] } = useAllEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [writeOpen, setWriteOpen] = useState(false);
  const [expandedReview, setExpandedReview] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data: reviews = [], isLoading: reviewsLoading } = useEmployeeReviews(selectedEmployee?.id ?? 0);
  const createMutation = useCreateReview();

  const [form, setForm] = useState({ rating: 4, feedback: '', goals: '' });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!selectedEmployee || !form.feedback) return;
    try {
      await createMutation.mutateAsync({
        employeeId: selectedEmployee.id,
        rating: form.rating,
        feedback: form.feedback,
        goals: form.goals,
      });
      setWriteOpen(false);
      setForm({ rating: 4, feedback: '', goals: '' });
      showToast(`Performance review submitted for ${selectedEmployee.firstName} ${selectedEmployee.lastName}.`);
    } catch (e: any) { showToast(e.message || 'Failed to submit review.'); }
  };

  const getRatingColor = (r: number) =>
    r >= 4.5 ? 'text-emerald-600' : r >= 3.5 ? 'text-teal-600' : r >= 2.5 ? 'text-amber-600' : 'text-rose-600';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Performance Reviews</h2>
        <p className="text-xs text-slate-500">Write and manage performance evaluations for all employees.</p>
      </div>

      {toast && (
        <div className="p-3 rounded-lg text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/20 dark:text-teal-400 animate-fadeIn">{toast}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Employee Selector */}
        <Card className="border border-slate-100 dark:border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle>Select Employee</CardTitle>
            <CardDescription>Choose an employee to view or write their review.</CardDescription>
          </CardHeader>
          <CardContent className="pt-3 space-y-1 max-h-[500px] overflow-y-auto">
            {employees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${selectedEmployee?.id === emp.id
                  ? 'bg-teal-50 border border-teal-200 dark:bg-teal-950/20 dark:border-teal-900/30'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
              >
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 flex items-center justify-center text-[10px] font-extrabold uppercase shrink-0">
                  {emp.firstName.slice(0, 1)}{emp.lastName.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">{emp.firstName} {emp.lastName}</span>
                  <span className="text-[10px] text-slate-400 truncate block">{emp.position}</span>
                </div>
                {emp.performanceRating && (
                  <span className={`text-[10px] font-extrabold ml-auto shrink-0 ${getRatingColor(emp.performanceRating)}`}>
                    {emp.performanceRating.toFixed(1)}★
                  </span>
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Review History Panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedEmployee ? (
            <>
              {/* Employee Card Header */}
              <Card className="border border-teal-100 dark:border-teal-900/30 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20">
                <CardContent className="pt-5 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white border border-teal-200 dark:bg-teal-950/40 dark:border-teal-900/30 flex items-center justify-center text-sm font-extrabold uppercase text-teal-700 dark:text-teal-400">
                      {selectedEmployee.firstName.slice(0, 1)}{selectedEmployee.lastName.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-855 dark:text-white text-sm">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">{selectedEmployee.position} · {selectedEmployee.department}</p>
                      {selectedEmployee.performanceRating && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <StarRating rating={selectedEmployee.performanceRating} />
                          <span className={`text-xs font-extrabold ${getRatingColor(selectedEmployee.performanceRating)}`}>
                            {selectedEmployee.performanceRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => setWriteOpen(true)}>
                    <Plus size={13} />
                    <span>Write Review</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Review History */}
              <Card className="border border-slate-100 dark:border-slate-800">
                <CardHeader>
                  <CardTitle>Review History</CardTitle>
                  <CardDescription>{reviews.length} performance evaluation{reviews.length !== 1 ? 's' : ''} on record.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reviewsLoading ? (
                    <div className="text-center py-8 text-slate-400 text-xs">Loading reviews...</div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">No performance reviews yet. Write the first one!</div>
                  ) : (
                    reviews.map(rev => (
                      <div key={rev.id} className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedReview(expandedReview === rev.id ? null : rev.id)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <StarRating rating={rev.rating} />
                              <span className={`text-xs font-extrabold ${getRatingColor(rev.rating)}`}>{rev.rating.toFixed(1)}</span>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Review by {rev.reviewer?.username}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{new Date(rev.reviewDate).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                          {expandedReview === rev.id ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
                        </button>
                        {expandedReview === rev.id && (
                          <div className="px-4 pb-4 space-y-3 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
                            <div className="pt-3">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Performance Feedback</span>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{rev.feedback}</p>
                            </div>
                            {rev.goals && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Development Goals</span>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{rev.goals}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center py-16">
              <div className="text-center text-slate-400">
                <Star size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">Select an employee to view their reviews</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      <Dialog
        isOpen={writeOpen}
        onClose={() => setWriteOpen(false)}
        title={`Write Review — ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`}
        description="Provide a detailed performance evaluation. This will be recorded in the employee's permanent file."
        footer={
          <>
            <Button variant="outline" onClick={() => setWriteOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={createMutation.isPending} disabled={!form.feedback}>
              Submit Review
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Performance Rating *</label>
            <div className="flex items-center gap-3">
              <StarRating rating={form.rating} onChange={r => setForm({ ...form, rating: r })} />
              <span className={`text-sm font-extrabold ${getRatingColor(form.rating)}`}>
                {form.rating.toFixed(1)} / 5.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Click a star to set rating</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Performance Feedback *</label>
            <textarea
              value={form.feedback}
              onChange={e => setForm({ ...form, feedback: e.target.value })}
              placeholder="Provide specific, constructive feedback on the employee's performance, achievements, and areas for improvement..."
              rows={5}
              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-400 resize-none text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 placeholder-slate-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Development Goals</label>
            <textarea
              value={form.goals}
              onChange={e => setForm({ ...form, goals: e.target.value })}
              placeholder="Define specific, measurable goals for the next review cycle..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-400 resize-none text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 placeholder-slate-400"
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
};
