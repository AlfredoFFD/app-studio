// Ambient declarations so `tsc` accepts CSS imports that Metro/Expo handle at
// bundle time (global.css web styling + *.module.css for web components).
declare module '*.css';
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
