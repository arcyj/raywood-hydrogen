import { createContext, useContext, useState, useRef, type FC, type ReactNode } from 'react';
import { DropdownMenu } from "radix-ui";
import clsx from 'clsx';

const DropdownContext = createContext<{
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
} | null>(null);

const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdownContext must be used within a PopoverProvider');
  }
  return context;
};

interface IDropdownProps {
  className?: string;
  children: ReactNode;
  openOnHover?: boolean;
}

interface IDropdownButtonProps {
  children: ReactNode;
  className?: string;
}

interface IDropdownContentProps {
  children: ReactNode;
  className?: string;
}

export const Dropdown: FC<IDropdownProps> & {
  Button: FC<IDropdownButtonProps>;
  Content: FC<IDropdownContentProps>;
} = ({children, openOnHover = false}) => {
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (openOnHover) {
      // Clear any pending close timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (openOnHover) {
      // Set a timeout to close, but clear it if mouse re-enters
      closeTimeoutRef.current = setTimeout(() => {
        setOpen(false);
        closeTimeoutRef.current = null;
      }, 200);
    }
  };

  return (
    <DropdownContext.Provider
      value={{
        handleMouseEnter,
        handleMouseLeave,
      }}
    >
      <DropdownMenu.Root
        modal={false}
        open={openOnHover ? open : undefined}
        onOpenChange={openOnHover ? setOpen : undefined}
      >
        {children}
      </DropdownMenu.Root>
    </DropdownContext.Provider>
  );
};

const DropdownButton: FC<IDropdownButtonProps> = ({
  children
}) => {
  const { handleMouseEnter, handleMouseLeave } = useDropdownContext();
  return(
      <DropdownMenu.Trigger
        asChild
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </DropdownMenu.Trigger>
  )
}

const DropdownContent: FC<IDropdownContentProps> = ({
  children,
  className
}) => {
  const { handleMouseEnter, handleMouseLeave } = useDropdownContext();
  return (
      <DropdownMenu.Content
        className={clsx(
          "min-w-[220px] rounded-md bg-white overflow-hidden shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade",
          className
        )}
        sideOffset={5}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </DropdownMenu.Content>
  );
}

Dropdown.Button = DropdownButton
Dropdown.Content = DropdownContent
