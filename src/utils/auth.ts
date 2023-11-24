// Constante time of session cookies expires, currently 2H

export function getSessionExpires() {
  return new Date(Date.now() + 1000 * 60 * 60 * 2);
}
