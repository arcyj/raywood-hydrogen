
import {Drawer} from './ui/Drawer';
import { Button } from './ui/Button';
import { Error } from './icons';
import { DropDownMenu } from './ui/DropdownMenu';
import {usePlaypeak} from '~/lib/playpeakContext';
import type {HeaderQuery} from 'storefrontapi.generated';

interface IMenuDrawerProps {
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

export function MenuDrawer({
  header,
  isLoggedIn,
  publicStoreDomain,
}: IMenuDrawerProps) {
  const {isDrawerOpen, closeDrawer} = usePlaypeak();
  const isOpen = isDrawerOpen('menu');
  const {menu} = header;

  const Header = () => {
    return (
      <div className="p-12 flex justify-between items-center">
        <span className="text-h1">Menu</span>
        <Button
          IconBefore={Error}
          variant="secondary"
          size="small"
          onClick={closeDrawer}
        >
          CLOSE
        </Button>
      </div>
    );
  };

  const FooterContent = () => {
    return <></>;
  };

  return (
    <Drawer
      onClose={closeDrawer}
      visible={isOpen}
      position="right"
      className="overflow-hidden h-full"
      panelClassName="bg-white p-12"
      header={<Header />}
    >
      <DropDownMenu
        menu={menu}
        isLoggedIn={isLoggedIn}
        publicStoreDomain={publicStoreDomain}
        primaryDomainUrl={publicStoreDomain}
      />
    </Drawer>
  );
}
