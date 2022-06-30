import type { Organization, Report, Team } from "@kyso-io/kyso-model";
import type { AppDispatch } from "@kyso-io/kyso-store";
import {
  fetchTeamsAction,
  selectActiveOrganization,
  selectActiveReport,
  selectActiveTeam,
} from "@kyso-io/kyso-store";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/redux-hooks";
import { LeftSideBar } from "@/components/LeftSideBar";
import { Meta } from "@/layouts/Meta";
import { Sanitizer } from "@/helpers/Sanitizer";
import { KysoBreadcrumb } from "@/components/KysoBreadcrumb";
import { HashtagIcon } from "@heroicons/react/solid";
import { LeftMenuItem } from "@/model/left-menu-item.model";
import { useDispatch } from "react-redux";
import { BreadcrumbItem } from "@/model/breadcrum-item.model";
import CommonDataWrapper from "./CommonDataWrapper";

const SelfLoadedTeamLeftMenu = (props: any) => {
  // useAuth();

  // This works because we are using CommonDataWrapper
  const organizationData: Organization = useAppSelector(
    selectActiveOrganization
  );
  const teamData: Team = useAppSelector(selectActiveTeam);
  const reportData: Report = useAppSelector(selectActiveReport);

  const dispatch = useDispatch<AppDispatch>();
  const [organizationTeams, setOrganizationTeams] = useState([]);

  useEffect(() => {
    (async () => {
      if (organizationData) {
        const teams: any = await dispatch(
          fetchTeamsAction({
            filter: {
              organization_id: organizationData.id,
            },
            sort: "-created_at",
          })
        );

        const mappedTeams = teams.payload.map((x: Team) => {
          return new LeftMenuItem(
            x.sluglified_name,
            HashtagIcon,
            0,
            `./${x.sluglified_name}`,
            false
          );
        });

        setOrganizationTeams(mappedTeams);
      }
    })();
  }, [organizationData]);

  const breadcrumb: BreadcrumbItem[] = [];

  if (organizationData) {
    breadcrumb.push(
      new BreadcrumbItem(
        organizationData.display_name,
        `/${organizationData?.sluglified_name}`,
        false
      )
    );
  }

  if (teamData) {
    breadcrumb.push(
      new BreadcrumbItem(
        teamData.display_name,
        `/${organizationData?.sluglified_name}/${teamData?.sluglified_name}`,
        true
      )
    );
  }

  if (reportData) {
    breadcrumb.push(
      new BreadcrumbItem(
        reportData?.title,
        `/${organizationData?.sluglified_name}/${teamData?.sluglified_name}/${reportData?.sluglified_name}`,
        true
      )
    );
  }

  return (
    <>
      <CommonDataWrapper>
        <LeftSideBar
          navigation={organizationTeams}
          meta={
            <Meta
              title={`Kyso - ${Sanitizer.ifNullReturnDefault(
                organizationData?.display_name,
                ""
              )}`}
              description={`${Sanitizer.ifNullReturnDefault(
                organizationData?.display_name,
                ""
              )}`}
            />
          }
        >
          <KysoBreadcrumb navigation={breadcrumb}></KysoBreadcrumb>

          {props.children}
        </LeftSideBar>
      </CommonDataWrapper>
    </>
  );
};

export default SelfLoadedTeamLeftMenu;
