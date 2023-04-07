import { useMediaQuery } from "@chakra-ui/react";

const DIVIDE_SCREEN = "1240px";

export const useMobile = () => {
  const [isMobile] = useMediaQuery(`(max-width: ${DIVIDE_SCREEN})`);
  return isMobile;
};
