import {Drawer} from './ui/Drawer';
import {usePlaypeak} from '~/lib/playpeakContext';
import { Button } from './ui/Button';
import { Filters } from './filters/Filters';
import { Error } from './icons';

export function FilterDrawer() {
  const { isDrawerOpen, closeFilter } = usePlaypeak();
  const isOpen = isDrawerOpen('filter');

  const Header = () => {
    return(
      <div className='p-12 flex justify-between items-center'>
        <span className='text-h1'>Filters</span>
        <Button IconBefore={Error} variant='secondary' size="small" onClick={closeFilter}>
          CLOSE
        </Button>
      </div>
    )
  }

  const Footer = () => {
    return(
      <div className='p-12 flex justify-between items-center gap-4'>
        <Button variant='primary' size="medium" onClick={closeFilter} className='w-full'>
          Apply filters
        </Button>
        <Button variant='secondary' size="medium" onClick={closeFilter} className='w-full'>
          Clear all
        </Button>
      </div>
    )
  }

  return (
    <Drawer
      onClose={closeFilter}
      visible={isOpen}
      position="left"
      className='overflow-hidden'
      panelClassName='bg-white'
      header={<Header />}
      footer={<Footer/>}
    >
      <div className="bg-white max-tablet:m-12 h-full max-w-[370px] tablet:max-w-[550px] mx-auto rounded-r-lg">
        <Filters />
      </div>
    </Drawer>
  );
}
