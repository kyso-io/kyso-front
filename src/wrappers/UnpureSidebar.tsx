import { PureSidebar } from "@/components/PureSidebar";
import { Meta } from "@/layouts/Meta";
import { Sanitizer } from "@/helpers/Sanitizer";
import { KysoBreadcrumb } from "@/components/KysoBreadcrumb";
import { HashtagIcon } from "@heroicons/react/solid";
import { LeftMenuItem } from "@/model/left-menu-item.model";
import { BreadcrumbItem } from "@/model/breadcrum-item.model";
import { useRouter } from "next/router";
import { OrganizationSelectorItem } from "@/model/organization-selector-item.model";

import type { CommonData } from "@/hooks/use-common-data";
import { useCommonData } from "@/hooks/use-common-data";
import { Helper } from "@/helpers/Helper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UnpureSidebar = (props: any) => {
  const router = useRouter();

  // AVOID THIS
  // const { organization: activeOrganization, team: activeTeam, permissions } = useCommonData();
  // USE THIS
  const commonData: CommonData = useCommonData();

  // const reports = useReports();

  const organizationSelectorItems: OrganizationSelectorItem[] = [];
  if (commonData.permissions && commonData.permissions.organizations) {
    commonData.permissions!.organizations.forEach((organization) => {
      organizationSelectorItems.push(
        new OrganizationSelectorItem(organization.display_name, `${router.basePath}/${organization.name}`, (commonData.organization && commonData.organization.sluglified_name) === organization.name),
      );
    });
  }

  let mappedTeams: LeftMenuItem[] = [];
  if (commonData.permissions && commonData.permissions.teams && commonData.organization) {
    mappedTeams = commonData
      .permissions!.teams.filter((t) => t.organization_id === commonData.organization.id)
      .map((x) => {
        return new LeftMenuItem(x.name, HashtagIcon, 0, `${router.basePath}/${commonData.organization.sluglified_name}/${Helper.slugify(x.name)}`, Helper.slugify(x.name) === router.query.teamName);
      });
  }

  const breadcrumb: BreadcrumbItem[] = [];

  if (commonData.organization) {
    breadcrumb.push(
      new BreadcrumbItem(
        commonData.organization.display_name,
        `${router.basePath}/${commonData.organization?.sluglified_name}`,
        !!(commonData.organization && !commonData.team), // WTH is this xD. Not legible.
      ),
    );
  }

  if (commonData.team) {
    breadcrumb.push(
      new BreadcrumbItem(
        commonData.team.display_name,
        `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}`,
        !!(commonData.organization && commonData.team), // replace with something undestandable
      ),
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
            title={`Kyso - ${Sanitizer.ifNullReturnDefault(commonData.organization?.display_name, "")}`}
            description={`${Sanitizer.ifNullReturnDefault(commonData.organization?.display_name, "")}`}
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
