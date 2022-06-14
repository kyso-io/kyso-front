import { ReportDTO } from '@kyso-io/kyso-model';
import { selectActiveReport } from '@kyso-io/kyso-store';
import { NextPage } from 'next';
import Wrapper from '../../../../components/wrapper';
import { useAppSelector } from '../../../../hooks/redux-hooks';

const ReporPage: NextPage = () => {
  const reportDto: ReportDTO = useAppSelector(selectActiveReport);

  return (
    <Wrapper>
      <p>Report</p>
      {reportDto && (
        <span>
          {reportDto.id} {reportDto.title}
        </span>
      )}
    </Wrapper>
  );
};

export default ReporPage;
