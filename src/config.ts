declare const __APP_VERSION__: string;
declare const __APP_BUILD__: string;

/** The shared collections (repositorios/) sit next to index.html. */
export const LIBRARY_ROOT = './';
export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';
/** Exact build (git describe), shown only as a tooltip on the version. */
export const APP_BUILD: string = typeof __APP_BUILD__ === 'string' ? __APP_BUILD__ : APP_VERSION;

/** Upper limits for imported files (memory safety on school computers). */
export const MAX_IMPORT_BYTES = 100 * 1024 * 1024;
/** eXeLearning packages are read by parts (only the slides and their images), so they can be larger. */
export const MAX_PACKAGE_BYTES = 2 * 1024 * 1024 * 1024;
export const MAX_IMAGE_SIDE = 8192;
