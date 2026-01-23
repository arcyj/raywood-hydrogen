import { twc } from '~/helpers/twMerge';

export const SelectionTheme = {
  wrapperStyle: {
    initial: twc`group flex items-center py-8 px-8 rounded-lg`,
    base: twc`bg-lightGrey hover:bg-accentGrey`,
    selected: twc`bg-[#DAB1DA]`,
    cursor: {
      initial: 'hover:cursor-pointer',
      disabled: 'hover:cursor-not-allowed',
    },
  },
  labelStyle: {
    initial: twc`pl-8 text-link  hover:cursor-pointer hover:text-text-layout-accent group-hover:text-text-layout-accent peer-focus-visible/selection:text-text-layout-accent`,
    disabled: twc`pl-8 text-text-layout-strong hover:cursor-not-allowed hover:text-text-layout-strong group-hover:text-text-layout-strong`,
    sizes: {
      small: { initial: twc`text-small-text-regular`, checked: twc`text-small-text-semibold` },
      medium: { initial: twc`text-footnote-regular`, checked: twc`text-footnote-semibold` },
      large: { initial: twc`text-body-regular`, checked: twc`text-body-semibold` },
    },
  },
  selectionStyle: {
    base: twc`flex shrink-0 items-center justify-center border border-solid bg-starlit focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0`,
    backgroundColor: {
      initial: twc`hover:bg-surface-low-brand-focus hover:text-text-layout-accent focus-visible:bg-surface-low-brand-focus group-hover:bg-surface-low-brand-focus peer-focus-visible/selection:bg-surface-low-brand-focus`,
      disabled: twc`cursor-not-allowed hover:bg-starlit group-hover:bg-starlit`,
    },
    borderColor: {
      initial: twc`border-gray focus-visible:border-layout-accent group-hover:border-layout-accent peer-focus-visible/selection:border-layout-accent `,
      checked: twc`border-[#733B73] bg-[#5E095E] group-hover:border-layout-accent peer-focus-visible/selection:border-layout-accent`,
      error: twc`border-ruby-4 group-hover:border-layout-danger`,
      disabled: twc`border-layout-high group-hover:border-layout-high`,
    },
  },
  iconStyle: {
    fill: {
      initial: twc`fill-white`,
      disabled: twc`fill-text-layout-low`,
    },
    background: {
      initial: twc`bg-surface-high-brand-active`,
      disabled: twc`bg-text-layout-low`,
    },
  },
};
