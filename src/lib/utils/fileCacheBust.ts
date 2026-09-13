export function addVersionToFile(src: string, version?: number) {
  if (!version) return src;
  const url = new URL(src, 'https://notebook.invalid');
  url.searchParams.set('v', String(version));
  return src.startsWith('/')
    ? `${url.pathname}${url.search}${url.hash}`
    : url.toString();
}
