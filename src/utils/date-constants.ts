const TEN_MINUTES = 1000 * 60 * 10;

export function emailExpiration() {
  return new Date(Date.now() + TEN_MINUTES);
}
