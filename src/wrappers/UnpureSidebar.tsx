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
  const commonData: CommonData = useCommonData();

  let currentOrgSlug = commonData.organization?.sluglified_name;
  if (commonData.organization && !commonData.organization.sluglified_name) {
    // tslint:disable-next-line
    currentOrgSlug = commonData.organization.name; // we need to do this because organization changes type!!!
  }

  const organizationSelectorItems: OrganizationSelectorItem[] = [];
  if (commonData.permissions && commonData.permissions.organizations) {
    commonData.permissions!.organizations.forEach((organization) => {
      organizationSelectorItems.push(new OrganizationSelectorItem(organization.display_name, `${router.basePath}/${organization.name}`, currentOrgSlug === organization.name));
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
    breadcrumb.push(new BreadcrumbItem(commonData.organization.display_name, `${router.basePath}/${commonData.organization?.sluglified_name}`, !!(commonData.organization && !commonData.team)));
  }

  if (commonData.team) {
    breadcrumb.push(
      new BreadcrumbItem(
        `# ${commonData.team.display_name}`,
        `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}`,
        !!(commonData.organization && commonData.team),
      ),
    );
  }

  // if (reports) {
  //   breadcrumb.push(
  //     new BreadcrumbItem(
  //       reports?.title,
  //       `${router.basePath}/${commonData.organization?.sluglified_name}/${commonData.team?.sluglified_name}/${reports?.sluglified_name}`,
  //       commonData.organization && commonData.team && reports && true
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
        <div className="md:pl-64 flex flex-col flex-1 bg-white border-b">
          <div className="p-4 flex items-center justify-between">
            <div>
              <KysoBreadcrumb navigation={breadcrumb}></KysoBreadcrumb>
            </div>

            {/* <div className="flex -space-x-1 relative z-0 overflow-hidden items-center rounded border p-1">
                <img
                  className="relative z-30 inline-block h-6 w-6 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
                <img
                  className="relative z-20 inline-block h-6 w-6 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
                <img
                  className="relative z-10 inline-block h-6 w-6 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
                  alt=""
                />
                <img
                  className="relative z-0 inline-block h-6 w-6 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />

                <p className="pl-4 text-sm font-light">
                  Members and settings
                </p>
              </div> */}
          </div>
        </div>

        <div className="md:pl-64 flex flex-col flex-1 bg-neutral-50 ">
          <div className="py-4 px-6">{props.children}</div>
        </div>
      </PureSidebar>
    </>
  );
};

export default UnpureSidebar;
