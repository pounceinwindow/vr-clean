(() => {
  const model = document.querySelector('#sofa-model');
  if (!model) return;

  model.addEventListener('load', () => document.documentElement.classList.add('model-ready'));
  model.addEventListener('error', () => document.documentElement.classList.remove('model-ready'));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) model.removeAttribute('auto-rotate');

  function loadModel() {
    if (location.protocol !== 'file:') {
      model.setAttribute('src', 'assets/sofa.glb?v=2');
      return;
    }

    // file:// pages cannot fetch a neighbouring GLB. A deferred classic script
    // delivers the same bytes without relaxing the browser's security policy.
    const embedded = document.createElement('script');
    embedded.src = 'assets/sofa-model-data.js';
    embedded.onload = () => {
      if (window.vrSofaModelData) {
        model.setAttribute('src', window.vrSofaModelData);
        delete window.vrSofaModelData;
      }
      embedded.remove();
    };
    embedded.onerror = () => {
      document.documentElement.classList.remove('model-ready');
      embedded.remove();
    };
    document.body.appendChild(embedded);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        loadModel();
      }
    }, { rootMargin: '400px' });
    observer.observe(model);
  } else {
    loadModel();
  }
})();
