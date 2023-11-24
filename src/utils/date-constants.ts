const TEN_MINUTES = 1000 * 60 * 10;
const TWO_HOURS = 1000 * 60 * 60 * 2;

export function emailExpiration() {
  return new Date(Date.now() + TEN_MINUTES);
}

export function getSessionExpires() {
  return new Date(Date.now() + TWO_HOURS);
}
