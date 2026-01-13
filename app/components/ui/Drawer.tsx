import { Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useEffect, createContext, useContext, useRef } from 'react';
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
  position?: 'left' | 'right' | 'bottom' | 'top';
  className?: string;
  panelClassName?: string;
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
    enter="ease-in-out duration-100"
    enterFrom="opacity-70"
    enterTo="opacity-100"
    leave="ease-in-out duration-100"
    leaveFrom="opacity-100"
    leaveTo="opacity-70"
  >
    <div className="fixed inset-0 bg-gray/80" onClick={onClick} />
  </TransitionChild>
);

export const Drawer: FC<IDrawerProps> & { CloseButton: FC<IDrawerCloseButtonProps> } = ({
  visible,
  position = 'right',
  onClose,
  children,
  panelClassName,
  className,
}) => {
  const lockScroll = useScrollLocker();
  const transitionEnterLeaveFrom = twClasses([''], {
    ['translate-x-full']: position === 'right',
    ['-translate-x-full']: position === 'left',
    ['translate-y-full']: position === 'bottom',
    ['-translate-y-full']: position === 'top',
  });

  const containerClasses = twClasses(['drawer-container fixed flex rounded-xl mx-auto'], {
    ['inset-y-0 right-0 h-[calc(100%-75px)] max-w-[550px]']: position === 'right',
    ['inset-y-0 left-0 h-[calc(100%-75px)] max-w-[550px]']: position === 'left',
    ['inset-x-0 bottom-0 w-full h-[calc(100%-75px)] max-w-[550px]']: position === 'bottom',
    ['inset-x-0 top-0 w-full']: position === 'top',
  }, className);

  const panelClasses = twClasses(
    ['drawer-panel pointer-events-auto relative overflow-y-auto'],
    {
      ['h-full mb-[80px]']: position === 'right' || position === 'left',
      ['w-full']: position === 'bottom' || position === 'top',
      ['mb-[80px]']: position === 'bottom',
      ['mt-[45px]']: position === 'top',
    },
    panelClassName,
  );

  // Use a ref to track if scroll is currently locked
  const isLockedRef = useRef(false);

  useEffect(() => {
    if (visible && !isLockedRef.current) {
      // Lock scroll when drawer becomes visible
      lockScroll(true);
      isLockedRef.current = true;
    } else if (!visible && isLockedRef.current) {
      // Unlock scroll when drawer closes
      lockScroll(false);
      isLockedRef.current = false;
    }

    // Cleanup: ensure scroll is unlocked when component unmounts
    return () => {
      if (isLockedRef.current) {
        lockScroll(false);
        isLockedRef.current = false;
      }
    };
  }, [lockScroll, visible]);

  return (
    <DrawerContext.Provider value={{ onClose }}>
      <Transition show={visible} as={Fragment}>
        <div className="relative z-10">
          <DrawerBackDrop onClick={onClose} />
          <div className={containerClasses}>
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-in-out duration-100 max-tablet:duration-100"
              enterFrom={transitionEnterLeaveFrom}
              enterTo={position === 'bottom' || position === 'top' ? 'translate-y-0' : 'translate-x-0'}
              leave="transform transition ease-in-out duration-100 max-tablet:duration-100"
              leaveFrom={position === 'bottom' || position === 'top' ? 'translate-y-0' : 'translate-x-0'}
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
