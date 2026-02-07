import {Await, NavLink} from 'react-router';
import {Suspense} from 'react';
import { twClasses } from "~/helpers/twMerge";
import { LocaleSwitcher } from '../LocaleSwitcher';
import {Profile } from '../icons';

interface DesktopTopBarProps {
  isLoggedIn: Promise<boolean>;
}

export function DesktopTopBar({
  isLoggedIn,
}: DesktopTopBarProps) {

  const initial = 'h-48 w-full bg-[#1D1229] px-12 flex items-center justify-between';

  const classes = twClasses([initial], {}, );

  return (
    <div className={classes}>
      <div>
        <LocaleSwitcher />
      </div>
      <div>
        <p className="text-medium-semi text-white">
        </p>
      </div>
      <div>
        <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
          <Suspense fallback={<></>}>
            <Await resolve={isLoggedIn} errorElement="Sign in">
              {(isLoggedIn) => (
                <span className="flex text-medium-semi">
                  <Profile className='mr-4'/> {isLoggedIn ? 'Account' : 'Sign in'}
                </span>
              )}
            </Await>
          </Suspense>
        </NavLink>
      </div>
    </div>
  );
}

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}
