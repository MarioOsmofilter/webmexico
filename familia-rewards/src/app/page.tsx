import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Redirigir según el rol
  switch (session.user.role) {
    case 'PARENT':
      redirect('/padre');
    case 'CHILD':
      redirect('/hijo');
    case 'COUPLE':
      redirect('/pareja');
    default:
      redirect('/login');
  }
}
