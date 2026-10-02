declare const __APP_VERSION__: string;

/** The shared collections (repositorios/) sit next to index.html. */
export const LIBRARY_ROOT = './';
export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';

/** Upper limits for imported files (memory safety on school computers). */
export const MAX_IMPORT_BYTES = 20 * 1024 * 1024;
export const MAX_IMAGE_SIDE = 8192;
