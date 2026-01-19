'use client';

import { useState, useActionState } from 'react';
import { UserDTO } from '@/core/application/dto/UserDTO';
import { UserRole } from '@/core/domain/entities/User';
import {
  PageHeader,
  Card,
  Badge,
  Button,
  Input,
  EmptyState,
  FiltersBar,
  StatsGrid,
  StatCard,
} from '@/components';
import {
  createUserAction,
  updateUserAction,
  resendInviteAction,
  deleteUserAction,
} from '@/app/actions';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Trash2,
  RefreshCw,
  Edit,
  Copy,
  X,
} from 'lucide-react';

interface UsersContentProps {
  users: UserDTO[];
  currentUserId: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrateur',
  MANAGER: 'Responsable',
  TECHNICIAN: 'Technicien',
  STOCK_MANAGER: 'Gestionnaire Stock',
  OPERATOR: 'Opérateur',
  VIEWER: 'Visualiseur',
};

const ROLE_COLORS: Record<UserRole, 'primary' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  ADMIN: 'danger',
  MANAGER: 'primary',
  TECHNICIAN: 'success',
  STOCK_MANAGER: 'warning',
  OPERATOR: 'warning',
  VIEWER: 'neutral',
};

export function UsersContent({ users, currentUserId }: UsersContentProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  // Stats
  const activeCount = users.filter(u => u.isActive).length;
  const pendingCount = users.filter(u => !u.isActive && u.inviteToken).length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateSuccess = (data: any) => {
    setShowCreateModal(false);
    if (data?.inviteToken) {
      const link = `${window.location.origin}/invite?token=${data.inviteToken}`;
      setInviteLink(link);
    }
  };

  const handleResendInvite = async (userId: string) => {
    const result = await resendInviteAction(userId);
    if (result?.success && result.data?.inviteToken) {
      const link = `${window.location.origin}/invite?token=${result.data.inviteToken}`;
      setInviteLink(link);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ?`)) {
      await deleteUserAction(userId);
    }
  };

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
    }
  };

  return (
    <>
      <PageHeader
        title="Gestion des utilisateurs"
        description="Gérez les accès et permissions des utilisateurs"
        icon="👥"
        actions={
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <UserPlus size={18} className="mr-2" />
            Inviter un utilisateur
          </Button>
        }
      />

      {/* Stats */}
      <StatsGrid columns={4}>
        <StatCard
          label="Total utilisateurs"
          value={users.length}
          icon={<Users size={24} />}
          color="primary"
        />
        <StatCard
          label="Actifs"
          value={activeCount}
          icon={<CheckCircle size={24} />}
          color="success"
        />
        <StatCard
          label="En attente"
          value={pendingCount}
          icon={<Clock size={24} />}
          color="warning"
        />
        <StatCard
          label="Administrateurs"
          value={adminCount}
          icon={<Shield size={24} />}
          color="danger"
        />
      </StatsGrid>

      {/* Filters */}
      <FiltersBar onReset={() => { setSearchQuery(''); setRoleFilter('all'); }}>
        <Input
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          className="px-3 py-2 border border-neutral-300 rounded-lg"
        >
          <option value="all">Tous les rôles</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </FiltersBar>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          title="Aucun utilisateur"
          description="Invitez votre premier utilisateur pour commencer"
          action={
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <UserPlus size={18} className="mr-2" />
              Inviter un utilisateur
            </Button>
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-600">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-600">Rôle</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-600">Statut</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-600">Dernière connexion</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-neutral-900">{user.name}</div>
                        <div className="text-sm text-neutral-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_COLORS[user.role]}>
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.isActive ? (
                        <Badge variant="success" icon={<CheckCircle size={12} />}>
                          Actif
                        </Badge>
                      ) : user.inviteToken ? (
                        <Badge variant="warning" icon={<Mail size={12} />}>
                          Invitation envoyée
                        </Badge>
                      ) : (
                        <Badge variant="neutral" icon={<XCircle size={12} />}>
                          Désactivé
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">
                      {user.lastLoginAt 
                        ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Jamais'
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {!user.isActive && user.inviteToken && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendInvite(user.id)}
                            title="Renvoyer l'invitation"
                          >
                            <RefreshCw size={16} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </Button>
                        {user.id !== currentUserId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id, user.name)}
                            title="Supprimer"
                            className="text-danger-600 hover:text-danger-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          isCurrentUser={editingUser.id === currentUserId}
        />
      )}

      {/* Invite Link Modal */}
      {inviteLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Lien d'invitation</h3>
              <button onClick={() => setInviteLink(null)} className="text-neutral-400 hover:text-neutral-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              Partagez ce lien avec l'utilisateur pour qu'il puisse activer son compte.
              Le lien expire dans 48 heures.
            </p>
            <div className="flex gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="flex-1 text-sm"
              />
              <Button variant="primary" onClick={copyInviteLink}>
                <Copy size={16} />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

// =============================================================================
// CREATE MODAL
// =============================================================================

function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (data: any) => void }) {
  const [state, formAction, isPending] = useActionState(createUserAction, { success: false });

  if (state?.success) {
    onSuccess(state.data);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Inviter un utilisateur</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X size={20} />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nom complet *
            </label>
            <Input
              name="name"
              placeholder="Jean Dupont"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email *
            </label>
            <Input
              name="email"
              type="email"
              placeholder="jean.dupont@entreprise.fr"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Rôle *
            </label>
            <select
              name="role"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
              defaultValue="OPERATOR"
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              Envoyer l'invitation
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// =============================================================================
// EDIT MODAL
// =============================================================================

function EditUserModal({ user, onClose, isCurrentUser }: { user: UserDTO; onClose: () => void; isCurrentUser: boolean }) {
  const updateWithId = updateUserAction.bind(null, user.id);
  const [state, formAction, isPending] = useActionState(updateWithId, { success: false });

  if (state?.success) {
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Modifier l'utilisateur</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X size={20} />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nom complet
            </label>
            <Input
              name="name"
              defaultValue={user.name}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <Input
              value={user.email}
              disabled
              className="bg-neutral-100"
            />
            <p className="text-xs text-neutral-500 mt-1">L'email ne peut pas être modifié</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Rôle
            </label>
            <select
              name="role"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg disabled:bg-neutral-100"
              defaultValue={user.role}
              disabled={isCurrentUser}
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {isCurrentUser && (
              <p className="text-xs text-neutral-500 mt-1">Vous ne pouvez pas modifier votre propre rôle</p>
            )}
          </div>

          {!isCurrentUser && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                value="true"
                defaultChecked={user.isActive}
                className="rounded border-neutral-300"
              />
              <label htmlFor="isActive" className="text-sm text-neutral-700">
                Compte actif
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
