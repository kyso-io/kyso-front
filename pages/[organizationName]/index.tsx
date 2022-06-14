import { Organization } from '@kyso-io/kyso-model';
import { selectActiveOrganization } from '@kyso-io/kyso-store';
import { NextPage } from 'next';
import Wrapper from '../../components/wrapper';
import { useAppSelector } from '../../hooks/redux-hooks';

const OrganizationPage: NextPage = () => {
  const organization: Organization = useAppSelector(selectActiveOrganization);

  return (
    <Wrapper>
      <p>Organization</p>
      {organization && (
        <span>
          {organization.id} {organization.display_name}
        </span>
      )}
    </Wrapper>
  );
};

export default OrganizationPage;
