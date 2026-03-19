import { VaulDrawer } from './ui/vaulDrawer';
import {usePlaypeak} from '~/lib/playpeakContext';
import { IconButton } from './ui/IconButton';
import { WishlistMenu } from './WishlistMenu';
import { Cross1Icon } from "@radix-ui/react-icons";

export function WishlistDrawer() {
  const { isDrawerOpen, closeWishlist } = usePlaypeak();
  const isOpen = isDrawerOpen('wishlist');

  const Header = () => {
    return (
      <div className="p-12 flex justify-between items-center">
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
      direction='right'
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeWishlist();
      }}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 bg-black/40 z-9998" />
        <VaulDrawer.Content className="p-12 flex flex-col fixed right-0 tablet:w-[500px] top-0 bottom-0 h-full z-9999">
          <div className='bg-white rounded-lg h-full relative'>
              <Header />
              <WishlistMenu />
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
