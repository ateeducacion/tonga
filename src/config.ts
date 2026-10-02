// Where the shared collections live relative to the app. Until the cutover the app is
// published under next/ and the collections at the site root; Vite injects the value.
declare const __LIBRARY_ROOT__: string;
declare const __APP_VERSION__: string;

export const LIBRARY_ROOT: string = typeof __LIBRARY_ROOT__ === 'string' ? __LIBRARY_ROOT__ : './';
export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';

/** Upper limits for imported files (memory safety on school computers). */
export const MAX_IMPORT_BYTES = 20 * 1024 * 1024;
export const MAX_IMAGE_SIDE = 8192;
