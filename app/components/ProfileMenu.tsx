import { Suspense } from 'react';
import { NavLink, Form, Await } from 'react-router';
import { useDrawer } from './ui/Drawer';
import { ChevronRight } from './icons';
import type { FC } from 'react';
import { twc } from '~/helpers/twMerge';
import { Button } from './ui/Button';
import { ButtonLink } from './ui/Link';
import {useLocalizedPath} from '~/hooks/useLocalePath';

interface ProfileMenuProps {
  isLoggedIn: Promise<boolean>;
}

export const ProfileMenu: FC<ProfileMenuProps> = ({ isLoggedIn }) => {
  const { onClose } = useDrawer();
  const withLocale = useLocalizedPath();

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

  const navLinkStyle = twc`ext-medium-semi transition-colors mb-4 py-12 px-8 bg-lightGrey rounded-md flex justify-between items-center  active:bg-accentGrey active:inset-shadow-sm`
  return (
    <div className="profile-menu p-16">
      <nav className="flex flex-col gap-12">
        <NavLink
          to={withLocale('/account/orders')}
          style={isActiveStyle}
          className={navLinkStyle}
          onClick={onClose}
        >
          <span>Orders</span>
          <ChevronRight size={20} />
        </NavLink>
        <NavLink
          to={withLocale('/account/profile')}
          style={isActiveStyle}
          className={navLinkStyle}
          onClick={onClose}
        >
          <span>Profile</span>
          <ChevronRight size={20} />
        </NavLink>
        <NavLink
          to={withLocale('/account/addresses')}
          style={isActiveStyle}
          className={navLinkStyle}
          onClick={onClose}
        >
          <span>Addresses</span>
          <ChevronRight size={20} />
        </NavLink>
        <div className="border-t border-gray-200 mt-12 pt-12">
          <Suspense fallback={<div className="px-16 py-12">Loading...</div>}>
            <Await resolve={isLoggedIn}>
              {(loggedIn) =>
                loggedIn ? (
                  <Form
                    method="POST"
                    action={withLocale('/account/logout')}
                    onSubmit={onClose}
                  >
                    <Button
                      type="submit"
                      variant='secondary'
                      className='w-full'
                    >
                      Sign Out
                    </Button>
                  </Form>
                ) : (
                  <ButtonLink
                    href="/account/login"
                    className="w-full"
                    onClick={onClose}
                    variant="primary"
                  >
                    Sign In
                  </ButtonLink>
                )
              }
            </Await>
          </Suspense>
        </div>
      </nav>
    </div>
  );
};
