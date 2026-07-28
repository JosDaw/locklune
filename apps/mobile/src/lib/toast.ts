/**
 * App-wide toast messages, usable from anywhere - React components, Zustand
 * stores, and plain libs alike. A single <ToastProvider/> registers the handler
 * on mount; these functions are the imperative API everything else calls.
 *
 * Purely on-device UI feedback: nothing is logged, stored, or sent anywhere.
 */
export type ToastVariant = 'error' | 'success' | 'info';

export interface ToastOptions {
  variant?: ToastVariant;
  /** Auto-dismiss delay in ms. */
  duration?: number;
}

type Handler = (message: string, opts: Required<ToastOptions>) => void;

let handler: Handler | null = null;

/** Registered by <ToastProvider/>; pass null on unmount. */
export function setToastHandler(h: Handler | null): void {
  handler = h;
}

export function show(message: string, opts: ToastOptions = {}): void {
  handler?.(message, { variant: opts.variant ?? 'info', duration: opts.duration ?? 3200 });
}

export function error(message: string): void {
  show(message, { variant: 'error' });
}

export function success(message: string): void {
  show(message, { variant: 'success' });
}

export function info(message: string): void {
  show(message, { variant: 'info' });
}
