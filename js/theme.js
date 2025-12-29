// Theme toggle and per-page ink selector
(function(){
  const body = document.body;
  const html = document.documentElement;
  // apply saved theme
  const saved = localStorage.getItem('theme');
  if(saved === 'dark'){
    body.classList.add('dark');
    html.classList.add('dark');
  }

  // helper to update toggle label + icon
  function updateToggle(btn){
    if(!btn) return;
    const sun = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M4.93 19.07l1.41-1.41"></path><path d="M17.66 6.34l1.41-1.41"></path></svg>';
    const moon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path></svg>';
    const isDark = body.classList.contains('dark');
    // icon only, keep accessible label
    btn.innerHTML = isDark ? moon : sun;
    btn.setAttribute('aria-label', isDark ? '白背景に切替' : '黒背景に切替');
  }

  // add toggle button handler
  const btn = document.getElementById('themeToggle');
  if(btn){
    updateToggle(btn);
    btn.addEventListener('click', ()=>{
      const isDark = body.classList.toggle('dark');
      // mirror class on html so root background uses dark variables
      html.classList.toggle('dark', isDark);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      updateToggle(btn);
    });
  }

  // if no data-ink attribute, infer from pathname
  if(!body.hasAttribute('data-ink')){
    const p = location.pathname;
    if(p.endsWith('/') || p.endsWith('index.html')) body.setAttribute('data-ink','home');
    else if(p.includes('blog')) body.setAttribute('data-ink','blog');
    else if(p.includes('photos')) body.setAttribute('data-ink','photos');
    else if(p.includes('stamps')) body.setAttribute('data-ink','stamps');
    else body.setAttribute('data-ink','home');
  }
})();
