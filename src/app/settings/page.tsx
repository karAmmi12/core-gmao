// app/settings/page.tsx

import DIContainer from '@/core/infrastructure/di/DIContainer';
import { GetAllCategoriesUseCase } from '@/core/application/use-cases/configuration/GetAllCategoriesUseCase';
import { SettingsContent } from '@/presentation/views/settings/SettingsContent';
import { MainLayout } from '@/presentation/components';

export default async function SettingsPage() {
  const configRepo = DIContainer.getConfigurationRepository();
  const getAllCategoriesUseCase = new GetAllCategoriesUseCase(configRepo);

  const categories = await getAllCategoriesUseCase.execute();

  return (
    <MainLayout>
      <SettingsContent categories={categories} />
    </MainLayout>
  );
}
