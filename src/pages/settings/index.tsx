/* eslint-disable @typescript-eslint/no-explicit-any */
import KysoApplicationLayout from '@/layouts/KysoApplicationLayout';
import { BookOpenIcon, ChatAlt2Icon, UserGroupIcon } from '@heroicons/react/solid';
import type { NormalizedResponseDTO, OrganizationInfoDto, ResourcePermissions } from '@kyso-io/kyso-model';
import { Api } from '@kyso-io/kyso-store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PureAvatar from '../../components/PureAvatar';
import { RegisteredUsersAlert } from '../../components/RegisteredUsersAlert';
import SettingsAside from '../../components/SettingsAside';
import { checkJwt } from '../../helpers/check-jwt';
import { TailwindFontSizeEnum } from '../../tailwind/enum/tailwind-font-size.enum';
import { TailwindHeightSizeEnum } from '../../tailwind/enum/tailwind-height.enum';
import type { CommonData } from '../../types/common-data';

const OrganizationRoleToLabel: { [role: string]: string } = {
  'organization-admin': 'Admin of this organization',
  'team-admin': 'Full access all channels',
  'team-contributor': 'Can edit all channels',
  'team-reader': 'Can comment all channels',
};

interface Props {
  commonData: CommonData;
}

interface OrganizationInfoDtoExtended extends OrganizationInfoDto {
  display_name: string;
  name: string;
  role_names: string[];
}

const Index = ({ commonData }: Props) => {
  const router = useRouter();
  const [userIsLogged, setUserIsLogged] = useState<boolean | null>(null);
  const [organizationsInfoDtoExtended, setOrganizationsInfoDtoExtended] = useState<OrganizationInfoDtoExtended[]>([]);

  useEffect(() => {
    const result: boolean = checkJwt();
    setUserIsLogged(result);
  }, []);

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
        console.log(e.response.data);
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
                {/* <p className="text-xl text-gray-500">Ornare sagittis, suspendisse in hendrerit quis. Sed dui aliquet lectus sit pretium egestas vel mattis neque.</p> */}
              </div>
              <ul role="list" className="mx-auto space-y-16 sm:grid sm:grid-cols-2 sm:gap-16 sm:space-y-0 lg:max-w-5xl lg:grid-cols-3">
                {organizationsInfoDtoExtended.map((organizationInfoExtended: OrganizationInfoDtoExtended) => {
                  if (organizationInfoExtended.role_names.length === 0) {
                    return null;
                  }
                  const role: string =
                    organizationInfoExtended.role_names && organizationInfoExtended.role_names.length > 0 && OrganizationRoleToLabel[organizationInfoExtended.role_names[0]!]
                      ? OrganizationRoleToLabel[organizationInfoExtended.role_names[0]!]!
                      : '';
                  return (
                    <li key={organizationInfoExtended.organization_id} className="cursor-pointer" onClick={() => router.push(`/settings/${organizationInfoExtended.name}`)}>
                      {/* <img
                          className="mx-auto h-40 w-40 rounded-full xl:h-56 xl:w-56"
                          src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=8&amp;w=1024&amp;h=1024&amp;q=80"
                          alt=""
                        /> */}
                      <PureAvatar src={organizationInfoExtended.avatar_url} title={organizationInfoExtended.display_name} size={TailwindHeightSizeEnum.H32} textSize={TailwindFontSizeEnum.XXXXL} />
                      <div className="space-y-2">
                        <div className="space-y-1 text-lg font-medium leading-6 mt-2">
                          <h3>{organizationInfoExtended.display_name}</h3>
                          <p className="text-indigo-600">{role}</p>
                        </div>
                        <ul role="list" className="flex justify-center space-x-5 cursor-pointer">
                          {organizationInfoExtended.reports !== null && organizationInfoExtended.reports > 0 && (
                            <li title="Reports">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-400 mr-1">{organizationInfoExtended.reports}</span>
                                <BookOpenIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                              </div>
                            </li>
                          )}
                          {organizationInfoExtended.members !== null && organizationInfoExtended.members > 0 && (
                            <li title="Members">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-400 mr-1">{organizationInfoExtended.members}</span>
                                <UserGroupIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                              </div>
                            </li>
                          )}
                          {organizationInfoExtended.comments !== null && organizationInfoExtended.comments > 0 && (
                            <li title="Comments">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-400 mr-1">{organizationInfoExtended.comments}</span>
                                <ChatAlt2Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                              </div>
                            </li>
                          )}
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
