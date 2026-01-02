'use server';

import { CreateAssetUseCase } from "@/core/application/use-cases/CreateAssetUseCase";
import { CreateWorkOrderUseCase } from "@/core/application/use-cases/CreateWorkOrderUseCase";
import DIContainer from "@/core/infrastructure/di/DIContainer";
import { CreateAssetSchema } from "@/core/application/validation/AssetSchemas";
import { CreateWorkOrderSchema } from "@/core/application/validation/WorkOrderSchemas";
import { WorkOrderService } from "@/core/application/services/WorkOrderService";
import { revalidatePath } from "next/cache";
import { ActionState } from "@/core/application/types/ActionState";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { PermissionService } from '@/core/domain/authorization/PermissionService';
import type { UserRole } from '@/core/domain/entities/User';

export async function createAssetAction(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    name: formData.get("name") as string,
    serialNumber: formData.get("serial") as string,
    status: formData.get("status") as string,
    parentId: formData.get("parentId") as string | undefined,
    assetType: formData.get("assetType") as string | undefined,
    location: formData.get("location") as string | undefined,
    manufacturer: formData.get("manufacturer") as string | undefined,
    modelNumber: formData.get("modelNumber") as string | undefined,
  };

  // Nettoyer les valeurs vides
  const cleanData = {
    name: rawData.name,
    serialNumber: rawData.serialNumber,
    status: rawData.status || 'RUNNING',
    ...(rawData.parentId && rawData.parentId !== "" ? { parentId: rawData.parentId } : {}),
    ...(rawData.assetType && rawData.assetType !== "" ? { assetType: rawData.assetType } : {}),
    ...(rawData.location && rawData.location !== "" ? { location: rawData.location } : {}),
    ...(rawData.manufacturer && rawData.manufacturer !== "" ? { manufacturer: rawData.manufacturer } : {}),
    ...(rawData.modelNumber && rawData.modelNumber !== "" ? { modelNumber: rawData.modelNumber } : {}),
  };

  const validation = CreateAssetSchema.safeParse(cleanData);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    const firstError = validation.error.issues?.[0];
    return {
      error: firstError?.message || "Erreur de validation",
      errors,
    };
  }

  const { name, serialNumber, status, parentId, assetType, location, manufacturer, modelNumber } = validation.data;

  const repo = DIContainer.getAssetRepository();
  const useCase = new CreateAssetUseCase(repo);

  try {
    await useCase.execute(name, serialNumber, status as any, {
      parentId,
      assetType: assetType as any,
      location,
      manufacturer,
      modelNumber,
    });
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function createWorkOrderAction(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    priority: formData.get("priority") as string,
    type: formData.get("type") as string,
    assetId: formData.get("assetId") as string,
    assignedToId: formData.get("assignedToId") as string,
    scheduledAt: formData.get("scheduledAt") as string,
    estimatedDuration: formData.get("estimatedDuration") as string,
  };

  // Extraire les pièces du formData
  const partsData = formData.get("parts") as string;
  console.log("📦 Parts data received:", partsData);
  let parts: any[] = [];
  if (partsData) {
    try {
      parts = JSON.parse(partsData);
      console.log("📦 Parsed parts:", parts);
    } catch (e) {
      console.error("❌ Error parsing parts:", e);
      return { error: "Format de pièces invalide" };
    }
  }

  // Nettoyer les valeurs vides
  const cleanData: any = {
    title: rawData.title,
    priority: rawData.priority,
    type: rawData.type || 'CORRECTIVE',
    assetId: rawData.assetId,
  };
  
  if (rawData.description) cleanData.description = rawData.description;
  if (rawData.assignedToId) cleanData.assignedToId = rawData.assignedToId;
  if (rawData.scheduledAt) cleanData.scheduledAt = rawData.scheduledAt;
  if (rawData.estimatedDuration) cleanData.estimatedDuration = rawData.estimatedDuration;
  if (parts.length > 0) cleanData.parts = parts;

  const validation = CreateWorkOrderSchema.safeParse(cleanData);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    const firstError = validation.error.issues?.[0];
    return {
      error: firstError?.message || "Erreur de validation",
      errors,
    };
  }

  const { title, description, priority, type, assetId, assignedToId, scheduledAt, estimatedDuration, parts: validatedParts } = validation.data;

  // Récupérer l'utilisateur connecté pour les demandes de pièces
  const session = await getServerSession(authOptions);
  const requestedById = session?.user?.id;
  const userRole = session?.user?.role as string;

  // VALIDATION : Seuls ADMIN et MANAGER peuvent créer des interventions PREVENTIVE
  // Les TECHNICIAN ne peuvent créer que des CORRECTIVE (pannes, observations)
  if (type === 'PREVENTIVE' && userRole === 'TECHNICIAN') {
    return {
      error: "Les techniciens ne peuvent pas créer d'interventions préventives. Les interventions préventives sont générées automatiquement depuis les plannings de maintenance."
    };
  }

  const workOrderRepo = DIContainer.getWorkOrderRepository();
  const technicianRepo = DIContainer.getTechnicianRepository();
  const partRepo = DIContainer.getPartRepository();
  const partRequestRepo = DIContainer.getPartRequestRepository();
  const useCase = new CreateWorkOrderUseCase(workOrderRepo, technicianRepo, partRepo, partRequestRepo);

  try {
    const schedule = assignedToId || scheduledAt || estimatedDuration ? {
      assignedToId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      estimatedDuration,
    } : undefined;

    // Calculer le coût estimé à partir des pièces
    let estimatedCost: number | undefined = undefined;
    if (validatedParts && validatedParts.length > 0) {
      estimatedCost = validatedParts.reduce((total, part) => {
        return total + (part.quantity * part.unitPrice);
      }, 0);
      console.log("💰 Coût estimé calculé depuis les pièces:", estimatedCost);
    }

    console.log("🚀 Executing use case with parts:", validatedParts, "requestedById:", requestedById, "estimatedCost:", estimatedCost, "userRole:", userRole);
    await useCase.execute({
      title,
      description,
      priority: priority as any,
      type: type as any,
      assetId,
      schedule,
      parts: validatedParts,
      requestedById, // Passer l'ID de l'utilisateur pour créer les demandes de pièces
      estimatedCost, // Passer le coût estimé pour le système d'approbation
      createdByRole: userRole as any, // Passer le rôle pour déterminer si approbation nécessaire
    });
    console.log("✅ Use case executed successfully");
    
    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/part-requests"); // Rafraîchir aussi la page des demandes
    revalidatePath("/approvals"); // Rafraîchir la page des approbations
    return { success: true };
  } catch (e: any) {
    console.error("❌ Use case error:", e);
    return { error: e.message };
  }
}

