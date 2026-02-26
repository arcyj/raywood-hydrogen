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
    enter="transition-opacity duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]"
    enterFrom="opacity-20"
    enterTo="opacity-90"
    leave="transition-opacity duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]"
    leaveFrom="opacity-90"
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
  const transitionEnterLeaveFrom = twClasses(
    'opacity-0 transform-gpu',
    {
      'translate-x-full': position === 'right',
      '-translate-x-full': position === 'left',
      'translate-y-full': position === 'bottom',
      '-translate-y-full': position === 'top',
    }
  );

  const containerClasses = twClasses(['drawer-container mx-auto z-[9998] overflow-hidden'], {
    ['inset-y-24 right-24 min-w-[400px]  max-w-[500px] tablet:w-[500px] fixed rounded-2xl']: position === 'right',
    ['tablet:inset-y-24 tablet:left-24 inset-y-0 left-0  tablet:min-w-[400px]  max-w-[500px] tablet:w-[500px] tablet:rounded-2xl fixed']: position === 'left',
    ['inset-x-0 bottom-0 w-full h-full max-w-[550px] fixed']: position === 'bottom',
    ['inset-x-0 top-44 fixed left-[50%] -translate-x-[50%] w-full']: position === 'top',
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
                as="div"
                className={panelClasses}
                enter="transform-gpu transition-transform transition-opacity duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]"
                enterFrom={transitionEnterLeaveFrom}
                enterTo="opacity-100 translate-x-0 translate-y-0"
                leave="transform-gpu transition-transform transition-opacity duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]"
                leaveFrom="opacity-100 translate-x-0 translate-y-0"
                leaveTo={transitionEnterLeaveFrom}
              >
                {header && (
                  <div className="drawer-header flex-shrink-0">
                    {header}
                  </div>
                )}
                <div className="drawer-content scrollbar flex-1 min-h-0">
                  {children}
                </div>
                {footer && (
                  <div className="drawer-footer flex-shrink-0 max-desktop:pb-80">
                    {footer}
                  </div>
                )}
              </TransitionChild>
          </div>
      </Transition>
    </DrawerContext.Provider>
  );
};

Drawer.CloseButton = DrawerCloseButton;
