import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/shared/lib/auth';
import DIContainer from '@/core/infrastructure/di/DIContainer';
import { UserMapper } from '@/core/application/dto/UserMapper';
import { UsersContent } from '@/presentation/views/users/UsersContent';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const userRepo = DIContainer.getUserRepository();
  const users = await userRepo.findAll();
  const usersDTO = UserMapper.toDTOList(users);

  return (
    <MainLayout>
      <UsersContent users={usersDTO} currentUserId={session.user.id} />
    </MainLayout>
  );
}