export async function completeWorkOrderAction(
  formData: FormData
): Promise<ActionState> {
  const workOrderId = formData.get("workOrderId") as string;
  const actualDuration = formData.get("actualDuration") as string;
  const laborCost = formData.get("laborCost") as string;

  if (!workOrderId) {
    return { error: "ID intervention manquant" };
  }

  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: 'Non authentifié' };
  }

  const workOrderRepo = DIContainer.getWorkOrderRepository();
  const workOrderPartRepo = DIContainer.getWorkOrderPartRepository();

  try {
    const workOrder = await workOrderRepo.findById(workOrderId);
    if (!workOrder) {
      return { error: "Intervention non trouvée" };
    }

    // Vérifier les permissions
    const canComplete = PermissionService.canPerformWorkOrderAction(
      session.user.role as UserRole,
      session.user.id,
      'complete',
      {
        createdById: undefined, // À ajouter dans WorkOrder si nécessaire
        assignedToId: workOrder.assignedToId,
        status: workOrder.status,
      }
    );

    if (!canComplete) {
      return {
        error: PermissionService.getPermissionErrorMessage('complete', session.user.role as UserRole)
      };
    }

    // Utiliser le use case pour marquer comme complété ET consommer les pièces
    const { CompleteWorkOrderUseCase } = await import(
      '@/core/application/use-cases/CompleteWorkOrderUseCase'
    );
    const useCase = new CompleteWorkOrderUseCase(workOrderRepo, workOrderPartRepo);
    await useCase.execute(workOrderId);

    // Récupérer l'intervention mise à jour pour modifier les coûts et la durée
    const updatedWorkOrder = await workOrderRepo.findById(workOrderId);
    if (updatedWorkOrder) {
      // Mettre à jour les coûts
      if (laborCost) {
        (updatedWorkOrder as any).laborCost = parseFloat(laborCost);
      }
      
      // Mettre à jour la durée réelle si fournie
      if (actualDuration) {
        (updatedWorkOrder as any).actualDuration = parseInt(actualDuration);
      }

      // Recalculer le coût total
      (updatedWorkOrder as any).totalCost = updatedWorkOrder.laborCost + updatedWorkOrder.materialCost;
      
      await workOrderRepo.update(updatedWorkOrder);
    }

    revalidatePath('/work-orders');
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function startWorkOrderAction(
  formData: FormData
): Promise<ActionState> {
  const workOrderId = formData.get("workOrderId") as string;

  if (!workOrderId) {
    return { error: "ID intervention manquant" };
  }

  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: 'Non authentifié' };
  }

  const workOrderRepo = DIContainer.getWorkOrderRepository();

  try {
    const workOrder = await workOrderRepo.findById(workOrderId);
    if (!workOrder) {
      return { error: "Intervention non trouvée" };
    }

    // Vérifier les permissions
    const canStart = PermissionService.canPerformWorkOrderAction(
      session.user.role as UserRole,
      session.user.id,
      'start',
      {
        createdById: undefined,
        assignedToId: workOrder.assignedToId,
        status: workOrder.status,
      }
    );

    if (!canStart) {
      return {
        error: PermissionService.getPermissionErrorMessage('start', session.user.role as UserRole)
      };
    }

    workOrder.startWork();
    await workOrderRepo.update(workOrder);
    revalidatePath('/work-orders');
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function cancelWorkOrderAction(
  formData: FormData
): Promise<ActionState> {
  const workOrderId = formData.get("workOrderId") as string;
  const reason = formData.get("reason") as string;

  if (!workOrderId) {
    return { error: "ID intervention manquant" };
  }

  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: 'Non authentifié' };
  }

  const workOrderRepo = DIContainer.getWorkOrderRepository();

  try {
    const workOrder = await workOrderRepo.findById(workOrderId);
    if (!workOrder) {
      return { error: "Intervention non trouvée" };
    }

    // Vérifier les permissions (utiliser 'delete' pour cancel)
    const canCancel = PermissionService.canPerformWorkOrderAction(
      session.user.role as UserRole,
      session.user.id,
      'delete',
      {
        createdById: undefined,
        assignedToId: workOrder.assignedToId,
        status: workOrder.status,
      }
    );

    if (!canCancel) {
      return {
        error: PermissionService.getPermissionErrorMessage('delete', session.user.role as UserRole)
      };
    }

    workOrder.cancel(reason || undefined);
    await workOrderRepo.update(workOrder);
    revalidatePath('/work-orders');
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateWorkOrderAction(
  formData: FormData
): Promise<ActionState> {
  const workOrderId = formData.get("workOrderId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;
  const assignedToId = formData.get("assignedToId") as string;
  const scheduledDate = formData.get("scheduledDate") as string;
  const scheduledTime = formData.get("scheduledTime") as string;
  const estimatedDuration = formData.get("estimatedDuration") as string;

  if (!workOrderId) {
    return { error: "ID intervention manquant" };
  }

  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: 'Non authentifié' };
  }

  const workOrderRepo = DIContainer.getWorkOrderRepository();

  try {
    const workOrder = await workOrderRepo.findById(workOrderId);
    if (!workOrder) {
      return { error: "Intervention non trouvée" };
    }

    // Vérifier les permissions
    const canUpdate = PermissionService.canPerformWorkOrderAction(
      session.user.role as UserRole,
      session.user.id,
      'update',
      {
        createdById: undefined,
        assignedToId: workOrder.assignedToId,
        status: workOrder.status,
      }
    );

    if (!canUpdate) {
      return {
        error: PermissionService.getPermissionErrorMessage('update', session.user.role as UserRole)
      };
    }

    // Construire la date planifiée
    let scheduledAt: Date | undefined;
    if (scheduledDate) {
      scheduledAt = new Date(scheduledDate);
      if (scheduledTime) {
        const [hours, minutes] = scheduledTime.split(':');
        scheduledAt.setHours(parseInt(hours), parseInt(minutes));
      }
    }

    workOrder.update({
      title: title || undefined,
      description: description || undefined,
      priority: priority as 'LOW' | 'HIGH' || undefined,
      scheduledAt,
      estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : undefined,
      assignedToId: assignedToId === '' ? null : assignedToId || undefined,
    });

    await workOrderRepo.update(workOrder);
    revalidatePath('/work-orders');
    revalidatePath(`/work-orders/${workOrderId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateAssetStatusAction(
  formData: FormData
): Promise<ActionState> {
  const assetId = formData.get("assetId") as string;
  const newStatus = formData.get("status") as string;
  const currentPath = formData.get("currentPath") as string;

  if (!assetId || !newStatus) {
    return { error: "Données manquantes" };
  }

  if (!['RUNNING', 'STOPPED', 'MAINTENANCE'].includes(newStatus)) {
    return { error: "Statut invalide" };
  }

  const { UpdateAssetStatusUseCase } = await import("@/core/application/use-cases/UpdateAssetStatusUseCase");
  const repo = DIContainer.getAssetRepository();
  const useCase = new UpdateAssetStatusUseCase(repo);

  try {
    await useCase.execute(assetId, newStatus as any);
    revalidatePath(currentPath || "/");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function createPartAction(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    reference: formData.get("reference") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string | undefined,
    category: formData.get("category") as string | undefined,
    unitPrice: formData.get("unitPrice") as string,
    minStockLevel: formData.get("minStockLevel") as string | undefined,
    supplier: formData.get("supplier") as string | undefined,
    supplierRef: formData.get("supplierRef") as string | undefined,
    location: formData.get("location") as string | undefined,
  };

  const { createPartSchema } = await import("@/core/application/validation/PartSchemas");
  
  const validationResult = createPartSchema.safeParse(rawData);
  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message };
  }

  const { CreatePartUseCase } = await import("@/core/application/use-cases/CreatePartUseCase");
  const repo = DIContainer.getPartRepository();
  const useCase = new CreatePartUseCase(repo);

  try {
    const result = await useCase.execute(validationResult.data);
    revalidatePath("/inventory");
    return { success: true, data: { id: result.id } };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function addStockMovementAction(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    partId: formData.get("partId") as string,
    type: formData.get("type") as string,
    quantity: formData.get("quantity") as string,
    reason: formData.get("reason") as string | undefined,
    reference: formData.get("reference") as string | undefined,
  };

  const { addStockMovementSchema } = await import("@/core/application/validation/PartSchemas");
  
  const validationResult = addStockMovementSchema.safeParse(rawData);
  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message };
  }

  const { AddStockMovementUseCase } = await import("@/core/application/use-cases/AddStockMovementUseCase");
  const partRepo = DIContainer.getPartRepository();
  const stockRepo = DIContainer.getStockMovementRepository();
  const useCase = new AddStockMovementUseCase(partRepo, stockRepo);

  try {
    await useCase.execute(validationResult.data);
    revalidatePath("/inventory");
    revalidatePath(`/inventory/${rawData.partId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function createMaintenanceScheduleAction(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  // Vérifier l'authentification et les permissions
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: 'Non authentifié' };
  }

  const userRole = session.user.role as string;
  if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
    return {
      error: "Seuls les responsables et administrateurs peuvent créer des plannings de maintenance préventive."
    };
  }

  const triggerType = formData.get("triggerType") as string || "TIME_BASED";
  
  const rawData = {
    assetId: formData.get("assetId") as string,
    title: formData.get("title") as string,
    description: formData.get("description") as string | undefined,
    maintenanceType: formData.get("maintenanceType") as string || "PREVENTIVE",
    triggerType,
    // Time-based fields
    frequency: formData.get("frequency") as string,
    intervalValue: formData.get("intervalValue") as string,
    nextDueDate: formData.get("nextDueDate") as string,
    // Threshold-based fields
    thresholdMetric: formData.get("thresholdMetric") as string | undefined,
    thresholdValue: formData.get("thresholdValue") as string | undefined,
    thresholdUnit: formData.get("thresholdUnit") as string | undefined,
    currentValue: formData.get("currentValue") as string | undefined,
    // Common fields
    estimatedDuration: formData.get("estimatedDuration") as string | undefined,
    assignedToId: formData.get("assignedToId") as string | undefined,
    priority: formData.get("priority") as string,
  };

  // Nettoyer les valeurs vides
  const cleanData = {
    ...rawData,
    description: rawData.description && rawData.description !== "" ? rawData.description : undefined,
    estimatedDuration: rawData.estimatedDuration && rawData.estimatedDuration !== "" ? rawData.estimatedDuration : undefined,
    assignedToId: rawData.assignedToId && rawData.assignedToId !== "" ? rawData.assignedToId : undefined,
    // Time-based fields - nettoyer si vides
    frequency: rawData.frequency && rawData.frequency !== "" ? rawData.frequency : undefined,
    intervalValue: rawData.intervalValue && rawData.intervalValue !== "" ? rawData.intervalValue : undefined,
    nextDueDate: rawData.nextDueDate && rawData.nextDueDate !== "" ? rawData.nextDueDate : undefined,
    // Threshold-based fields
    thresholdMetric: rawData.thresholdMetric && rawData.thresholdMetric !== "" ? rawData.thresholdMetric : undefined,
    thresholdValue: rawData.thresholdValue && rawData.thresholdValue !== "" ? rawData.thresholdValue : undefined,
    thresholdUnit: rawData.thresholdUnit && rawData.thresholdUnit !== "" ? rawData.thresholdUnit : undefined,
    currentValue: rawData.currentValue && rawData.currentValue !== "" ? rawData.currentValue : undefined,
  };

  const { MaintenanceScheduleCreateSchema } = await import("@/core/application/validation/MaintenanceScheduleSchemas");
  
  const validationResult = MaintenanceScheduleCreateSchema.safeParse(cleanData);
  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;
    const firstError = validationResult.error.issues?.[0];
    return {
      error: firstError?.message || "Erreur de validation",
      errors,
    };
  }

  const { CreateMaintenanceScheduleUseCase } = await import("@/core/application/use-cases/CreateMaintenanceScheduleUseCase");
  const maintenanceRepo = DIContainer.getMaintenanceScheduleRepository();
  const assetRepo = DIContainer.getAssetRepository();
  const useCase = new CreateMaintenanceScheduleUseCase(maintenanceRepo, assetRepo);

  try {
    await useCase.execute(validationResult.data);
    revalidatePath("/maintenance");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function executeMaintenanceScheduleAction(
  scheduleId: string
): Promise<ActionState> {
  // Vérifier l'authentification et les permissions
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: 'Non authentifié' };
  }

  const userRole = session.user.role as string;
  if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
    return {
      error: "Seuls les responsables et administrateurs peuvent exécuter des plannings de maintenance."
    };
  }

  const { ExecuteMaintenanceScheduleUseCase } = await import("@/core/application/use-cases/ExecuteMaintenanceScheduleUseCase");
  const maintenanceRepo = DIContainer.getMaintenanceScheduleRepository();
  const workOrderRepo = DIContainer.getWorkOrderRepository();
  const useCase = new ExecuteMaintenanceScheduleUseCase(maintenanceRepo, workOrderRepo);

  try {
    await useCase.execute(scheduleId);
    revalidatePath("/maintenance");
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateMaintenanceScheduleAction(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  // Vérifier l'authentification et les permissions
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: 'Non authentifié' };
  }

  const userRole = session.user.role as string;
  if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
    return {
      error: "Seuls les responsables et administrateurs peuvent modifier des plannings de maintenance."
    };
  }

  const scheduleId = formData.get("scheduleId") as string;
  if (!scheduleId) {
    return { error: "ID du planning manquant" };
  }

  const triggerType = formData.get("triggerType") as string;
  
  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string | undefined,
    priority: formData.get("priority") as string,
    // Time-based fields
    frequency: formData.get("frequency") as string,
    intervalValue: formData.get("intervalValue") as string,
    nextDueDate: formData.get("nextDueDate") as string,
    // Threshold-based fields
    thresholdMetric: formData.get("thresholdMetric") as string | undefined,
    thresholdValue: formData.get("thresholdValue") as string | undefined,
    thresholdUnit: formData.get("thresholdUnit") as string | undefined,
    // Common fields
    estimatedDuration: formData.get("estimatedDuration") as string | undefined,
    assignedToId: formData.get("assignedToId") as string | undefined,
  };

  // Nettoyer les valeurs vides
  const cleanData: any = {};
  if (rawData.title) cleanData.title = rawData.title;
  if (rawData.description && rawData.description !== "") cleanData.description = rawData.description;
  if (rawData.priority) cleanData.priority = rawData.priority;
  
  // Time-based fields
  if (triggerType === 'TIME_BASED') {
    if (rawData.frequency && rawData.frequency !== "") cleanData.frequency = rawData.frequency;
    if (rawData.intervalValue && rawData.intervalValue !== "") cleanData.intervalValue = rawData.intervalValue;
    if (rawData.nextDueDate && rawData.nextDueDate !== "") cleanData.nextDueDate = rawData.nextDueDate;
  }
  
  // Threshold-based fields
  if (triggerType === 'THRESHOLD_BASED') {
    if (rawData.thresholdMetric && rawData.thresholdMetric !== "") cleanData.thresholdMetric = rawData.thresholdMetric;
    if (rawData.thresholdValue && rawData.thresholdValue !== "") cleanData.thresholdValue = rawData.thresholdValue;
    if (rawData.thresholdUnit && rawData.thresholdUnit !== "") cleanData.thresholdUnit = rawData.thresholdUnit;
  }
  
  // Common fields
  if (rawData.estimatedDuration && rawData.estimatedDuration !== "") cleanData.estimatedDuration = rawData.estimatedDuration;
  if (rawData.assignedToId && rawData.assignedToId !== "") cleanData.assignedToId = rawData.assignedToId;

  const { MaintenanceScheduleUpdateSchema } = await import("@/core/application/validation/MaintenanceScheduleSchemas");
  
  const validationResult = MaintenanceScheduleUpdateSchema.safeParse(cleanData);
  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;
    const firstError = validationResult.error.issues?.[0];
    return {
      error: firstError?.message || "Erreur de validation",
      errors,
    };
  }

  const { UpdateMaintenanceScheduleUseCase } = await import("@/core/application/use-cases/UpdateMaintenanceScheduleUseCase");
  const maintenanceRepo = DIContainer.getMaintenanceScheduleRepository();
  const assetRepo = DIContainer.getAssetRepository();
  const useCase = new UpdateMaintenanceScheduleUseCase(maintenanceRepo, assetRepo);

  try {
    await useCase.execute(scheduleId, validationResult.data);
    revalidatePath("/maintenance");
    revalidatePath(`/maintenance/${scheduleId}/edit`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateMaintenanceReadingAction(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const scheduleId = formData.get("scheduleId") as string;
  const currentValue = parseFloat(formData.get("currentValue") as string);

  if (!scheduleId || isNaN(currentValue)) {
    return { error: "Données invalides" };
  }

  // Vérifier l'authentification et les permissions
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: 'Non authentifié' };
  }

  const userRole = session.user.role as string;
  if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
    return {
      error: "Seuls les responsables et administrateurs peuvent mettre à jour les relevés de maintenance."
    };
  }

  const { UpdateMaintenanceReadingUseCase } = await import("@/core/application/use-cases/UpdateMaintenanceReadingUseCase");
  const maintenanceRepo = DIContainer.getMaintenanceScheduleRepository();
  const useCase = new UpdateMaintenanceReadingUseCase(maintenanceRepo);

  try {
    await useCase.execute({ scheduleId, currentValue });
    revalidatePath("/maintenance");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// =============================================================================
// TECHNICIAN ACTIONS
// =============================================================================

import { CreateTechnicianSchema, UpdateTechnicianSchema } from "@/core/application/validation/TechnicianSchemas";
import { CreateTechnicianUseCase } from "@/core/application/use-cases/CreateTechnicianUseCase";
import { UpdateTechnicianUseCase } from "@/core/application/use-cases/UpdateTechnicianUseCase";
import { DeleteTechnicianUseCase } from "@/core/application/use-cases/DeleteTechnicianUseCase";
import type { TechnicianDTO } from "@/core/application/dto/TechnicianDTO";

export async function createTechnicianAction(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawSkills = formData.getAll("skills") as string[];
  
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string || undefined,
    skills: rawSkills,
  };

  const validation = CreateTechnicianSchema.safeParse(rawData);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    const firstError = validation.error.issues?.[0];
    return {
      error: firstError?.message || "Erreur de validation",
      errors,
    };
  }

  const technicianRepo = DIContainer.getTechnicianRepository();
  const useCase = new CreateTechnicianUseCase(technicianRepo);

  try {
    await useCase.execute({
      name: validation.data.name,
      email: validation.data.email,
      phone: validation.data.phone || undefined,
      skills: validation.data.skills as any,
    });
    revalidatePath("/technicians");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateTechnicianAction(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get("id") as string;
  const rawSkills = formData.getAll("skills") as string[];
  
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string || undefined,
    skills: rawSkills,
    isActive: formData.get("isActive") === "true",
  };

  const validation = UpdateTechnicianSchema.safeParse(rawData);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    const firstError = validation.error.issues?.[0];
    return {
      error: firstError?.message || "Erreur de validation",
      errors,
    };
  }

  const technicianRepo = DIContainer.getTechnicianRepository();
  const useCase = new UpdateTechnicianUseCase(technicianRepo);

  try {
    await useCase.execute({
      id,
      name: validation.data.name,
      email: validation.data.email,
      phone: validation.data.phone || undefined,
      skills: validation.data.skills as any,
      isActive: validation.data.isActive,
    });
    revalidatePath("/technicians");
    revalidatePath(`/technicians/${id}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteTechnicianAction(id: string): Promise<ActionState> {
  const technicianRepo = DIContainer.getTechnicianRepository();
  const useCase = new DeleteTechnicianUseCase(technicianRepo);

  try {
    await useCase.execute(id);
    revalidatePath("/technicians");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// ========================
// CONFIGURATION ACTIONS
// ========================

import { CreateCategoryUseCase } from "@/core/application/use-cases/configuration/CreateCategoryUseCase";
import { CreateItemUseCase } from "@/core/application/use-cases/configuration/CreateItemUseCase";
import { UpdateItemUseCase } from "@/core/application/use-cases/configuration/UpdateItemUseCase";
import { DeleteItemUseCase } from "@/core/application/use-cases/configuration/DeleteItemUseCase";
import {
  CreateCategorySchema,
  CreateItemSchema,
  UpdateItemSchema,
} from "@/core/application/validation/ConfigurationSchemas";

export async function createCategoryAction(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    code: formData.get("code") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    sortOrder: formData.get("sortOrder") as string,
  };

  const cleanData = {
    code: rawData.code,
    name: rawData.name,
    ...(rawData.description && rawData.description !== "" ? { description: rawData.description } : {}),
    ...(rawData.sortOrder ? { sortOrder: parseInt(rawData.sortOrder, 10) } : {}),
  };

  const validation = CreateCategorySchema.safeParse(cleanData);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    const firstError = validation.error.issues?.[0];
    return {
      error: firstError?.message || "Erreur de validation",
      errors,
    };
  }

  const configRepo = DIContainer.getConfigurationRepository();
  const useCase = new CreateCategoryUseCase(configRepo);

  try {
    await useCase.execute(validation.data);
    revalidatePath("/settings");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function createItemAction(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    categoryId: formData.get("categoryId") as string,
    code: formData.get("code") as string,
    label: formData.get("label") as string,
    description: formData.get("description") as string,
    color: formData.get("color") as string,
    icon: formData.get("icon") as string,
    isDefault: formData.get("isDefault") === "true",
    sortOrder: formData.get("sortOrder") as string,
  };

  const cleanData: any = {
    categoryId: rawData.categoryId,
    code: rawData.code,
    label: rawData.label,
  };

  if (rawData.description && rawData.description !== "") {
    cleanData.description = rawData.description;
  }
  if (rawData.color && rawData.color !== "") {
    cleanData.color = rawData.color;
  }
  if (rawData.icon && rawData.icon !== "") {
    cleanData.icon = rawData.icon;
  }
  if (rawData.isDefault) {
    cleanData.isDefault = true;
  }
  if (rawData.sortOrder) {
    cleanData.sortOrder = parseInt(rawData.sortOrder, 10);
  }

  const validation = CreateItemSchema.safeParse(cleanData);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    const firstError = validation.error.issues?.[0];
    return {
      error: firstError?.message || "Erreur de validation",
      errors,
    };
  }

  const configRepo = DIContainer.getConfigurationRepository();
  const useCase = new CreateItemUseCase(configRepo);

  try {
    await useCase.execute(validation.data);
    revalidatePath("/settings");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateItemAction(
  itemId: string,
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    label: formData.get("label") as string,
    description: formData.get("description") as string,
    color: formData.get("color") as string,
    icon: formData.get("icon") as string,
    sortOrder: formData.get("sortOrder") as string,
  };

  const cleanData: any = {};

  if (rawData.label && rawData.label !== "") {
    cleanData.label = rawData.label;
  }
  if (rawData.description !== null) {
    cleanData.description = rawData.description || undefined;
  }
  if (rawData.color && rawData.color !== "") {
    cleanData.color = rawData.color;
  }
  if (rawData.icon !== null) {
    cleanData.icon = rawData.icon || undefined;
  }
  // Checkboxes: toujours inclure la valeur (true si présente, false sinon)
  cleanData.isDefault = formData.has("isDefault");
  cleanData.isActive = formData.has("isActive");
  
  if (rawData.sortOrder) {
    cleanData.sortOrder = parseInt(rawData.sortOrder, 10);
  }

  const validation = UpdateItemSchema.safeParse(cleanData);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    const firstError = validation.error.issues?.[0];
    return {
      error: firstError?.message || "Erreur de validation",
      errors,
    };
  }

  const configRepo = DIContainer.getConfigurationRepository();
  const useCase = new UpdateItemUseCase(configRepo);

  try {
    await useCase.execute(itemId, validation.data);
    revalidatePath("/settings");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteItemAction(itemId: string): Promise<ActionState> {
  const configRepo = DIContainer.getConfigurationRepository();
  const useCase = new DeleteItemUseCase(configRepo);

  try {
    await useCase.execute(itemId);
    revalidatePath("/settings");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// =============================================================================
// USERS ACTIONS
// =============================================================================

export async function createUserAction(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/shared/lib/auth');
  
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return { error: "Accès non autorisé" };
  }

  const rawData = {
    email: formData.get("email") as string,
    name: formData.get("name") as string,
    role: formData.get("role") as string,
  };

  const { CreateUserSchema } = await import("@/core/application/validation/UserSchemas");
  const validation = CreateUserSchema.safeParse(rawData);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return { error: validation.error.issues[0]?.message || "Erreur de validation", errors };
  }

  const userRepo = DIContainer.getUserRepository();

  // Vérifier si l'email existe déjà
  const exists = await userRepo.existsByEmail(validation.data.email);
  if (exists) {
    return { error: "Un utilisateur avec cet email existe déjà" };
  }

  try {
    const { CreateUserWithInviteUseCase } = await import("@/core/application/use-cases/CreateUserWithInviteUseCase");
    const useCase = new CreateUserWithInviteUseCase(userRepo);
    
    const result = await useCase.execute({
      email: validation.data.email,
      name: validation.data.name,
      role: validation.data.role,
      createdById: session.user.id,
    });

    revalidatePath("/users");
    return { success: true, data: { inviteToken: result.inviteToken } };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateUserAction(
  userId: string,
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/shared/lib/auth');
  
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return { error: "Accès non autorisé" };
  }

  const rawData = {
    name: formData.get("name") as string || undefined,
    role: formData.get("role") as string || undefined,
    isActive: formData.get("isActive") === 'true',
  };

  const { UpdateUserSchema } = await import("@/core/application/validation/UserSchemas");
  const validation = UpdateUserSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  const userRepo = DIContainer.getUserRepository();
  const user = await userRepo.findById(userId);

  if (!user) {
    return { error: "Utilisateur non trouvé" };
  }

  try {
    let updatedUser = user;
    
    if (validation.data.name || validation.data.role) {
      updatedUser = updatedUser.updateProfile({
        name: validation.data.name,
        role: validation.data.role,
      });
    }
    
    if (validation.data.isActive !== undefined) {
      updatedUser = updatedUser.setActive(validation.data.isActive);
    }

    await userRepo.update(updatedUser);
    revalidatePath("/users");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function resendInviteAction(userId: string): Promise<ActionState> {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/shared/lib/auth');
  
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return { error: "Accès non autorisé" };
  }

  const userRepo = DIContainer.getUserRepository();
  const user = await userRepo.findById(userId);

  if (!user) {
    return { error: "Utilisateur non trouvé" };
  }

  if (user.isActive) {
    return { error: "L'utilisateur est déjà actif" };
  }

  try {
    const updatedUser = user.regenerateInvite();
    await userRepo.update(updatedUser);
    revalidatePath("/users");
    return { success: true, data: { inviteToken: updatedUser.inviteToken } };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteUserAction(userId: string): Promise<ActionState> {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/shared/lib/auth');
  
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return { error: "Accès non autorisé" };
  }

  if (session.user.id === userId) {
    return { error: "Vous ne pouvez pas supprimer votre propre compte" };
  }

  const userRepo = DIContainer.getUserRepository();

  try {
    await userRepo.delete(userId);
    revalidatePath("/users");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function activateAccountAction(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const { ActivateAccountSchema } = await import("@/core/application/validation/UserSchemas");
  const validation = ActivateAccountSchema.safeParse({ token, password, confirmPassword });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  const userRepo = DIContainer.getUserRepository();
  const user = await userRepo.findByInviteToken(token);

  if (!user) {
    return { error: "Lien d'invitation invalide ou expiré" };
  }

  if (!user.isInviteValid()) {
    return { error: "Le lien d'invitation a expiré. Contactez l'administrateur." };
  }

  try {
    const activatedUser = await user.activate(password);
    await userRepo.update(activatedUser);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}