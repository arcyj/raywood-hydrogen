import type { SVGProps } from 'react';

export type IIconProps = SVGProps<SVGSVGElement> & { size?: 16 | 20 | 24 | 32 | 64 | 96 | 128 };

// Twitter remains while text key contains 'twitter'
export type ISocialIcon = 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'twitter' | 'youtube';

export type ISocialIconTheme = 'light' | 'dark';

export const iconSizeMappedToText: Record<'extra-small' | 'small' | 'medium' | 'large', IIconProps['size']> = {
  'extra-small': 16,
  small: 20,
  medium: 24,
  large: 32,
};
