import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // Import the translation files for the requested locale
  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
}); 