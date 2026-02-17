import { useLocation, useNavigate, useSearchParams } from 'react-router';
import {Drawer} from './ui/Drawer';
import {usePlaypeak} from '~/lib/playpeakContext';
import { Button } from './ui/Button';
import { Filters } from './filters/Filters';
import { IconButton } from './ui/IconButton';
import { Cross1Icon } from "@radix-ui/react-icons";
import { FILTER_URL_PREFIX } from '~/helpers/const';

export function FilterDrawer() {
  const { isDrawerOpen, closeFilter } = usePlaypeak();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const clearAllFilters = () => {
    const paramsClone = new URLSearchParams(params);
    [...paramsClone.keys()].forEach((key) => {
      if (key.startsWith(FILTER_URL_PREFIX)) {
        paramsClone.delete(key);
      }
    });
    navigate(`${location.pathname}?${paramsClone.toString()}`, {
      preventScrollReset: true,
      replace: true,
    });
    closeFilter();
  };
  const isOpen = isDrawerOpen('filter');

  const Header = () => {
    return(
      <div className='p-12 flex justify-between items-center'>
        <span className='text-h1'>Filters</span>
        <IconButton
          Icon={Cross1Icon}
          variant="secondary"
          size="medium"
          onClick={closeFilter}
        />
      </div>
    )
  }

  const Footer = () => {
    return(
      <div className='p-12 flex justify-between items-center gap-4'>
        <Button variant='primary' size="medium" onClick={closeFilter} className='w-full'>
          Apply filters
        </Button>
        <Button variant='secondary' size="medium" onClick={clearAllFilters} className='w-full'>
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
      className='overflow-hidden tablet:min-w-[600px]'
      panelClassName='bg-white p-8'
      header={<Header />}
      footer={<Footer/>}
    >
      <div className="bg-white max-tablet:m-12 h-full mx-auto">
        <Filters />
      </div>
    </Drawer>
  );
}
