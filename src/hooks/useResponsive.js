import { useWindowDimensions } from 'react-native';

import { breakpoints, layout } from '../theme/index.js';

export function getResponsive(width) {
  const isDesktop = width >= breakpoints.desktop;
  const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
  const isMobile = width < breakpoints.tablet;
  const isWide = width >= breakpoints.wide;

  return {
    width,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    contentMaxWidth: isWide ? layout.wideMaxWidth : layout.desktopMaxWidth,
    columns: isDesktop ? 4 : isTablet ? 2 : 1,
    compact: isDesktop,
    showSidebar: isDesktop,
    showBottomTabs: !isDesktop,
  };
}

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  return { ...getResponsive(width), height };
}
