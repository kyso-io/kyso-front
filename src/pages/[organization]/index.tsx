import BrandSidebarWithLightHeader from '@/layouts/BrandSidebarWithLightHeader';

type RouteParams = {
  organization: number;
};

const Index = (data: any) => {
  return <div>{data.organization}</div>;
};

// This function gets called at build time
export async function getStaticPaths() {
  return { paths: ['pepito'], fallback: false };
}

// This also gets called at build time
export async function getStaticProps(params: RouteParams) {
  // params contains the post `id`.
  // If the route is like /posts/1, then params.id is 1
  /* const res = await fetch(`https://.../posts/${params.organization}`)
  const post = await res.json()

  // Pass post data to the page via props */
  return { props: { organization: params.organization } };
}

Index.layout = BrandSidebarWithLightHeader;

export default Index;
