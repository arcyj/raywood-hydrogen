import { useLocation, useNavigate, useSearchParams } from 'react-router';
import {Drawer} from './ui/Drawer';
import {usePlaypeak} from '~/lib/playpeakContext';
import { Button } from './ui/Button';
import { Filters } from './filters/Filters';
import { IconButton } from './ui/IconButton';
import { Cross1Icon } from "@radix-ui/react-icons";
import { FILTER_URL_PREFIX } from '~/helpers/const';
import { useTranslation } from '~/lib/i18nContext';

const LEGACY_IN_STOCK_PARAM = 'inStock';

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
    paramsClone.delete(LEGACY_IN_STOCK_PARAM);
    const nextSearch = paramsClone.toString();
    navigate(nextSearch ? `${location.pathname}?${nextSearch}` : location.pathname, {
      preventScrollReset: true,
      replace: true,
    });
    closeFilter();
  };
  const isOpen = isDrawerOpen('filter');
  const { t } = useTranslation();

  const Header = () => {
    return(
      <div className='p-12 flex justify-between items-center'>
        <span className='text-h1'>{t('filter.heading')}</span>
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
        <Button variant='secondary' size="medium" onClick={clearAllFilters} className='w-full'>
          {t('filter.clear_all')}
        </Button>
        <Button variant='primary' size="medium" onClick={closeFilter} className='w-full'>
          {t('filter.apply')}
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
