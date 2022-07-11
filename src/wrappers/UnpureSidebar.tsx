import { PureSidebar } from "@/components/PureSidebar";
import { Meta } from "@/layouts/Meta";
import { Sanitizer } from "@/helpers/Sanitizer";
import { KysoBreadcrumb } from "@/components/KysoBreadcrumb";
import { HashtagIcon } from "@heroicons/react/solid";
import { LeftMenuItem } from "@/model/left-menu-item.model";
import { BreadcrumbItem } from "@/model/breadcrum-item.model";
import { useRouter } from "next/router";
import { OrganizationSelectorItem } from "@/model/organization-selector-item.model";

import { useCommonData } from "@/hooks/use-common-data";
import { Helper } from "@/helpers/Helper";

const UnpureSidebar = (props: any) => {
  const router = useRouter();

  const {
    organization: activeOrganization,
    team: activeTeam,
    permissions,
  } = useCommonData();
  // const reports = useReports();

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

  let mappedTeams: LeftMenuItem[] = [];
  if (permissions && permissions.teams && activeOrganization) {
    mappedTeams = permissions!.teams
      .filter((t) => t.organization_id === activeOrganization.id)
      .map((x) => {
        return new LeftMenuItem(
          x.name,
          HashtagIcon,
          0,
          `${router.basePath}/${
            activeOrganization.sluglified_name
          }/${Helper.slugify(x.name)}`,
          Helper.slugify(x.name) === router.query.teamName
        );
      });
  }

  const breadcrumb: BreadcrumbItem[] = [];

  if (activeOrganization) {
    breadcrumb.push(
      new BreadcrumbItem(
        activeOrganization.display_name,
        `${router.basePath}/${activeOrganization?.sluglified_name}`,
        !!(activeOrganization && !activeTeam)
      )
    );
  }

  if (activeTeam) {
    breadcrumb.push(
      new BreadcrumbItem(
        activeTeam.display_name,
        `${router.basePath}/${activeOrganization?.sluglified_name}/${activeTeam?.sluglified_name}`,
        !!(activeOrganization && activeTeam)
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
      <PureSidebar
        navigation={mappedTeams}
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
      </PureSidebar>
    </>
  );
};

export default UnpureSidebar;
