import type { NextPage } from "next";
import type { ReactElement } from "react";

import type AdminLayout from "@/layouts/AdminLayout";
import type MainLayout from "@/layouts/MainLayout";

export type PageWithMainLayoutType = NextPage & { layout: typeof MainLayout };
export type PageWithAdminLayoutType = NextPage & { layout: typeof AdminLayout };
export type PageWithLayoutType = PageWithMainLayoutType | PageWithAdminLayoutType;
export type LayoutProps = ({ children }: { children: ReactElement }) => ReactElement;
export default PageWithLayoutType;
