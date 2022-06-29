import { useRouter } from "next/router";
import KysoTopBar from "@/layouts/KysoTopBar";
import { LeftSideBar } from "@/templates/LeftSideBar";
import { Meta } from "@/layouts/Meta";
import { HashtagIcon } from "@heroicons/react/outline";
import { KysoBreadcrumb } from "@/components/KysoBreadcrumb";
import type { BreadcrumbItem } from "@/model/breadcrum-item.model";
import { LeftMenuItem } from "@/model/left-menu-item.model";
import { useEffect, useState } from "react";
import type { AppDispatch } from "@kyso-io/kyso-store";
import {
  fetchOrganizationsAction,
  fetchTeamsAction,
} from "@kyso-io/kyso-store";
import { useDispatch } from "react-redux";
import { useAuth } from "@/hooks/auth";
import type { Organization, Team } from "@kyso-io/kyso-model";

const Index = () => {
  useAuth();

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { organization } = (router as any).query;
  const [organizationTeams, setOrganizationTeams] = useState([]);
  const [organizationData, setOrganizationData] = useState({} as Organization);

  useEffect(() => {
    (async () => {
      if (organization) {
        const resultOrganization = await dispatch(
          fetchOrganizationsAction({
            filter: {
              sluglified_name: organization,
            },
          })
        );

        if (resultOrganization.payload.length === 0) {
          // That organization does not exists, redirect to 404
          router.push("/404");
        }

        setOrganizationData(resultOrganization.payload[0] as Organization);

        const teams: any = await dispatch(
          fetchTeamsAction({
            filter: {
              organization_id: resultOrganization.payload[0].id,
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
  }, [organization]);

  const breadcrumb: BreadcrumbItem[] = [
    {
      name: organization,
      href: `/${organization}`,
      current: true,
    },
  ];

  return (
    <>
      <LeftSideBar
        navigation={organizationTeams}
        meta={
          <Meta
            title={`Kyso - ${organizationData.display_name}`}
            description={`${organizationData.display_name}`}
          />
        }
      >
        <KysoBreadcrumb navigation={breadcrumb}></KysoBreadcrumb>

        <div className="mt-8">
          <h1>Display name: {organizationData.display_name}</h1>
          <h1>avatar url: {organizationData.avatar_url}</h1>
          <h1>link: {organizationData.link}</h1>
          <h1>legal name: {organizationData.legal_name}</h1>
          <h1>id {organizationData.id}</h1>
          <h1>location {organizationData.location}</h1>
        </div>
      </LeftSideBar>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;
