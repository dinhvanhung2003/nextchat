"use client";

type Props = {
  src?: string | null;
  alt?: string;
  size?: number; // px
};

export default function UserAvatar({
  src,
  alt = "avatar",
  size = 36,
}: Props) {
  return (
    <img
      src={src || "https://api.dicebear.com/9.x/thumbs/svg?seed=user"}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover border bg-white shrink-0"
      style={{ width: size, height: size }}
    />
  );
}
