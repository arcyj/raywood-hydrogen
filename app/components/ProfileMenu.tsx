import { Suspense } from 'react';
import { NavLink, Form, Await } from 'react-router';
import { useDrawer } from './ui/Drawer';
import type { FC } from 'react';

interface ProfileMenuProps {
  isLoggedIn: Promise<boolean>;
}

export const ProfileMenu: FC<ProfileMenuProps> = ({ isLoggedIn }) => {
  const { onClose } = useDrawer();

  function isActiveStyle({
    isActive,
    isPending,
  }: {
    isActive: boolean;
    isPending: boolean;
  }) {
    return {
      fontWeight: isActive ? 'bold' : undefined,
      color: isPending ? 'grey' : 'black',
    };
  }

  return (
    <div className="profile-menu p-16">
      <h2 className="text-2xl font-bold mb-16">Account</h2>
      <nav className="flex flex-col gap-12">
        <NavLink
          to="/account/orders"
          style={isActiveStyle}
          className="px-16 py-12 text-body-regular font-medium hover:bg-gray-100 rounded-md transition-colors"
          onClick={onClose}
        >
          Orders
        </NavLink>
        <NavLink
          to="/account/profile"
          style={isActiveStyle}
          className="px-16 py-12 text-body-regular font-medium hover:bg-gray-100 rounded-md transition-colors"
          onClick={onClose}
        >
          Profile
        </NavLink>
        <NavLink
          to="/account/addresses"
          style={isActiveStyle}
          className="px-16 py-12 text-body-regular font-medium hover:bg-gray-100 rounded-md transition-colors"
          onClick={onClose}
        >
          Addresses
        </NavLink>
        <div className="border-t border-gray-200 mt-12 pt-12">
          <Suspense fallback={<div className="px-16 py-12">Loading...</div>}>
            <Await resolve={isLoggedIn}>
              {(loggedIn) =>
                loggedIn ? (
                  <Form
                    method="POST"
                    action="/account/logout"
                    onSubmit={onClose}
                  >
                    <button
                      type="submit"
                      className="w-full text-left px-16 py-12 text-body-regular font-medium hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Sign Out
                    </button>
                  </Form>
                ) : (
                  <NavLink
                    to="/account/login"
                    style={isActiveStyle}
                    className="px-16 py-12 text-body-regular font-medium hover:bg-gray-100 rounded-md transition-colors block"
                    onClick={onClose}
                  >
                    Sign In
                  </NavLink>
                )
              }
            </Await>
          </Suspense>
        </div>
      </nav>
    </div>
  );
};
