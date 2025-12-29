'use server';

import { CreateAssetUseCase } from "@/core/application/use-cases/CreateAssetUseCase";
import { CreateWorkOrderUseCase } from "@/core/application/use-cases/CreateWorkOrderUseCase";
import DIContainer from "@/core/infrastructure/di/DIContainer";
import { CreateAssetSchema } from "@/core/application/validation/AssetSchemas";
import { CreateWorkOrderSchema } from "@/core/application/validation/WorkOrderSchemas";
import { WorkOrderService } from "@/core/application/services/WorkOrderService";
import { revalidatePath } from "next/cache";
import { ActionState } from "@/core/application/types/ActionState";

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
    assetId: formData.get("assetId") as string,
    assignedToId: formData.get("assignedToId") as string,
    scheduledAt: formData.get("scheduledAt") as string,
    estimatedDuration: formData.get("estimatedDuration") as string,
  };

  // Extraire les pièces du formData
  const partsData = formData.get("parts") as string;
  let parts: any[] = [];
  if (partsData) {
    try {
      parts = JSON.parse(partsData);
    } catch (e) {
      return { error: "Format de pièces invalide" };
    }
  }

  // Nettoyer les valeurs vides
  const cleanData: any = {
    title: rawData.title,
    priority: rawData.priority,
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

  const { title, description, priority, assetId, assignedToId, scheduledAt, estimatedDuration, parts: validatedParts } = validation.data;

  const workOrderRepo = DIContainer.getWorkOrderRepository();
  const technicianRepo = DIContainer.getTechnicianRepository();
  const partRepo = DIContainer.getPartRepository();
  const stockMovementRepo = DIContainer.getStockMovementRepository();
  const useCase = new CreateWorkOrderUseCase(workOrderRepo, technicianRepo, partRepo, stockMovementRepo);

  try {
    const schedule = assignedToId || scheduledAt || estimatedDuration ? {
      assignedToId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      estimatedDuration,
    } : undefined;

    await useCase.execute({
      title,
      description,
      priority: priority as any,
      assetId,
      schedule,
      parts: validatedParts,
    });
    
    revalidatePath("/");
    revalidatePath("/inventory");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function completeWorkOrderAction(
  formData: FormData
): Promise<ActionState> {
  const workOrderId = formData.get("workOrderId") as string;
  const assetPath = formData.get("assetPath") as string;

  if (!workOrderId || !assetPath) {
    return { error: "Données manquantes" };
  }

  const service = new WorkOrderService();

  try {
    await service.completeWorkOrder(workOrderId);
    revalidatePath(assetPath);
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
  const rawData = {
    assetId: formData.get("assetId") as string,
    title: formData.get("title") as string,
    description: formData.get("description") as string | undefined,
    frequency: formData.get("frequency") as string,
    intervalValue: formData.get("intervalValue") as string,
    nextDueDate: formData.get("nextDueDate") as string,
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

// =============================================================================
// TECHNICIAN ACTIONS
// =============================================================================

import { CreateTechnicianSchema, UpdateTechnicianSchema } from "@/core/application/validation/TechnicianSchemas";
import { CreateTechnicianUseCase } from "@/core/application/use-cases/CreateTechnicianUseCase";
import { UpdateTechnicianUseCase } from "@/core/application/use-cases/UpdateTechnicianUseCase";
import { DeleteTechnicianUseCase } from "@/core/application/use-cases/DeleteTechnicianUseCase";
import { TechnicianSkill } from "@/core/domain/entities/Technician";

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
      skills: validation.data.skills as TechnicianSkill[],
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
      skills: validation.data.skills as TechnicianSkill[],
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