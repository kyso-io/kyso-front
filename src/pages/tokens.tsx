/* eslint-disable no-restricted-globals */
import classNames from '@/helpers/class-names';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { useRedirectIfNoJWT } from '@/hooks/use-redirect-if-no-jwt';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import type { CommonData } from '@/types/common-data';
import { TrashIcon } from '@heroicons/react/outline';
import type { KysoUserAccessToken } from '@kyso-io/kyso-model';
import { createAccessTokenAction, deleteAccessTokenAction, getAccessTokensAction, revokeAllAccessTokenAction } from '@kyso-io/kyso-store';
import format from 'date-fns/format';
import { useEffect, useState } from 'react';
import { Helper } from '../helpers/Helper';

interface Props {
  commonData: CommonData;
}

const Index = ({ commonData }: Props) => {
  const dispatch = useAppDispatch();
  useRedirectIfNoJWT();

  const [accessTokens, setAccessTokens] = useState<KysoUserAccessToken[]>([]);
  // const [selectedAccessToken, setSelectedAccessToken] = useState<KysoUserAccessToken | null>(null);
  const [newAccessToken, setNewAccessToken] = useState<KysoUserAccessToken | null>(null);

  const [accessTokenName, setAccessTokenName] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [creatingToken, setCreatingToken] = useState(false);

  useEffect(() => {
    if (!commonData.user) {
      return;
    }
    const fetchAccessTokens = async () => {
      setRequesting(true);
      const { payload }: { payload: KysoUserAccessToken[] } = await dispatch(getAccessTokensAction());
      setAccessTokens(payload);
      // setNewAccessToken(payload[0]);
      setRequesting(false);
    };
    fetchAccessTokens();
  }, [commonData.user]);

  const createAccessToken = async () => {
    const index = accessTokens.findIndex((x) => x.name === accessTokenName);
    if (index !== -1) {
      // alert("Access token with this name already exists.");
      return;
    }

    setRequesting(true);
    const { payload }: { payload: KysoUserAccessToken } = await dispatch(
      createAccessTokenAction({
        name: accessTokenName,
      }),
    );
    if (payload) {
      setNewAccessToken(payload);
      setAccessTokens([...accessTokens, payload]);
    }
    setCreatingToken(false);
    setAccessTokenName('');
    setRequesting(false);
  };

  const deleteAccessToken = async (id: string) => {
    setRequesting(true);
    await dispatch(deleteAccessTokenAction(id));
    setAccessTokens(accessTokens.filter((token) => token.id !== id));
    setRequesting(false);
  };

  const revokeAllAccessTokens = async () => {
    setRequesting(true);
    const result = await dispatch(revokeAllAccessTokenAction());
    setAccessTokens(result.payload);
    setRequesting(false);
  };

  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-2/12"></div>
      <div className="w-6/12 flex flex-col space-y-6">
        <div>
          <div className="font-medium text-2xl">Tokens</div>
          <div className="text-md">
            Personal access tokens functions like ordinary OAuth access tokens. They can be used instead of a password for Kyso over HTTPS, or can be used to authenticate to the api over Basic
            Authentication.
          </div>
        </div>

        <div className="flex flex-row space-x-2">
          {!creatingToken && (
            <button
              className="border rounded p-2"
              onClick={() => {
                setNewAccessToken(null);
                setCreatingToken(true);
              }}
            >
              Generate new token
            </button>
          )}

          {accessTokens.length > 0 && (
            <button
              className="border rounded p-2"
              onClick={() => {
                setNewAccessToken(null);
                if (confirm('Are you sure?')) {
                  revokeAllAccessTokens();
                }
              }}
            >
              Revoke all
            </button>
          )}
        </div>

        {creatingToken && (
          <div className="p-2 flex flex-row space-x-2">
            <input
              width={190}
              className="p-2 border rounded focus:outline-none focus:ring-0"
              value={accessTokenName}
              placeholder="Enter a token name..."
              onChange={(e) => setAccessTokenName(e.target.value)}
            />
            <button
              className="border rounded p-2"
              onClick={() => {
                setAccessTokenName('');
                setCreatingToken(false);
              }}
            >
              Cancel
            </button>
            <button className="border rounded p-2" disabled={accessTokenName.length === 0} onClick={createAccessToken}>
              Create
            </button>
          </div>
        )}

        <div className="font-medium text-lg">Personal access tokens ({accessTokens.length})</div>

        {!creatingToken && newAccessToken && (
          <div>
            <div>
              Access token <strong>{newAccessToken?.name}</strong> has been created. Now you can use it to authenticate. Copy and paste it in a safe place because you will never see this value again.
            </div>
            <div className="flex flex-row items-center my-4">
              <div className="p-2 border rounded-l">{newAccessToken?.access_token}</div>
              <button
                className="p-2 -ml-px border rounded-r hover:bg-gray-200"
                onClick={() => {
                  navigator.clipboard.writeText(newAccessToken?.access_token as string);
                  setCopied(true);
                }}
              >
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </button>
            </div>
          </div>
        )}

        <div>Tokens you have generated that can be used to access the Kyso api.</div>

        {accessTokens.length === 0 && (
          <div className=" p-2 text-sm flex flex-row items-center space-x-2">
            <div className="grow flex flex-row items-center space-x-4">No access tokens</div>
          </div>
        )}

        {accessTokens.length > 0 && (
          <div className="border rounded flex flex-col divide-y">
            {accessTokens.map((accessToken) => {
              return (
                <div className=" p-2 text-sm flex flex-row items-center space-x-2" key={accessToken.id}>
                  <div className="grow flex flex-row items-center space-x-4">
                    <div>{accessToken.name}</div>
                  </div>
                  <div className="text-xs text-gray-500">Created {format(new Date(accessToken?.created_at as Date), 'MMM dd, yyyy')}</div>
                  <div>
                    <div
                      className={classNames(
                        'text-xs text-white rounded p-1',
                        accessToken.status === 'active' ? 'bg-green-500' : '',
                        accessToken.status === 'revoked' ? 'bg-orange-500' : '',
                        accessToken.status === 'expired' ? 'bg-red-500' : '',
                      )}
                    >
                      {Helper.ucFirst(accessToken.status)}
                    </div>
                  </div>
                  <div>
                    <button
                      disabled={requesting}
                      onClick={() => {
                        if (confirm('Are you sure?') && accessToken) {
                          setNewAccessToken(null);
                          // setSelectedAccessToken(accessToken);
                          deleteAccessToken(accessToken.id as string);
                        }
                      }}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
