type BrandLogoProps = {
  variant?: "nav" | "home";
};

export function BrandLogo({ variant = "nav" }: BrandLogoProps) {
  return (
    <span
      className={variant === "home" ? "home-logo" : "brand-mark"}
      aria-hidden="true"
    />
  );
}
