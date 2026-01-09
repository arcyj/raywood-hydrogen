import clsx from 'clsx';

export const twClasses = (
  classes: string[] | string,
  conditionalClasses: { [key: string]: boolean } = {},
  className = '',
): string => clsx(classes, conditionalClasses, className);

export const twc = (s: TemplateStringsArray) => s.join(' ');
