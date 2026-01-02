import DIContainer from "@/core/infrastructure/di/DIContainer";
import { CompleteWorkOrderUseCase } from "@/core/application/use-cases/CompleteWorkOrderUseCase";

export class WorkOrderService {
  private orderRepo = DIContainer.getWorkOrderRepository();
  private workOrderPartRepo = DIContainer.getWorkOrderPartRepository();

  async completeWorkOrder(workOrderId: string) {
    const useCase = new CompleteWorkOrderUseCase(this.orderRepo, this.workOrderPartRepo);
    return useCase.execute(workOrderId);
  }
}