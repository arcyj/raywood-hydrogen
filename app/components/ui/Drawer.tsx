import { Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useEffect, createContext, useContext } from 'react';
import { twClasses } from '~/helpers/twMerge';
import { useScrollLocker } from '~/hooks/useScrollLocker';
import { Cart } from '../icons/Cart';
import type { FC, ReactNode } from 'react';

const DrawerContext = createContext<{ onClose: () => void } | null>(null);

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) throw new Error('useDrawer must be used within Drawer');
  return context;
};

interface IDrawerProps {
  visible: boolean;
  children: ReactNode;
  onClose: () => void;
  position?: 'left' | 'right' | 'bottom';
  className?: string;
}

interface IDrawerCloseButtonProps {
  className?: string;
  onClick?: () => void;
}

const DrawerCloseButton: FC<IDrawerCloseButtonProps> = ({ className, onClick }) => {
  const buttonClasses = twClasses(['cursor-pointer'], {}, className);

  return (
    <div className={buttonClasses} onClick={onClick}>
      <Cart size={24} className="hover:fill-text-layout-accent" />
    </div>
  );
};

const DrawerBackDrop: FC<{ onClick?: () => void }> = ({ onClick }) => (
  <TransitionChild
    as={Fragment}
    enter="ease-in-out duration-500"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="ease-in-out duration-500"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
  >
    <div className="fixed inset-0 bg-gray/80 backdrop-blur-[1px]" onClick={onClick} />
  </TransitionChild>
);

export const Drawer: FC<IDrawerProps> & { CloseButton: FC<IDrawerCloseButtonProps> } = ({
  visible,
  position = 'right',
  onClose,
  children,
  className,
}) => {
  const lockScroll = useScrollLocker();
  const transitionEnterLeaveFrom = twClasses([''], {
    ['translate-x-full']: position === 'right',
    ['-translate-x-full']: position === 'left',
    ['translate-y-[70px]']: position === 'bottom',
  });

  const containerClasses = twClasses(['drawer-container fixed flex max-w-full'], {
    ['inset-y-0 right-0']: position === 'right',
    ['inset-y-0 left-0']: position === 'left',
    ['inset-x-[71px] bottom-[71px] w-full left-0']: position === 'bottom',
  });

  const panelClasses = twClasses(
    ['drawer-panel pointer-events-auto relative overflow-y-auto'],
    {
      ['h-full']: position !== 'bottom',
      ['w-full']: position == 'bottom',
    },
    className,
  );

  useEffect(() => {
    lockScroll(visible);
    return () => lockScroll(false);
  }, [lockScroll, visible]);

  return (
    <DrawerContext.Provider value={{ onClose }}>
      <Transition show={visible} as={Fragment}>
        <div className="relative z-10">
          <DrawerBackDrop onClick={onClose} />
          <div className={containerClasses}>
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-in-out duration-300 max-tablet:duration-100"
              enterFrom={transitionEnterLeaveFrom}
              enterTo={position === 'bottom' ? 'translate-y-0' : 'translate-x-0'}
              leave="transform transition ease-in-out duration-300 max-tablet:duration-100"
              leaveFrom={position === 'bottom' ? 'translate-y-0' : 'translate-x-0'}
              leaveTo={transitionEnterLeaveFrom}
            >
              <div className={panelClasses}>{children}</div>
            </TransitionChild>
          </div>
        </div>
      </Transition>
    </DrawerContext.Provider>
  );
};

Drawer.CloseButton = DrawerCloseButton;
