import { lazy, ComponentType } from 'react';

/**
 * A wrapper around React.lazy that retries the import if it fails.
 * Useful for handling flaky networks or new deployments where old chunks are missing.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retriesLeft = 2,
  interval = 1000
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const component = await componentImport();
      return component;
    } catch (error: any) {
      const message = error.message?.toLowerCase() || "";
      // Check if it's a chunk load error
      const isChunkError = 
        message.includes('failed to fetch dynamically imported module') ||
        message.includes('importing a module script failed') ||
        message.includes('expected a javascript-or-wasm module script') ||
        message.includes('failed to fetch');

      if (retriesLeft > 0 && isChunkError) {
        await new Promise((resolve) => setTimeout(resolve, interval));
        // Recurse for retry
        const retryResult = await (lazyWithRetry(componentImport, retriesLeft - 1, interval * 1.5) as any)._payload._result;
        return { default: retryResult };
      }

      // If no retries left and it's a chunk error, force a full page reload
      if (isChunkError) {
        console.warn('Chunk loading failed after retries, forcing reload...');
        window.location.reload();
        return new Promise(() => {}) as any;
      }

      throw error;
    }
  });
}
