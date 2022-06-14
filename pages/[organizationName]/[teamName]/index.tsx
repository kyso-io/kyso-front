import { Team } from '@kyso-io/kyso-model';
import { selectActiveTeam } from '@kyso-io/kyso-store';
import { NextPage } from 'next';
import Wrapper from '../../../components/wrapper';
import { useAppSelector } from '../../../hooks/redux-hooks';

const TeamPage: NextPage = () => {
  const team: Team = useAppSelector(selectActiveTeam);
  return (
    <Wrapper>
      <p>Team</p>
      {team && (
        <span>
          {team.id} {team.display_name}
        </span>
      )}
    </Wrapper>
  );
};

export default TeamPage;
