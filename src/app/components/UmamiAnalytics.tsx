import Script from 'next/script';

export function UmamiAnalytics() {
  return (
    <Script
      async
      src="https://cloud.umami.is/script.js"
      data-website-id="3b4aa333-2b16-46c2-bcdb-2b70d8a8d870"
    />
  );
}