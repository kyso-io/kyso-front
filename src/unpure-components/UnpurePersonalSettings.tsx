import type { UserDTO } from '@kyso-io/kyso-model';

const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80';

type IUnpurePersonalSettings = {
  user: UserDTO;
};

const UnpurePersonalSettings = (props: IUnpurePersonalSettings) => {
  const { user } = props;
  const backgroundImage: string = user.background_image_url ? user.background_image_url : BACKGROUND_IMAGE;

  return (
    <div className="py-6 px-4 sm:p-6 lg:pb-8">
      <div>
        <h2 className="text-lg font-medium leading-6 text-gray-900">Profile</h2>
        <p className="mt-1 text-sm text-gray-500">This information will be displayed publicly so be careful what you share.</p>
      </div>

      <div className="mt-6 flex flex-col lg:flex-row">
        <div className="grow space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">kyso.io/user/</span>
              <input
                type="text"
                name="username"
                id="username"
                autoComplete="username"
                className="block w-full min-w-0 grow rounded-none rounded-r-md border-gray-300 focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                defaultValue={user.username}
              />
            </div>
          </div>

          <div>
            <label htmlFor="about" className="block text-sm font-medium text-gray-700">
              About
            </label>
            <div className="mt-1">
              <textarea id="about" name="about" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" defaultValue={''} />
            </div>
            <p className="mt-2 text-sm text-gray-500">Brief description for your profile. URLs are hyperlinked.</p>
          </div>
        </div>

        <div className="mt-6 grow lg:mt-0 lg:ml-6 lg:shrink-0 lg:grow-0">
          <p className="text-sm font-medium text-gray-700" aria-hidden="true">
            Photo
          </p>
          <div className="mt-1 lg:hidden">
            <div className="flex items-center">
              <div className="inline-block h-12 w-12 shrink-0 overflow-hidden rounded-full" aria-hidden="true">
                <img className="h-full w-full rounded-full" src={backgroundImage} alt="" />
              </div>
              <div className="ml-5 rounded-md shadow-sm">
                <div className="group relative flex items-center justify-center rounded-md border border-gray-300 py-2 px-3 focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 hover:bg-gray-50">
                  <label htmlFor="mobile-user-photo" className="pointer-events-none relative text-sm font-medium leading-4 text-gray-700">
                    <span>Change</span>
                    <span className="sr-only"> user photo</span>
                  </label>
                  <input id="mobile-user-photo" name="user-photo" type="file" className="absolute h-full w-full cursor-pointer rounded-md border-gray-300 opacity-0" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden overflow-hidden rounded-full lg:block">
            <img className="relative h-40 w-40 rounded-full" src={backgroundImage} alt="" />
            <label
              htmlFor="desktop-user-photo"
              className="absolute inset-0 flex h-full w-full items-center justify-center bg-black bg-opacity/75 text-sm font-medium text-white opacity-0 focus-within:opacity-100 hover:opacity-100"
            >
              <span>Change</span>
              <span className="sr-only"> user photo</span>
              <input type="file" id="desktop-user-photo" name="user-photo" className="absolute inset-0 h-full w-full cursor-pointer rounded-md border-gray-300 opacity-0" />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-6">
          <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
            First name
          </label>
          <input
            type="text"
            name="first-name"
            id="first-name"
            autoComplete="given-name"
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
          />
        </div>

        <div className="col-span-12 sm:col-span-6">
          <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
            Last name
          </label>
          <input
            type="text"
            name="last-name"
            id="last-name"
            autoComplete="family-name"
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
          />
        </div>

        <div className="col-span-12">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            URL
          </label>
          <input
            type="text"
            name="url"
            id="url"
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
          />
        </div>

        <div className="col-span-12 sm:col-span-6">
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Company
          </label>
          <input
            type="text"
            name="company"
            id="company"
            autoComplete="organization"
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default UnpurePersonalSettings;
