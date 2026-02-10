import { Image } from "@shopify/hydrogen";
import { NavLink } from "react-router";
import {useLocalizedPath} from '~/hooks/useLocalePath';


export function TopBarActions() {
  const withLocale = useLocalizedPath();

  return (
    <>

    <div className="top-button tablet:hidden text-center">
      <NavLink prefetch="intent" to={withLocale('/')} viewTransition end>
        <Image
          src="./images/LogoPlaypeak.svg"
          alt="Logo"
          width={65}
          height={0}
          className="p-4"
        />
      </NavLink>
    </div>
    </>
  );
}
