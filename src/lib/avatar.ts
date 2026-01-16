export function defaultAvatar(seed: string) {
  const s = encodeURIComponent(seed || "user");
  // avatar đẹp, ổn định theo seed (phone/userId)
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${s}`;
}
