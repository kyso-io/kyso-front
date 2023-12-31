/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helper } from '@/helpers/Helper';
import type { IKysoApplicationLayoutProps } from '@/layouts/KysoApplicationLayout';
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { BookOpenIcon, ChatAlt2Icon, UserGroupIcon } from '@heroicons/react/solid';
import type { NormalizedResponseDTO, OrganizationInfoDto, ResourcePermissions } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PureAvatar from '@/components/PureAvatar';
import { RegisteredUsersAlert } from '@/components/RegisteredUsersAlert';
import SettingsAside from '@/components/SettingsAside';
import { checkJwt } from '@/helpers/check-jwt';
import { TailwindFontSizeEnum } from '@/tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '@/tailwind/enum/tailwind-height.enum';
import Link from 'next/link';

const OrganizationRoleToLabel: { [role: string]: string } = {
  'organization-admin': 'Admin of this organization',
  'team-admin': 'Full access all channels',
  'team-contributor': 'Can edit all channels',
  'team-reader': 'Can comment all channels',
};

interface OrganizationInfoDtoExtended extends OrganizationInfoDto {
  display_name: string;
  name: string;
  role_names: string[];
}

const Index = ({ commonData }: IKysoApplicationLayoutProps) => {
  const router = useRouter();
  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);
  const [organizationsInfoDtoExtended, setOrganizationsInfoDtoExtended] = useState<OrganizationInfoDtoExtended[]>([]);

  useEffect(() => {
    const result: boolean = checkJwt();
    setUserIsLogged(result);
  }, []);

  useEffect(() => {
    if (!commonData.user) {
      return undefined;
    }
    const interval = setInterval(() => {
      const validJwt: boolean = checkJwt();
      if (!validJwt) {
        router.replace('/logout');
      }
    }, Helper.CHECK_JWT_TOKEN_MS);
    return () => clearInterval(interval);
  }, [commonData.user]);

  useEffect(() => {
    if (!commonData.token) {
      return;
    }
    if (!commonData.permissions) {
      return;
    }
    const getData = async () => {
      try {
        const api: Api = new Api(commonData.token);
        const result: NormalizedResponseDTO<OrganizationInfoDto[]> = await api.getOrganizationsInfo();
        const data: OrganizationInfoDtoExtended[] = [];
        result.data.forEach((organizationInfoDto: OrganizationInfoDto) => {
          const organizationResourcePermissions: ResourcePermissions | undefined = commonData.permissions!.organizations!.find(
            (organizationResourcePermission: ResourcePermissions) => organizationResourcePermission.id === organizationInfoDto.organization_id,
          );
          if (!organizationResourcePermissions) {
            return;
          }
          data.push({
            display_name: organizationResourcePermissions.display_name,
            name: organizationResourcePermissions.name,
            role_names: organizationResourcePermissions.role_names || [],
            ...organizationInfoDto,
          } as any);
        });
        setOrganizationsInfoDtoExtended(data);
      } catch (e: any) {
        Helper.logError(e?.response?.data, e);
      }
    };
    getData();
  }, [commonData.token]);

  if (userIsLogged === null) {
    return null;
  }

  return (
    <div className="flex flex-row space-x-8 p-2">
      <div className="w-1/6">
        <SettingsAside commonData={commonData} />
      </div>
      <div className="w-4/6">
        {userIsLogged ? (
          <div className="mx-auto max-w-7xl py-12 px-4 text-center sm:px-6 lg:px-8 lg:py-12">
            <div className="space-y-12">
              <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Organizations</h2>
                <Link
                  href="/create-organization"
                  className="text-gray-500 hover:bg-gray-50 hover:text-gray-900 flex items-center px-3 py-2 text-xs lg:text-sm rounded-md"
                  role="link"
                  style={{
                    float: 'right',
                    position: 'relative',
                    bottom: '50px',
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true" className="w-5 h-5 mr-1" role="img">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" role="img"></path>
                  </svg>
                  Create
                </Link>
              </div>
              <ul role="list" className="mx-auto space-y-16 sm:grid sm:grid-cols-2 sm:gap-16 sm:space-y-0 lg:max-w-5xl lg:grid-cols-3">
                {organizationsInfoDtoExtended.map((organizationInfoExtended: OrganizationInfoDtoExtended) => {
                  const role: string =
                    organizationInfoExtended.role_names && organizationInfoExtended.role_names.length > 0 && OrganizationRoleToLabel[organizationInfoExtended.role_names[0]!]
                      ? OrganizationRoleToLabel[organizationInfoExtended.role_names[0]!]!
                      : '';
                  return (
                    <li
                      key={organizationInfoExtended.organization_id}
                      className="overflow-hidden rounded-md border border-gray-300 bg-white cursor-pointer"
                      onClick={() => router.push(`/settings/${organizationInfoExtended.name}`)}
                    >
                      <div className="space-y-1 text-lg font-medium leading-6 mt-5" style={{ height: '48px' }}>
                        <h3 style={{ color: '#234361' }}>{organizationInfoExtended.display_name}</h3>
                        <span className="text-sm font-normal truncate">{role}</span>
                      </div>
                      <div className="my-10">
                        <PureAvatar src={organizationInfoExtended.avatar_url} title={organizationInfoExtended.display_name} size={TailwindHeightSizeEnum.H36} textSize={TailwindFontSizeEnum.XXXXL} />
                      </div>
                      <div className="space-y-2 border-t py-4 px-2">
                        <ul role="list" className="flex justify-between space-x-5 cursor-pointer">
                          <li title="Reports">
                            <div className="flex items-center">
                              <BookOpenIcon className="h-6 w-6 mr-1" fill="#628CF9" aria-hidden="true" />
                              <span style={{ color: '#797A83' }} className="font-normal text-sm">
                                {organizationInfoExtended.reports}
                              </span>
                            </div>
                          </li>
                          <li title="Members">
                            <div className="flex items-center">
                              <UserGroupIcon className="h-6 w-6 mr-1" fill="#F1AB7A" aria-hidden="true" />
                              <span style={{ color: '#797A83' }} className="font-normal text-sm">
                                {organizationInfoExtended.members}
                              </span>
                            </div>
                          </li>
                          <li title="Comments">
                            <div className="flex items-center">
                              <ChatAlt2Icon className="h-6 w-6 mr-1" fill="#70CBE1" aria-hidden="true" />
                              <span style={{ color: '#797A83' }} className="font-normal text-sm">
                                {organizationInfoExtended.comments}
                              </span>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : (
          <RegisteredUsersAlert />
        )}
      </div>
    </div>
  );
};

Index.layout = KysoApplicationLayout;

export default Index;
