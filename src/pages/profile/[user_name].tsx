import UserProfileInfo from '@/components/UserProfileInfo';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { useState } from 'react';

const Index = () => {
  const user = {
    name: 'Sergio Talents-Oliag',
    role: 'Master of the Dark Arts in System Engineering',
    date: 'January 9, 2020',
    location: 'Valencia',
    email: 'ricardo.cooper@example.com',
    backgroundImage: 'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
  };
  const [currentTab, onChangeTab] = useState('Overview');

  return (
    <>
      <UserProfileInfo user={user} onChangeTab={onChangeTab} currentTab={currentTab} />
    </>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
