import type { ReactNode } from "react";

type IMainProps = {
  meta: ReactNode;
  children: ReactNode;
};

const Main = (props: IMainProps) => (
  <>
    <nav className="bg-white shadow dark:bg-gray-800">
      <div className="container mx-auto flex items-center justify-center p-6 capitalize text-gray-600 dark:text-gray-300">
        <a href="#" className="mx-1.5 border-b-2 border-blue-500 text-gray-800 transition-colors duration-200 dark:text-gray-200 sm:mx-6">
          home
        </a>
        <a href="#" className="mx-1.5 border-b-2 border-transparent transition-colors duration-200 hover:border-blue-500 hover:text-gray-800 dark:hover:text-gray-200 sm:mx-6">
          features
        </a>

        <a href="#" className="mx-1.5 border-b-2 border-transparent transition-colors duration-200 hover:border-blue-500 hover:text-gray-800 dark:hover:text-gray-200 sm:mx-6">
          pricing
        </a>

        <a href="#" className="mx-1.5 border-b-2 border-transparent transition-colors duration-200 hover:border-blue-500 hover:text-gray-800 dark:hover:text-gray-200 sm:mx-6">
          blog
        </a>
      </div>
    </nav>

    <div className="content py-5 text-xl">{props.children}</div>
  </>
);

export { Main };
