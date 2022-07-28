import useSWR from 'swr';
import { Api } from '@kyso-io/kyso-store';
import { useEffect, useState } from 'react';
import type { NormalizedResponseDTO, TeamMember } from '@kyso-io/kyso-model';
import { getLocalStorageItem } from '@/helpers/get-local-storage-item';
import type { CommonData } from './use-common-data';

interface Props {
  commonData: CommonData;
}

const token: string | null = getLocalStorageItem('jwt');

const fetcher = async (props: Props) => {
  const { commonData } = props;
  const api: Api = new Api(token, commonData.organization.sluglified_name, commonData.team.sluglified_name);
  const result: NormalizedResponseDTO<TeamMember[]> = await api.getTeamAssignees(commonData.team.id as string);

  return result.data as TeamMember[];
};

export const useChannelMembers = (props: Props, dependancies: unknown[] = []): TeamMember[] => {
  const { commonData } = props;
  const [mounted, setMounted] = useState(false);

  const { data } = useSWR<TeamMember[]>(mounted ? `use-channel-members-${commonData.team.id}` : null, () => fetcher(props));

  useEffect(() => {
    if (!commonData.team) {
      return;
    }
    setMounted(true);
  }, [commonData.team, ...dependancies]);

  return data as TeamMember[];
};
