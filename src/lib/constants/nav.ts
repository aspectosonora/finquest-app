export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/inicio", label: "Inicio", icon: "/assets/navegacion/svg/inicio.svg" },
  { href: "/retos", label: "Retos", icon: "/assets/navegacion/svg/retos.svg" },
  { href: "/deudas", label: "Deudas", icon: "/assets/navegacion/svg/deudas.svg" },
  { href: "/metas", label: "Metas", icon: "/assets/navegacion/svg/metas.svg" },
  { href: "/equipo", label: "Equipo", icon: "/assets/navegacion/svg/equipo.svg" },
];
