// =============================================================================
// EXEMPLE D'UTILISATION DES PERMISSIONS UI/UX
// =============================================================================
// Ce fichier montre comment utiliser le hook usePermissions pour conditionner
// l'affichage des actions selon le rôle de l'utilisateur

import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Button } from '@/presentation/components/ui';
import type { UserRole } from '@/core/domain/entities/User';

// -----------------------------------------------------------------------------
// 1. EXEMPLE SIMPLE - Part Request
// -----------------------------------------------------------------------------

interface PartRequestCardProps {
  request: {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED';
    requestedById: string;
  };
  userRole: UserRole;
  userId: string;
}

export function PartRequestCard({ request, userRole, userId }: PartRequestCardProps) {
  const permissions = usePermissions({ userRole, userId });

  return (
    <div className="p-4 border rounded">
      <h3>Demande #{request.id}</h3>
      <p>Status: {request.status}</p>

      <div className="flex gap-2 mt-4">
        {/* Bouton Approuver - Visible uniquement pour ADMIN et MANAGER */}
        {permissions.partRequest.canApprove && request.status === 'PENDING' && (
          <Button onClick={() => console.log('Approve')}>
            Approuver
          </Button>
        )}

        {/* Bouton Refuser - Visible uniquement pour ADMIN et MANAGER */}
        {permissions.partRequest.canReject && request.status === 'PENDING' && (
          <Button variant="danger" onClick={() => console.log('Reject')}>
            Refuser
          </Button>
        )}

        {/* Bouton Livrer - Visible uniquement pour ADMIN et STOCK_MANAGER */}
        {permissions.partRequest.canDeliver && request.status === 'APPROVED' && (
          <Button onClick={() => console.log('Deliver')}>
            Livrer
          </Button>
        )}

        {/* Bouton Annuler - Visible pour le demandeur si status = PENDING */}
        {permissions.partRequest.canCancel({
          requestedById: request.requestedById,
          status: request.status,
        }) && (
          <Button variant="ghost" onClick={() => console.log('Cancel')}>
            Annuler
          </Button>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 2. EXEMPLE AVEC CONTEXTE - Work Order
// -----------------------------------------------------------------------------

interface WorkOrderCardProps {
  workOrder: {
    id: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    assignedToId: string | undefined;
    createdById: string;
  };
  userRole: UserRole;
  userId: string;
}

export function WorkOrderCard({ workOrder, userRole, userId }: WorkOrderCardProps) {
  const permissions = usePermissions({ userRole, userId });

  // Préparer le contexte pour les permissions
  const workOrderContext = {
    assignedToId: workOrder.assignedToId ?? undefined,
    status: workOrder.status,
    createdById: workOrder.createdById,
  };

  return (
    <div className="p-4 border rounded">
      <h3>Intervention #{workOrder.id}</h3>
      <p>Status: {workOrder.status}</p>
      <p>Assigné à: {workOrder.assignedToId || 'Non assigné'}</p>

      <div className="flex gap-2 mt-4">
        {/* Bouton Modifier - Visible si ADMIN/MANAGER OU TECHNICIAN assigné */}
        {permissions.workOrder.canUpdate(workOrderContext) && (
          <Button onClick={() => console.log('Update')}>
            Modifier
          </Button>
        )}

        {/* Bouton Supprimer - Visible uniquement pour ADMIN et MANAGER */}
        {permissions.workOrder.canDelete(workOrderContext) && (
          <Button variant="danger" onClick={() => console.log('Delete')}>
            Supprimer
          </Button>
        )}

        {/* Bouton Démarrer - Visible si ADMIN/MANAGER OU TECHNICIAN assigné */}
        {permissions.workOrder.canStart(workOrderContext) && 
         workOrder.status === 'PENDING' && (
          <Button onClick={() => console.log('Start')}>
            Démarrer
          </Button>
        )}

        {/* Bouton Compléter - Visible si ADMIN/MANAGER OU TECHNICIAN assigné */}
        {permissions.workOrder.canComplete(workOrderContext) && 
         workOrder.status === 'IN_PROGRESS' && (
          <Button onClick={() => console.log('Complete')}>
            Compléter
          </Button>
        )}

        {/* Bouton Assigner - Visible uniquement pour ADMIN et MANAGER */}
        {permissions.workOrder.canAssign && (
          <Button variant="ghost" onClick={() => console.log('Assign')}>
            Assigner
          </Button>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 3. EXEMPLE AVEC SECTION CONDITIONNELLE
// -----------------------------------------------------------------------------

interface DashboardProps {
  userRole: UserRole;
  userId: string;
  pendingApprovals: number;
}

export function Dashboard({ userRole, userId, pendingApprovals }: DashboardProps) {
  const permissions = usePermissions({ userRole, userId });

  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>

      {/* Section visible uniquement pour les managers */}
      {permissions.isManager && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <h2>Section Manager</h2>
          <p>Vous avez {pendingApprovals} demandes en attente d'approbation</p>
        </div>
      )}

      {/* Section visible uniquement pour les stock managers */}
      {permissions.isStockManager && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <h2>Section Stock</h2>
          <p>Gestion des livraisons et du stock</p>
        </div>
      )}

      {/* Section visible uniquement pour les techniciens */}
      {permissions.isTechnician && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h2>Mes Interventions</h2>
          <p>Interventions qui me sont assignées</p>
        </div>
      )}

      {/* Bouton visible pour tous sauf VIEWER */}
      {permissions.partRequest.canCreate && (
        <Button onClick={() => console.log('Create Part Request')}>
          Créer une demande de pièce
        </Button>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// 4. EXEMPLE AVEC MENU DYNAMIQUE
// -----------------------------------------------------------------------------

interface NavigationProps {
  userRole: UserRole;
  userId: string;
}

export function Navigation({ userRole, userId }: NavigationProps) {
  const permissions = usePermissions({ userRole, userId });

  // Construction dynamique du menu selon les permissions
  const menuItems = [
    { label: 'Dashboard', path: '/', visible: true },
    { label: 'Équipements', path: '/assets', visible: true },
    { label: 'Interventions', path: '/work-orders', visible: permissions.workOrder.canCreate },
    { label: 'Demandes de pièces', path: '/part-requests', visible: permissions.partRequest.canCreate },
    { label: 'Approbations', path: '/approvals', visible: permissions.isManager },
    { label: 'Gestion du stock', path: '/stock', visible: permissions.isStockManager },
    { label: 'Administration', path: '/admin', visible: permissions.isAdmin },
  ];

  return (
    <nav>
      <ul className="flex gap-4">
        {menuItems.filter(item => item.visible).map(item => (
          <li key={item.path}>
            <a href={item.path} className="hover:underline">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// -----------------------------------------------------------------------------
// 5. EXEMPLE AVEC COMPOSANT RÉUTILISABLE
// -----------------------------------------------------------------------------

interface PermissionGateProps {
  children: React.ReactNode;
  userRole: UserRole;
  userId: string;
  requiredPermission: (permissions: ReturnType<typeof usePermissions>) => boolean;
  fallback?: React.ReactNode;
}

/**
 * Composant qui affiche son contenu uniquement si l'utilisateur a la permission
 */
export function PermissionGate({ 
  children, 
  userRole, 
  userId, 
  requiredPermission,
  fallback = null 
}: PermissionGateProps) {
  const permissions = usePermissions({ userRole, userId });

  if (requiredPermission(permissions)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// Utilisation du PermissionGate
export function ExampleWithGate({ userRole, userId }: { userRole: UserRole; userId: string }) {
  return (
    <div>
      <h1>Ma page</h1>

      <PermissionGate
        userRole={userRole}
        userId={userId}
        requiredPermission={(p) => p.partRequest.canApprove}
        fallback={<p>Vous n'avez pas accès à cette section</p>}
      >
        <div className="p-4 bg-blue-50">
          <h2>Section d'approbation</h2>
          <Button>Approuver les demandes</Button>
        </div>
      </PermissionGate>

      <PermissionGate
        userRole={userRole}
        userId={userId}
        requiredPermission={(p) => p.isAdmin}
      >
        <div className="p-4 bg-red-50">
          <h2>Section Admin</h2>
          <Button variant="danger">Actions dangereuses</Button>
        </div>
      </PermissionGate>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 6. BONNES PRATIQUES
// -----------------------------------------------------------------------------

/**
 * ✅ BON : Permission vérifiée avant d'afficher le bouton
 */
function GoodExample({ userRole, userId }: { userRole: UserRole; userId: string }) {
  const permissions = usePermissions({ userRole, userId });

  const handleApprove = () => {
    console.log('Approving...');
  };

  return (
    <>
      {permissions.partRequest.canApprove && (
        <Button onClick={handleApprove}>Approuver</Button>
      )}
    </>
  );
}

/**
 * ❌ MAUVAIS : Bouton toujours affiché, erreur au clic
 */
function BadExample({ userRole, userId }: { userRole: UserRole; userId: string }) {
  const handleApprove = () => {
    // L'erreur sera levée ici si l'utilisateur n'a pas la permission
    // Mauvaise UX car l'utilisateur ne sait pas qu'il ne peut pas cliquer
  };

  return <Button onClick={handleApprove}>Approuver</Button>;
}

/**
 * ✅ BON : Utilisation avec contexte
 */
function GoodContextExample({ 
  workOrder, 
  userRole, 
  userId 
}: { 
  workOrder: { assignedToId: string | undefined; status: string }; 
  userRole: UserRole; 
  userId: string 
}) {
  const permissions = usePermissions({ userRole, userId });

  return (
    <>
      {permissions.workOrder.canUpdate({
        assignedToId: workOrder.assignedToId,
        status: workOrder.status,
      }) && (
        <Button>Modifier</Button>
      )}
    </>
  );
}

/**
 * ❌ MAUVAIS : Vérification hardcodée du rôle
 */
function BadRoleCheckExample({ userRole }: { userRole: string }) {
  return (
    <>
      {userRole === 'MANAGER' && (
        <Button>Livrer</Button>
      )}
      {/* PROBLÈME : MANAGER ne peut pas livrer, seulement STOCK_MANAGER */}
    </>
  );
}
