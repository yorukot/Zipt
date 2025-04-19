import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';
import {defaultLocale} from './settings';
 
export default getRequestConfig(async ({locale}) => {
  // Read from cookie first
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  
  // Use cookie locale if available, otherwise use the provided locale or default
  const finalLocale = cookieLocale || locale || defaultLocale;
  
  return {
    locale: finalLocale,
    messages: (await import(`../messages/${finalLocale}.json`)).default
  };
});