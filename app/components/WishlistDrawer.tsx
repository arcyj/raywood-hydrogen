import {Drawer} from './ui/Drawer';
import {usePlaypeak} from '~/lib/playpeakContext';
import { Button } from './ui/Button';
import { Filters } from './filters/Filters';
import { WishlistMenu } from './WishlistMenu';

export function WishlistDrawer() {
  const { isDrawerOpen, closeWishlist } = usePlaypeak();
  const isOpen = isDrawerOpen('wishlist');

  return (
    <Drawer
      onClose={closeWishlist}
      visible={isOpen}
      position="top"
      className='bg-transparent overflow-hidden'
    >
      <div className="bg-white max-tablet:m-12 h-full max-w-[370px] tablet:max-w-[550px] mx-auto rounded-lg">
        <WishlistMenu />
      </div>
    </Drawer>
  );
}
