import KysoTopBar from '@/layouts/KysoTopBar';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import { useRouter } from 'next/router';
import Cookies from 'universal-cookie';
import UnPureReportCreateHeader from '@/unpure-components/UnPureReportCreateHeader';
import { useState } from 'react';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { useUser } from '@/hooks/use-user';
import type { UserDTO } from '@kyso-io/kyso-model';
import UnpureMain from '@/unpure-components/UnpureMain';
import PureTopTabs from '@/components/PureTopTabs';

const CreateReport = () => {
  useRedirectIfNoJWT();
  const user: UserDTO = useUser();
  const router = useRouter();
  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });

  const cookies = new Cookies();
  let cookieTitle = '';
  if (cookies.get('editorTitle')) {
    cookieTitle = cookies.get('editorTitle');
  }

  let cookieDescription = '';
  if (cookies.get('editorDescription')) {
    cookieDescription = cookies.get('editorDescription');
  }

  const [newTitle, setTitle] = useState(cookieTitle);
  const [stopTyping, setStop] = useState(false);
  const [newDescription, setDescription] = useState(cookieDescription);

  const tabs = [{ name: 'Write' }, { name: 'Preview' }];
  const [currentTab, onChangeTab] = useState('Write');

  return (
    <>
      <UnpureMain basePath={router.basePath} commonData={commonData}>
        <div className="flex flex-row space-x-10 ">
          <div className="flex flex-col h-screen w-[450px] space-y-6 truncate">
            <h2>Files</h2>
          </div>
          <div className="flex flex-col h-screen w-full space-y-6 pt-6 ">
            <div className="flex justify-between min-h-[164px]">
              <div className="flex items-top pt-3 space-x-4">
                <UnPureReportCreateHeader title={newTitle} description={newDescription} user={user} setTitle={setTitle} setDescription={setDescription} setStop={setStop} stopTyping={stopTyping} />
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="w-full">
                <PureTopTabs tabs={tabs} onChangeTab={onChangeTab} currentTab={currentTab} />
                <div className="bg-white border-b rounded-b border-x">
                  <h2>Render</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UnpureMain>
      ;
    </>
  );
};

CreateReport.layout = KysoTopBar;

export default CreateReport;
