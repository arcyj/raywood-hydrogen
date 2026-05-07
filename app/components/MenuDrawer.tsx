
import { VaulDrawer } from './ui/vaulDrawer';
import { IconButton } from './ui/IconButton';
import { Cross1Icon } from "@radix-ui/react-icons";
import { DropDownMenu } from './ui/DropdownMenu';
import {usePlaypeak} from '~/lib/playpeakContext';
import type {HeaderQuery} from 'storefrontapi.generated';
import { useBreakpoints } from '~/hooks/useBreakpoints';

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
      <div className='flex justify-between items-center'>
        <span className='text-h1'>Shop</span>
        <IconButton
          Icon={Cross1Icon}
          variant="secondary"
          size="medium"
          onClick={closeDrawer}
        />
      </div>
    );
  };

  const { isTablet } = useBreakpoints();
  return (
    <VaulDrawer.Root
      direction={isTablet ? 'right' : 'bottom'}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeDrawer();
      }}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay />
        <VaulDrawer.Content>
          <div className="bg-white rounded-t-lg tablet:rounded-lg h-full relative p-12">
            <div className="w-full flex tablet:hidden items-center justify-center">
              <span className="w-128 h-4 bg-accentGrey rounded-full block"></span>
            </div>
            <Header />

            <DropDownMenu
              menu={menu}
              isLoggedIn={isLoggedIn}
              publicStoreDomain={publicStoreDomain}
              primaryDomainUrl={publicStoreDomain}
            />
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
