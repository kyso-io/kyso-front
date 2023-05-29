import { ExclamationCircleIcon } from '@heroicons/react/solid';
import Link from 'next/link';

export const RegisteredUsersAlert = () => {
  return (
    <div className="space-y-8">
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Forbidden resource</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                This page is only available to registered users.{' '}
                <Link href="/login" className="font-bold">
                  Sign in
                </Link>{' '}
                now.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
