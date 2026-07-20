(function () {
  var scripts = document.getElementsByTagName('script');
  var currentScript = scripts[scripts.length - 1];
  var slug = currentScript.getAttribute('data-slug');
  var baseUrl = currentScript.getAttribute('data-host') || 'https://creator-attribution-dashboard.vercel.app';

  if (!slug) {
    console.error('Creator Attribution Embed: missing data-slug attribute');
    return;
  }

  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/c/' + slug + '?embed=true';
  iframe.style.width = '100%';
  iframe.style.height = '420px';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '16px';
  iframe.style.overflow = 'hidden';

  currentScript.parentNode.insertBefore(iframe, currentScript);
})();
