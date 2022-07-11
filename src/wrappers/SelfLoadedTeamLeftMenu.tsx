import type { Team } from "@kyso-io/kyso-model";
import type { AppDispatch } from "@kyso-io/kyso-store";
import { fetchTeamsAction } from "@kyso-io/kyso-store";
import { useEffect, useState } from "react";
import { LeftSideBar } from "@/components/LeftSideBar";
import { Meta } from "@/layouts/Meta";
import { Sanitizer } from "@/helpers/Sanitizer";
import { KysoBreadcrumb } from "@/components/KysoBreadcrumb";
import { HashtagIcon } from "@heroicons/react/solid";
import { LeftMenuItem } from "@/model/left-menu-item.model";
import { useDispatch } from "react-redux";
import { BreadcrumbItem } from "@/model/breadcrum-item.model";
import { useRouter } from "next/router";
import { OrganizationSelectorItem } from "@/model/organization-selector-item.model";

import { useCommonData } from "@/hooks/use-common-data";
import { useReports } from "@/hooks/use-reports";

const SelfLoadedTeamLeftMenu = (props: any) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const {
    organization: activeOrganization,
    team: activeTeam,
    permissions,
  } = useCommonData();
  const reports = useReports();

  const [organizationTeams, setOrganizationTeams] = useState([]);
  const organizationSelectorItems: OrganizationSelectorItem[] = [];

  if (permissions && permissions.organizations) {
    permissions!.organizations.forEach((organization) => {
      organizationSelectorItems.push(
        new OrganizationSelectorItem(
          organization.display_name,
          `${router.basePath}/${organization.name}`,
          (activeOrganization && activeOrganization.sluglified_name) ===
            organization.name
        )
      );
    });
  }

  useEffect(() => {
    (async () => {
      if (activeOrganization) {
        const teams: any = await dispatch(
          fetchTeamsAction({
            filter: {
              organization_id: activeOrganization.id,
            },
            sort: "-created_at",
          })
        );

        const mappedTeams = teams.payload.map((x: Team) => {
          return new LeftMenuItem(
            x.sluglified_name,
            HashtagIcon,
            0,
            `${router.basePath}/${activeOrganization.sluglified_name}/${x.sluglified_name}`,
            x.sluglified_name === router.query.teamName
          );
        });

        setOrganizationTeams(mappedTeams);
      }
    })();
  }, [activeOrganization]);

  const breadcrumb: BreadcrumbItem[] = [];

  if (activeOrganization) {
    breadcrumb.push(
      new BreadcrumbItem(
        activeOrganization.display_name,
        `${router.basePath}/${activeOrganization?.sluglified_name}`,
        activeOrganization && !activeTeam && !reports
      )
    );
  }

  if (activeTeam) {
    breadcrumb.push(
      new BreadcrumbItem(
        activeTeam.display_name,
        `${router.basePath}/${activeOrganization?.sluglified_name}/${activeTeam?.sluglified_name}`,
        activeOrganization && activeTeam && !reports
      )
    );
  }

  // if (reports) {
  //   breadcrumb.push(
  //     new BreadcrumbItem(
  //       reports?.title,
  //       `${router.basePath}/${activeOrganization?.sluglified_name}/${activeTeam?.sluglified_name}/${reports?.sluglified_name}`,
  //       activeOrganization && activeTeam && reports && true
  //     )
  //   );
  // }

  return (
    <>
      <LeftSideBar
        navigation={organizationTeams}
        organizationSelectorItems={organizationSelectorItems}
        meta={
          <Meta
            title={`Kyso - ${Sanitizer.ifNullReturnDefault(
              activeOrganization?.display_name,
              ""
            )}`}
            description={`${Sanitizer.ifNullReturnDefault(
              activeOrganization?.display_name,
              ""
            )}`}
          />
        }
      >
        <KysoBreadcrumb navigation={breadcrumb}></KysoBreadcrumb>

        {props.children}
      </LeftSideBar>
    </>
  );
};

export default SelfLoadedTeamLeftMenu;
