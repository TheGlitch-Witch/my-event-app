export function Button({variant='default', size, className='', ...props}) {
  const base="inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-medium shadow-sm";
  const v={default:"bg-black text-white hover:opacity-90",outline:"border border-gray-300 bg-white hover:bg-gray-50",secondary:"bg-gray-200 hover:bg-gray-300",ghost:"hover:bg-gray-100"}[variant]||"";
  const s={sm:"px-2 py-1 text-xs",icon:"p-2 aspect-square"}[size]||"";
  return <button className={`${base} ${v} ${s} ${className}`} {...props} />;
}
