declare module "react-hamburger-menu" {
  import { FC } from "react";

  interface HamburgerMenuProps {
    isOpen: boolean;
    menuClicked: () => void;
    width: number;
    height: number;
    color: string;
    className?: string;
    strokeWidth: number;
    borderRadius: number;
    animationDuration: number;
  }

  const HamburgerMenu: FC<HamburgerMenuProps>;
  export default HamburgerMenu;
}
