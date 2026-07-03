import React, { useState } from 'react';
import { useRolesPermissions, useUpdateRolePermissions } from '../hooks/useAdminQuery';
import type { RolePermissions } from '../types';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button
} from '../../components/ui';
import { 
  ShieldCheck, Save
} from 'lucide-react';

export const RolesPermissions: React.FC = () => {
  const { data: matrix = [], isLoading } = useRolesPermissions();
  const updateMatrixMutation = useUpdateRolePermissions();

  // Local state to keep track of edited permissions (toggles)
  const [localMatrix, setLocalMatrix] = useState<RolePermissions[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Status Toast helper
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleStartEdit = () => {
    setLocalMatrix(JSON.parse(JSON.stringify(matrix))); // Deep copy
    setIsEditing(true);
  };

  const handleToggle = (roleIndex: number, permIndex: number, action: 'create' | 'read' | 'update' | 'delete') => {
    if (!isEditing) return;
    const copy = [...localMatrix];
    const perm = copy[roleIndex].permissions[permIndex];
    perm[action] = !perm[action];
    setLocalMatrix(copy);
  };

  const handleSave = async () => {
    try {
      // Simulate saving role configurations
      for (const roleData of localMatrix) {
        await updateMatrixMutation.mutateAsync({
          role: roleData.role,
          permissions: roleData.permissions
        });
      }
      showStatus('Role Permission Matrix updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      showStatus(err.message || 'Could not save permissions', 'error');
    }
  };

  const activeMatrix = isEditing ? localMatrix : matrix;



  return (
    <div className="space-y-6">
      
      {/* Title & Save */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-foreground leading-tight">Roles & Capabilities Matrix</h2>
          <p className="text-xs text-foreground/60">Configure global permission scopes across Admin, HR, Manager, and Employee categories.</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleStartEdit} className="self-start sm:self-auto">
            <span>Configure Matrix</span>
          </Button>
        ) : (
          <div className="flex gap-2 self-start sm:self-auto">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateMatrixMutation.isPending} className="flex items-center gap-1.5">
              <Save size={14} />
              <span>Save Permissions</span>
            </Button>
          </div>
        )}
      </div>

      {/* Global Status Banner */}
      {statusMessage && (
        <div className={`p-3 rounded-lg text-xs font-bold animate-fadeIn ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
            : 'bg-destructive/10 text-destructive border border-destructive/20'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* Grid displaying cards per role for high-fidelity scanning */}
      {isLoading ? (
        <div className="text-center py-12 text-foreground/40 text-xs">Loading roles schema...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeMatrix.map((rm: any, roleIndex: number) => (
            <Card key={rm.role} className="border-t-4 border-t-emerald-500 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-2 border-b border-surface-border flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-amber-500" />
                    <span>Role Group: ROLE_{rm.role}</span>
                  </CardTitle>
                  <CardDescription>Permissions applied to user category.</CardDescription>
                </div>
                <Badge variant={rm.role === 'ADMIN' ? 'success' : 'secondary'}>
                  {rm.role === 'ADMIN' ? 'Superuser' : 'Scoped'}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-3">
                  {rm.permissions.map((p: any, permIndex: number) => (
                    <div key={p.resource} className="flex justify-between items-center py-2 border-b border-surface-border last:border-0 last:pb-0">
                      <span className="text-xs font-bold text-foreground/80">{p.resource}</span>
                      
                      <div className="flex gap-2">
                        {/* Create action check */}
                        <button
                          disabled={!isEditing || rm.role === 'ADMIN'}
                          onClick={() => handleToggle(roleIndex, permIndex, 'create')}
                          className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-extrabold cursor-pointer border ${
                            p.create 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                              : 'bg-surface-muted text-foreground/40 border-surface-border'
                          }`}
                        >
                          C
                        </button>
                        {/* Read action check */}
                        <button
                          disabled={!isEditing || rm.role === 'ADMIN'}
                          onClick={() => handleToggle(roleIndex, permIndex, 'read')}
                          className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-extrabold cursor-pointer border ${
                            p.read 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                              : 'bg-surface-muted text-foreground/40 border-surface-border'
                          }`}
                        >
                          R
                        </button>
                        {/* Update action check */}
                        <button
                          disabled={!isEditing || rm.role === 'ADMIN'}
                          onClick={() => handleToggle(roleIndex, permIndex, 'update')}
                          className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-extrabold cursor-pointer border ${
                            p.update 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                              : 'bg-surface-muted text-foreground/40 border-surface-border'
                          }`}
                        >
                          U
                        </button>
                        {/* Delete action check */}
                        <button
                          disabled={!isEditing || rm.role === 'ADMIN'}
                          onClick={() => handleToggle(roleIndex, permIndex, 'delete')}
                          className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-extrabold cursor-pointer border ${
                            p.delete 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                              : 'bg-surface-muted text-foreground/40 border-surface-border'
                          }`}
                        >
                          D
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};
