interface LogoProps {
  size?: number;
  variant?: "dark" | "light";
  showText?: boolean;
  className?: string;
}

/**
 * GETON logo. variant "dark" = navy bg (for light backgrounds),
 * variant "light" = white bg (for dark/colored backgrounds).
 */
export function Logo({
  size = 40,
  variant = "dark",
  showText = false,
  className = "",
}: LogoProps) {
  const src = variant === "dark" ? "/logo.png" : "/logo-white.png";

  if (showText) {
    // Icon + text side by side (used in login/register headers, splash)
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <img
          src={src}
          alt="GETON"
          style={{ width: size, height: size }}
          className="rounded-2xl object-cover"
        />
        <span
          className="mt-2 text-2xl font-black tracking-tight"
          style={{ color: variant === "dark" ? "#0F0A2E" : "#FFFFFF" }}
        >
          GETON
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="GETON"
      style={{ width: size, height: size }}
      className={`rounded-2xl object-cover ${className}`}
    />
  );
}
