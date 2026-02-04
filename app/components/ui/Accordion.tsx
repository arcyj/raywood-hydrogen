import { Accordion as RadixAccordion } from "radix-ui";
import { Children, isValidElement } from "react";
import { twClasses } from "~/helpers/twMerge";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useId } from "react";
import type { FC, ReactElement, ReactNode } from "react";

interface IAccordionProps {
  children: ReactNode;
  className?: string;
  /** When true (default), all items start open. When false, all start closed. Items need explicit value props for defaultOpenAll to work. */
  defaultOpenAll?: boolean;
}

interface IAccordionTriggerProps {
  children: ReactNode;
  className?: string
}

interface IAccordionContentProps {
  children: ReactNode;
  className?: string
}

interface IAccordionItemProps {
  children: ReactNode;
  className?: string;
  value?: string;
}

export const Accordion: FC<IAccordionProps> & {
  Trigger: FC<IAccordionTriggerProps>;
  Content: FC<IAccordionContentProps>;
  Item: FC<IAccordionItemProps>;
} = ({
  children,
  className,
  defaultOpenAll = true,
}) => {
  // Collect item values from direct children during render (no effects)
  const defaultValues: string[] = [];
  if (defaultOpenAll) {
    Children.forEach(children, (child) => {
      if (
        isValidElement(child) &&
        (child as ReactElement<IAccordionItemProps>).type === AccordionItem
      ) {
        const value = (child.props as IAccordionItemProps).value;
        if (value != null) defaultValues.push(value);
      }
    });
  }

  return (
    <RadixAccordion.Root
      type="multiple"
      className={className}
      defaultValue={defaultOpenAll ? defaultValues : []}
    >
      {children}
    </RadixAccordion.Root>
  );
}

const AccordionTrigger: FC<IAccordionTriggerProps> = ({
  children,
  className,
}) => {
  const classes = twClasses(['border-b-2 border-solid border-lightGrey w-full text-left pb-8 mt-16 flex items-center justify-between'], {} , className)
  return (
    <RadixAccordion.Trigger className={classes}>
      {children}
      <ChevronDownIcon
        className="text-violet10 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
        aria-hidden
      />
    </RadixAccordion.Trigger>
  );
};

const AccordionContent: FC<IAccordionContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <RadixAccordion.Content className={className} {...props}>
      {children}
    </RadixAccordion.Content>
  );
};

const AccordionItem: FC<IAccordionItemProps> = ({
  children,
  className,
  value: valueProp,
}) => {
  const fallbackValue = useId();
  const value = valueProp ?? fallbackValue;

  return (
    <RadixAccordion.Item className={className} value={value}>
      {children}
    </RadixAccordion.Item>
  );
};

Accordion.Trigger = AccordionTrigger
Accordion.Item = AccordionItem
Accordion.Content = AccordionContent
