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
    for (let i = 0; i <= retriesLeft; i++) {
      try {
        return await componentImport();
      } catch (error: any) {
        const message = error.message?.toLowerCase() || "";
        const isChunkError = 
          message.includes('failed to fetch dynamically imported module') ||
          message.includes('importing a module script failed') ||
          message.includes('expected a javascript-or-wasm module script') ||
          message.includes('failed to fetch');

        if (i < retriesLeft && isChunkError) {
          await new Promise((resolve) => setTimeout(resolve, interval * Math.pow(1.5, i)));
          continue;
        }

        if (isChunkError) {
          console.warn('Chunk loading failed after retries, forcing reload...');
          window.location.reload();
          // Return a dummy promise that never resolves to stop execution
          return new Promise(() => {}) as any;
        }
        
        throw error;
      }
    }
    // Fallback (should not be reached)
    return componentImport();
  });
}
