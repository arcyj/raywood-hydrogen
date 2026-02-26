
import {Drawer} from './ui/Drawer';
import { IconButton } from './ui/IconButton';
import { Cross1Icon } from "@radix-ui/react-icons";
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
      <div className='p-12 flex justify-between items-center'>
        <span className='text-h1'>Menu</span>
        <IconButton
          Icon={Cross1Icon}
          variant="secondary"
          size="medium"
          onClick={closeDrawer}
        />
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
      position="left"
      className="overflow-hidden h-full"
      panelClassName="p-12 bg-white "
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
