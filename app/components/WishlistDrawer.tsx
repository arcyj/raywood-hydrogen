import { VaulDrawer } from './ui/vaulDrawer';
import {usePlaypeak} from '~/lib/playpeakContext';
import { IconButton } from './ui/IconButton';
import { WishlistMenu } from './WishlistMenu';
import { Cross1Icon } from "@radix-ui/react-icons";
import { useBreakpoints } from '~/hooks/useBreakpoints';

export function WishlistDrawer() {
  const { isDrawerOpen, closeWishlist } = usePlaypeak();
  const isOpen = isDrawerOpen('wishlist');
  const { isTablet } = useBreakpoints();

  const Header = () => {
    return (
      <div className="flex justify-between items-center">
        <span className="text-h1">Wishlist</span>
        <IconButton
          Icon={Cross1Icon}
          variant="secondary"
          size="medium"
          onClick={closeWishlist}
        />
      </div>
    );
  };

  return (
    <VaulDrawer.Root
      direction={isTablet ? 'right' : 'bottom'}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeWishlist();
      }}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay />
        <VaulDrawer.Content className="">
          <div className="bg-white rounded-lg h-full relative p-12">
            <div className="w-full flex tablet:hidden items-center justify-center">
              <span className="w-128 h-4 bg-accentGrey rounded-full block"></span>
            </div>
            <Header />
            <WishlistMenu />
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
