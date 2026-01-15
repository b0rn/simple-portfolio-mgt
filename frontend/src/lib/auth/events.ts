type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function registerUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorized = handler;
}

export function emitUnauthorized() {
  if (onUnauthorized) {
    onUnauthorized();
  }
}
