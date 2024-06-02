import { extendTheme } from '@chakra-ui/react'

export const themeConfig = {
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
}

type ThemeType = typeof themeConfig

export const theme = extendTheme(themeConfig) as ThemeType
