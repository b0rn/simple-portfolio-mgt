type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function registerUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorized = handler;
  return () => {
    if (onUnauthorized === handler) {
      onUnauthorized = null;
    }
  };
}

export function emitUnauthorized() {
  if (onUnauthorized) {
    onUnauthorized();
  }
}
