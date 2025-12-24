'use server';

import { CreateAssetUseCase } from "@/core/application/use-cases/CreateAssetUseCase";
import { CreateWorkOrderUseCase } from "@/core/application/use-cases/CreateWorkOrderUseCase";
import DIContainer from "@/core/infrastructure/di/DIContainer";
import { CreateAssetSchema } from "@/core/application/validation/AssetSchemas";
import { CreateWorkOrderSchema } from "@/core/application/validation/WorkOrderSchemas";
import { WorkOrderService } from "@/core/application/services/WorkOrderService";
import { revalidatePath } from "next/cache";
import { ActionState } from "@/core/application/types/ActionState";

export async function createAssetAction(formData: FormData): Promise<ActionState> {
  const rawData = {
    name: formData.get("name") as string,
    serialNumber: formData.get("serial") as string,
  };

  const validation = CreateAssetSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      error: validation.error.errors[0].message,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { name, serialNumber } = validation.data;

  const repo = DIContainer.getAssetRepository();
  const useCase = new CreateAssetUseCase(repo);

  try {
    await useCase.execute(name, serialNumber);
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function createWorkOrderAction(formData: FormData): Promise<ActionState> {
  const rawData = {
    title: formData.get("title") as string,
    priority: formData.get("priority") as string,
    assetId: formData.get("assetId") as string,
  };

  const validation = CreateWorkOrderSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      error: validation.error.errors[0].message,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { title, priority, assetId } = validation.data;

  const repo = DIContainer.getWorkOrderRepository();
  const useCase = new CreateWorkOrderUseCase(repo);

  try {
    await useCase.execute(title, priority, assetId);
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function completeWorkOrderAction(formData: FormData): Promise<ActionState> {
  const workOrderId = formData.get("workOrderId") as string;
  const assetPath = formData.get("assetPath") as string;

  const service = new WorkOrderService();

  try {
    await service.completeWorkOrder(workOrderId);
    revalidatePath(assetPath);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}