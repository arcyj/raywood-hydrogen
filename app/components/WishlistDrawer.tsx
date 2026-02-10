import {Drawer} from './ui/Drawer';
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
          size="small"
          onClick={closeWishlist}
        />
      </div>
    );
  };

  return (
    <Drawer
      onClose={closeWishlist}
      visible={isOpen}
      position="right"
      className='bg-transparent overflow-hidden'
      panelClassName='bg-white p-12'
      header={<Header />}
    >
      <div className="bg-white max-tablet:m-12 h-full max-w-[370px] tablet:max-w-[550px] mx-auto rounded-lg">
        <WishlistMenu />
      </div>
    </Drawer>
  );
}
