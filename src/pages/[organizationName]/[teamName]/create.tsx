import KysoTopBar from '@/layouts/KysoTopBar';
import type { CommonData } from '@/hooks/use-common-data';
import { useCommonData } from '@/hooks/use-common-data';
import Cookies from 'universal-cookie';
import UnPureReportCreateHeader from '@/unpure-components/UnPureReportCreateHeader';
import { useState } from 'react';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import { useUser } from '@/hooks/use-user';
import type { UserDTO } from '@kyso-io/kyso-model';
import UnpureMain from '@/unpure-components/UnpureMain';
import router from 'next/router';

const CreateReport = () => {
  useRedirectIfNoJWT();
  const user: UserDTO = useUser();
  const commonData: CommonData = useCommonData({
    organizationName: router.query.organizationName as string,
    teamName: router.query.teamName as string,
  });

  // const router = useRouter();
  // const dispatch = useAppDispatch();
  // const report = useCommonReportData();

  // const [isBusy, setBusy] = useState(false);

  // const [previewFile, setPreviewFile] = useState(null);
  // const commonData: CommonData = useCommonData();

  const cookies = new Cookies();
  let cookieTitle = '';
  if (cookies.get('editorTitle')) {
    cookieTitle = cookies.get('editorTitle');
  }

  let cookieDescription = '';
  if (cookies.get('editorDescription')) {
    cookieDescription = cookies.get('editorDescription');
  }

  // let cookieText = '';
  // if (cookies.get('editorText')) {
  //   cookieText = cookies.get('editorText');
  // }
  // let cookieAuthors = '';
  // if (cookies.get('editorAuthors')) {
  //   cookieAuthors = cookies.get('editorAuthors');
  // }

  // let cookiePreviewPicture = '';
  // if (cookies.get('editorPreviewPicture')) {
  //   cookiePreviewPicture = cookies.get('editorPreviewPicture');
  // }

  // let cookieTags = '';
  // if (cookies.get('editorTags')) {
  //   cookieTags = cookies.get('editorTags');
  // }
  // const [isDraftSaved, setDraftToSaved] = useState('false');

  const [newTitle, setTitle] = useState(cookieTitle);
  const [stopTyping, setStop] = useState(false);
  const [newDescription, setDescription] = useState(cookieDescription);
  // const [newText, setText] = useState(cookieText);
  // const [authors, setAuthors] = useState(cookieAuthors);
  // const [previewPicture, setPreviewPicture] = useState(cookiePreviewPicture);
  // const [newTags, setTags] = useState(cookieTags);

  // const cleanEditor = () => {
  //   cookies.set('editorText', '');
  //   cookies.set('editorTitle', '');
  //   cookies.set('editorDescription', '');
  //   setTitle('');
  //   setDescription('');
  //   setText('');
  // };
  // const setTitleDelay = (_newTitle) => {
  //   setTitle(_newTitle);
  //   cookies.set('editorTitle', _newTitle);
  //   setDraftToSaved('saving');
  // };

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
                <UnPureReportCreateHeader
                  title={newTitle}
                  description={newDescription}
                  user={user}
                  setTitle={setTitle}
                  setDescription={setDescription}
                  setStop={setStop}
                  stopTyping={stopTyping}
                  // isDraftSaved={isDraftSaved}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="w-full">
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
