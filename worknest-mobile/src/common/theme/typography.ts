export const fonts = {
  sf: {
    regular: 'SF-Pro-Display-Regular',
    bold: 'SF-Pro-Display-Bold',
    semibold: 'SF-Pro-Display-Semibold',
  },
  ny: {
    regular: 'New-York-Medium-Regular',
    bold: 'New-York-Medium-Bold',
  },
} as const;

export type FontFamily = typeof fonts;
