import { useRouter } from 'next/router';

import AdminLayout from '@/layouts/AdminLayout';

const Index = () => {
  const router = useRouter();
  const { organization } = (router as any).query;

  return <div>{organization}</div>;
};

Index.layout = AdminLayout;

export default Index;
