// ...existing code...
document.addEventListener('DOMContentLoaded', function(){
  // Nav toggle for small screens
  const nav = document.getElementById('mainNav');
  const toggle = document.getElementById('navToggle');
  toggle.addEventListener('click', ()=> nav.classList.toggle('show'));

  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href === '#' || href === '') return;
      const target = document.querySelector(href);
      if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth',block:'start'}); nav.classList.remove('show'); }
    });
  });

  // Local visitor counter (browser-local) with subtle animation
  const vEl = document.getElementById('visitorCount');
  const key = 'proyectoladilla_visits';
  let visits = parseInt(localStorage.getItem(key) || '0', 10);
  visits = isNaN(visits) ? 1 : visits + 1;
  localStorage.setItem(key, visits);
  if(vEl){
    vEl.textContent = `Visitas (local): ${visits}`;
    vEl.animate([{ transform: 'scale(0.98)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.2,.9,.2,1)' });
  }

  // Share buttons
  document.querySelectorAll('.share-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const url = encodeURIComponent(location.href);
      const text = encodeURIComponent('Mira el Folleto Virtual — SaludLab (Proyecto II)');
      const network = btn.dataset.network;
      let shareUrl = '';
      if(network === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      if(network === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      if(network === 'whatsapp') shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
      window.open(shareUrl, '_blank', 'noopener,width=700,height=500');
    });
  });

  // Contact form demo (client-side only)
  const sendBtn = document.getElementById('sendBtn');
  if(sendBtn){
    sendBtn.addEventListener('click', ()=>{
      const name = document.getElementById('name').value.trim();
      const message = document.getElementById('message').value.trim();
      if(!name || !message){ alert('Completa nombre y mensaje'); return; }
      alert('Mensaje preparado (demo). Copia y pega en tu correo para enviar.');
    });
  }

  // Simple reveal on scroll for sections
  const reveal = (el) => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(12px)';
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.2,.9,.2,1)';
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'none';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    io.observe(el);
  };
  document.querySelectorAll('.section, .card').forEach(el => reveal(el));

  // --- Collapse / expand posts with icon button ---
  document.querySelectorAll('.post').forEach((post, i) => {
    const header = post.querySelector('header');
    if(!header) return;

    // ensure post-body has an id for aria controls
    const body = post.querySelector('.post-body');
    const bodyId = body.id || `post-body-${i}`;
    body.id = bodyId;

    // create toggle button
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'post-toggle';
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-controls', bodyId);
    btn.title = 'Expandir/contraer sección';

    // SVG chevron + medical icon label
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M9.29 6.71a1 1 0 0 0 0 1.42L13.17 12l-3.88 3.88a1 1 0 1 0 1.42 1.42l4.59-4.59a1 1 0 0 0 0-1.42L10.71 6.7a1 1 0 0 0-1.42.01z"/></svg>
      <span class="post-toggle-label">Ocultar</span>
    `;

    // append to header (right side)
    header.appendChild(btn);

    // toggle function
    const toggle = (open) => {
      const isOpen = typeof open === 'boolean' ? open : post.classList.toggle('collapsed') ? false : true;
      // if explicit open boolean, adjust class accordingly
      if (typeof open === 'boolean') {
        if (open) post.classList.remove('collapsed'); else post.classList.add('collapsed');
      } else {
        // toggle already done above
      }
      const expanded = !post.classList.contains('collapsed');
      btn.setAttribute('aria-expanded', String(expanded));
      btn.querySelector('.post-toggle-label').textContent = expanded ? 'Ocultar' : 'Ver';
    };

    // click handler
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    // make header clickable too (except when clicking the button)
    header.addEventListener('click', (e) => {
      if (e.target.closest('.post-toggle')) return;
      toggle();
    });

    // keyboard support on header: Enter / Space toggles
    header.setAttribute('tabindex', '0');
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  // Initialize Swiper (main + thumbs) if present
  try {
    if (window.Swiper && document.querySelector('.main-swiper')) {
      const thumbsSwiper = new Swiper('.thumbs-swiper', {
        spaceBetween: 8,
        slidesPerView: 6,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
          980: { slidesPerView: 8 },
          680: { slidesPerView: 6 },
          0:   { slidesPerView: 3 }
        }
      });

      const mainSwiper = new Swiper('.main-swiper', {
        loop: true,
        spaceBetween: 12,
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        pagination: { el: '.swiper-pagination', clickable: true },
        autoplay: { delay: 4500, disableOnInteraction: false },
        thumbs: { swiper: thumbsSwiper },
        a11y: { enabled: true, prevSlideMessage: 'Anterior diapositiva', nextSlideMessage: 'Siguiente diapositiva' },
        keyboard: { enabled: true, onlyInViewport: true }
      });

      // Play / Pause control
      const playPause = document.getElementById('playPause');
      let playing = true;
      if (playPause) {
        playPause.addEventListener('click', () => {
          playing = !playing;
          playPause.setAttribute('aria-pressed', String(!playing));
          playPause.textContent = playing ? 'Pausa' : 'Reproducir';
          if (playing) mainSwiper.autoplay.start(); else mainSwiper.autoplay.stop();
        });
      }
    }
  } catch (err) {
    console.error('Swiper init error:', err);
  }

});
