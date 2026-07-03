import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Sparkles, Settings } from 'lucide-react';
import { Button, Input, Card, Badge } from '../../components/ui';

interface EmployeeDetailDrawerProps {
  employee: any;
  onClose: () => void;
  onEditProfile: () => void;
}

export const EmployeeDetailDrawer: React.FC<EmployeeDetailDrawerProps> = ({ 
  employee, onClose, onEditProfile 
}) => {
  const { showToast } = useAuth();
  const queryClient = useQueryClient();
  
  const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});

  // Appraisal Form
  const [rating, setRating] = useState('5.0');
  const [feedback, setFeedback] = useState('');
  const [reviewGoals, setReviewGoals] = useState('');
  
  // Goal Form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', employee?.id],
    queryFn: async () => {
      const revs = await api.getEmployeeReviews(employee.id);
      return revs.reverse();
    },
    enabled: !!employee,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals', employee?.id],
    queryFn: async () => {
      const gls = await api.getGoals(employee.id);
      return gls.reverse();
    },
    enabled: !!employee,
  });

  const submitReviewMut = useMutation({
    mutationFn: api.createReview,
    onSuccess: () => {
      showToast('Employee appraisal submitted successfully');
      setFeedback('');
      setReviewGoals('');
      setRating('5.0');
      queryClient.invalidateQueries({ queryKey: ['reviews', employee.id] });
    },
    onError: (err: any) => showToast(err.message || 'Appraisal submission failed', 'error')
  });

  const assignGoalMut = useMutation({
    mutationFn: api.createGoal,
    onSuccess: () => {
      showToast('New goal assigned successfully.');
      setGoalTitle('');
      setGoalDesc('');
      setGoalTargetDate('');
      queryClient.invalidateQueries({ queryKey: ['goals', employee.id] });
    },
    onError: (err: any) => showToast(err.message || 'Could not assign goal', 'error')
  });

  const completeGoalMut = useMutation({
    mutationFn: (goalId: number) => api.updateGoalStatus(goalId, 'COMPLETED'),
    onSuccess: () => {
      showToast('Goal marked as completed');
      queryClient.invalidateQueries({ queryKey: ['goals', employee.id] });
    },
    onError: (err: any) => showToast(err.message || 'Failed to update goal', 'error')
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    submitReviewMut.mutate({
      employeeId: employee.id,
      rating: parseFloat(rating),
      feedback,
      goals: reviewGoals
    });
  };

  const handleAssignGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalTargetDate) return;
    assignGoalMut.mutate({
      employeeId: employee.id,
      title: goalTitle,
      description: goalDesc,
      targetDate: goalTargetDate
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (!employee) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] border-l border-surface-border bg-background shadow-2xl p-6 overflow-y-auto z-40 animate-slideOver">
      
      {/* Drawer Header details */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block mb-1">Employee Detail Card</span>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span>{employee.firstName} {employee.lastName}</span>
            <button 
              onClick={onEditProfile}
              className="p-1 rounded text-foreground/50 hover:text-amber-500 hover:bg-surface-muted transition-all cursor-pointer"
              title="Edit Profile"
            >
              <Settings size={14} />
            </button>
          </h2>
          <span className="text-xs text-foreground/60 block">{employee.position} | {employee.department}</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded text-foreground/50 hover:bg-surface-muted cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Job Details Grid */}
        <div className="p-4 rounded-lg bg-surface border border-surface-border space-y-2">
          <div className="flex justify-between text-xs pb-1 border-b border-surface-border">
            <span className="text-foreground/60">Work Email</span>
            <span className="font-semibold text-foreground">{employee.email}</span>
          </div>
          <div className="flex justify-between text-xs pb-1 border-b border-surface-border">
            <span className="text-foreground/60">Phone Contact</span>
            <span className="font-semibold text-foreground">{employee.phone || '—'}</span>
          </div>
          <div className="flex justify-between text-xs pb-1 border-b border-surface-border">
            <span className="text-foreground/60">Basic Salary</span>
            <span className="font-semibold text-foreground">${employee.salary?.toLocaleString()}/mo</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-foreground/60">Performance KPI</span>
            <Badge variant="warning" className="gap-1 px-2 py-0.5">
              <Sparkles size={10} />
              <span>{employee.performanceRating?.toFixed(1) || '3.0'}</span>
            </Badge>
          </div>
        </div>

        {/* Goals List Assignment Panel */}
        <Card className="p-6 border-t-2 border-t-amber-500 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
            Goals assigned
          </h3>
          {goals.length > 0 ? (
            <div className="space-y-3 mb-6">
              {goals.map((goal: any) => (
                <div key={goal.id} className="p-3 rounded-lg border border-surface-border bg-surface-muted flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{goal.title}</h4>
                    <p className="text-[10px] text-foreground/60 mt-0.5">{goal.description}</p>
                    <span className="text-[9px] text-foreground/50 block mt-1 font-mono">Target: {formatDate(goal.targetDate)}</span>
                  </div>
                  <div className="text-right flex flex-col gap-2">
                    <Badge variant={goal.status === 'COMPLETED' ? 'success' : goal.status === 'IN_PROGRESS' ? 'default' : 'warning'}>
                      {goal.status}
                    </Badge>
                    {goal.status !== 'COMPLETED' && (
                      <Button
                        onClick={() => completeGoalMut.mutate(goal.id)}
                        variant="default"
                        size="sm"
                        className="h-6 text-[9px] px-2"
                        disabled={completeGoalMut.isPending}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-foreground/50 text-center py-4 mb-6">No goals assigned yet.</p>
          )}

          {/* New Goal form */}
          <form onSubmit={handleAssignGoal} className="pt-4 border-t border-surface-border space-y-3">
            <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Assign New Goal</h4>
            <div>
              <Input type="text" required placeholder="Goal Title" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} />
            </div>
            <div>
              <textarea
                placeholder="Description..." rows={2} value={goalDesc}
                onChange={(e) => setGoalDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-border text-xs focus:outline-none bg-surface-muted text-foreground"
              />
            </div>
            <div>
              <label className="block text-[9px] text-foreground/50 mb-1">Target Date</label>
              <Input type="date" required value={goalTargetDate} onChange={(e) => setGoalTargetDate(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={assignGoalMut.isPending}>
              {assignGoalMut.isPending ? 'Assigning...' : 'Assign Goal'}
            </Button>
          </form>
        </Card>

        {/* Evaluate Appraisal submission form */}
        <Card className="p-6 border-t-2 border-t-amber-500 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
            Evaluate Performance
          </h3>
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1">Rating Score</label>
                <select 
                  value={rating} onChange={(e) => setRating(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-border text-xs focus:outline-none bg-surface-muted text-foreground"
                >
                  <option value="5.0">5.0 - Outstanding</option>
                  <option value="4.0">4.0 - Exceeds Expectations</option>
                  <option value="3.0">3.0 - Meets Expectations</option>
                  <option value="2.0">2.0 - Needs Improvement</option>
                  <option value="1.0">1.0 - Unsatisfactory</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/60 mb-1">Appraisal Feedback</label>
              <textarea 
                required rows={3} value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Describe performance accomplishments..."
                className="w-full px-3 py-2 rounded-lg border border-surface-border text-xs focus:outline-none bg-surface-muted text-foreground" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/60 mb-1">Quarterly Goals</label>
              <textarea 
                required rows={2} value={reviewGoals}
                onChange={(e) => setReviewGoals(e.target.value)}
                placeholder="Core upskilling targets..."
                className="w-full px-3 py-2 rounded-lg border border-surface-border text-xs focus:outline-none bg-surface-muted text-foreground" 
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitReviewMut.isPending}>
              {submitReviewMut.isPending ? 'Submitting...' : 'Submit Appraisal Card'}
            </Button>
          </form>
        </Card>

        {/* Review History Cards Timeline */}
        <Card className="p-6 shadow-sm border-surface-border animate-fadeIn">
          <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
            Review History
          </h3>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((rev: any) => (
                <div key={rev.id} className="p-4 rounded-lg border border-surface-border bg-surface-muted space-y-2.5 animate-fadeIn text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-foreground/50 block font-mono">Date: {formatDate(rev.reviewDate)}</span>
                      <span className="font-semibold text-foreground/80">By: {rev.reviewer?.username || 'System'}</span>
                    </div>
                    <Badge variant="warning" className="gap-1 font-bold">
                      <Sparkles size={10} />
                      <span>{rev.rating?.toFixed(1)}</span>
                    </Badge>
                  </div>
                  <div className="text-foreground/80 leading-relaxed">
                    <span className="font-bold text-amber-500 block mb-0.5">Feedback:</span>
                    {expandedReviews[rev.id] ? rev.feedback : (rev.feedback && rev.feedback.length > 120 ? rev.feedback.slice(0, 120) + '...' : rev.feedback)}
                    {rev.feedback && rev.feedback.length > 120 && (
                      <button 
                        type="button"
                        onClick={() => setExpandedReviews(prev => ({ ...prev, [rev.id]: !prev[rev.id] }))}
                        className="text-amber-500 font-bold ml-1 hover:underline cursor-pointer"
                      >
                        {expandedReviews[rev.id] ? 'Less' : 'More'}
                      </button>
                    )}
                  </div>
                  {rev.goals && (
                    <div className="text-foreground/80 leading-relaxed pt-2 border-t border-surface-border">
                      <span className="font-bold text-foreground block mb-0.5">Goals:</span>
                      {expandedReviews[rev.id] ? rev.goals : (rev.goals.length > 120 ? rev.goals.slice(0, 120) + '...' : rev.goals)}
                      {rev.goals.length > 120 && (
                        <button 
                          type="button"
                          onClick={() => setExpandedReviews(prev => ({ ...prev, [rev.id]: !prev[rev.id] }))}
                          className="text-amber-500 font-bold ml-1 hover:underline cursor-pointer"
                        >
                          {expandedReviews[rev.id] ? 'Less' : 'More'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-foreground/50 text-center py-4">No reviews recorded yet.</p>
          )}
        </Card>

      </div>

    </div>
  );
};
