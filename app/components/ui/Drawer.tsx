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
  header?: ReactNode;
  footer?: ReactNode;
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

const DrawerBackDrop: FC<{onClick?: () => void}> = ({onClick}) => (
  <TransitionChild
    as={Fragment}
    enter="ease duration-100"
    enterFrom="opacity-20"
    enterTo="opacity-90"
    leave="ease duration-100"
    leaveFrom="opacity-100"
    leaveTo="opacity-20"
  >
    <div
      className="fixed inset-0 bg-gray z-[999] backdrop-blur-[2px]"
      onClick={onClick}
    />
  </TransitionChild>
);

export const Drawer: FC<IDrawerProps> & { CloseButton: FC<IDrawerCloseButtonProps> } = ({
  visible,
  position = 'right',
  onClose,
  children,
  panelClassName,
  className,
  header,
  footer,
}) => {
  const lockScroll = useScrollLocker();
  const transitionEnterLeaveFrom = twClasses(['opacity-0'], {
    ['translate-x-full']: position === 'right',
    ['-translate-x-full']: position === 'left',
    ['translate-y-full']: position === 'bottom',
    ['-translate-y-full']: position === 'top',
  });

  const   containerClasses = twClasses(['drawer-container max-tablet:rounded-xl mx-auto z-[9998]'], {
    ['inset-y-0 right-0  max-w-[550px] fixed']: position === 'right',
    ['inset-y-0 left-0  max-w-[550px] fixed']: position === 'left',
    ['inset-x-0 bottom-0 w-full h-[calc(100%-75px)] max-w-[550px] fixed']: position === 'bottom',
    ['inset-x-0 top-44 fixed left-[50%] -translate-x-[50%]']: position === 'top',
  }, className);

  const panelClasses = twClasses(
    ['drawer-panel pointer-events-auto relative flex flex-col h-full'],
    {
      ['w-full']: position === 'bottom',
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

          <DrawerBackDrop onClick={onClose} />
          <div className={containerClasses}>
            <TransitionChild
              as={Fragment}
              enter="transform transition ease duration-200"
              enterFrom={transitionEnterLeaveFrom}
              enterTo={`opacity-100 ${position === 'bottom' || position === 'top' ? 'translate-y-0' : 'translate-x-0'}`}
              leave="transform transition ease duration-150"
              leaveFrom={`opacity-100 ${position === 'bottom' || position === 'top' ? 'translate-y-0' : 'translate-x-0'}`}
              leaveTo={transitionEnterLeaveFrom}
            >
              <div className={panelClasses}>
                {header && (
                  <div className="drawer-header flex-shrink-0">
                    {header}
                  </div>
                )}
                <div className="drawer-content flex-1 overflow-y-auto min-h-0">
                  {children}
                </div>
                {footer && (
                  <div className="drawer-footer flex-shrink-0 max-desktop:pb-80">
                    {footer}
                  </div>
                )}
              </div>
            </TransitionChild>
          </div>
      </Transition>
    </DrawerContext.Provider>
  );
};

Drawer.CloseButton = DrawerCloseButton;
