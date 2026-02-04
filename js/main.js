document.addEventListener('DOMContentLoaded', () => {

  // ===== Navbar active link on scroll =====
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  function updateActiveNav() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();

  // ===== Close mobile menu on link click =====
  const navCollapse = document.getElementById('navbarNav');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navCollapse.classList.contains('show')) {
        bootstrap.Collapse.getInstance(navCollapse)?.hide();
      }
    });
  });

  // ===== Fade-in on scroll =====
  const fadeEls = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  fadeEls.forEach(el => observer.observe(el));

  // ===== Load Testimonials =====
  loadTestimonials();

  // ===== Load Photographers =====
  loadPhotographers();

  // ===== Gallery =====
  initGallery();

  // ===== Contact Form =====
  initContactForm();
});

// ===== Testimonials from JSON =====
async function loadTestimonials() {
  try {
    const res = await fetch('data/testimonials.json');
    const data = await res.json();
    const inner = document.getElementById('testimonialCarouselInner');
    const indicators = document.getElementById('testimonialIndicators');
    if (!inner) return;

    inner.innerHTML = '';
    indicators.innerHTML = '';

    data.forEach((item, i) => {
      // Indicator
      const indicator = document.createElement('button');
      indicator.type = 'button';
      indicator.setAttribute('data-bs-target', '#testimonialCarousel');
      indicator.setAttribute('data-bs-slide-to', i);
      if (i === 0) indicator.classList.add('active');
      indicator.setAttribute('aria-label', `Slide ${i + 1}`);
      indicators.appendChild(indicator);

      // Slide
      const slide = document.createElement('div');
      slide.className = `carousel-item${i === 0 ? ' active' : ''}`;
      slide.innerHTML = `
        <div class="testimonial-card mx-auto" style="max-width:650px;">
          ${item.image ? `<img src="${item.image}" alt="Vélemény" class="testimonial-img" onerror="this.style.display='none'">` : ''}
          <div class="testimonial-text">${item.text}</div>
          <div class="testimonial-venue"><i class="fas fa-map-marker-alt me-1"></i>${item.venue}</div>
          ${item.photo_credit ? `<div class="testimonial-photo-credit"><i class="fas fa-camera me-1"></i>${item.photo_credit}</div>` : ''}
          ${item.tags ? `<div class="testimonial-tags">${item.tags.map(t => `<span>${t}</span>`).join(' ')}</div>` : ''}
        </div>
      `;
      inner.appendChild(slide);
    });
  } catch (e) {
    console.error('Testimonials load error:', e);
  }
}

// ===== Photographers from JSON =====
async function loadPhotographers() {
  try {
    const res = await fetch('data/photographers.json');
    const data = await res.json();
    const container = document.getElementById('photographersList');
    if (!container) return;

    container.innerHTML = '';
    data.forEach(item => {
      const col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4 mb-4';
      col.innerHTML = `
        <div class="photographer-card">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/400x200?text=Fotós'">
          <div class="card-body">
            <h5>${item.name}</h5>
            <p>${item.description}</p>
            <a href="${item.link}" target="_blank" class="btn btn-outline-custom btn-sm">
              <i class="fas fa-external-link-alt me-1"></i>Megnézem
            </a>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  } catch (e) {
    console.error('Photographers load error:', e);
  }
}

// ===== Gallery with filtering & lightbox =====
function initGallery() {
  const galleryItems = [
    { src: 'images/gallery/dance_01.jpg', type: 'photo', thumb: 'images/gallery/dance_01.jpg' },
    { src: 'images/gallery/dance_02.jpg', type: 'photo', thumb: 'images/gallery/dance_02.jpg' },
    { src: 'images/gallery/dance_03.jpg', type: 'photo', thumb: 'images/gallery/dance_03.jpg' },
    { src: 'images/gallery/dance_04.jpg', type: 'photo', thumb: 'images/gallery/dance_04.jpg' },
    { src: 'images/gallery/dance_05.jpg', type: 'photo', thumb: 'images/gallery/dance_05.jpg' },
    { src: 'images/gallery/dance_06.jpg', type: 'photo', thumb: 'images/gallery/dance_06.jpg' },
    { src: 'images/gallery/dance_07.jpg', type: 'photo', thumb: 'images/gallery/dance_07.jpg' },
    { src: 'images/gallery/dance_08.jpg', type: 'photo', thumb: 'images/gallery/dance_08.jpg' },
    { src: 'images/gallery/dance_09.jpg', type: 'photo', thumb: 'images/gallery/dance_09.jpg' },
    { src: 'images/gallery/dance_10.jpg', type: 'photo', thumb: 'images/gallery/dance_10.jpg' },
    { src: 'images/gallery/dance_11.jpg', type: 'photo', thumb: 'images/gallery/dance_11.jpg' },
    { src: 'images/gallery/dance_12.jpg', type: 'photo', thumb: 'images/gallery/dance_12.jpg' },
    { src: 'images/gallery/dance_13.jpg', type: 'photo', thumb: 'images/gallery/dance_13.jpg' },
    { src: 'images/gallery/dance_14.jpg', type: 'photo', thumb: 'images/gallery/dance_14.jpg' },
    { src: 'images/gallery/dance_15.jpg', type: 'photo', thumb: 'images/gallery/dance_15.jpg' }
    // Video példa - ezt később bővítheted:
    // { src: 'https://www.youtube.com/embed/VIDEO_ID', type: 'video', thumb: 'images/gallery/video_thumb.jpg' }
  ];

  const grid = document.getElementById('galleryGrid');
  const filterBtns = document.querySelectorAll('.gallery-filters .btn');
  let currentFilter = 'all';
  let currentItems = [];
  let lightboxIndex = 0;

  function renderGallery(filter) {
    currentFilter = filter;
    currentItems = filter === 'all' ? [...galleryItems] : galleryItems.filter(i => i.type === filter);
    grid.innerHTML = '';

    currentItems.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = `gallery-item${item.type === 'video' ? ' video-item' : ''}`;
      div.innerHTML = `
        <img src="${item.thumb}" alt="Galéria" loading="lazy">
        <div class="gallery-overlay"><i class="fas ${item.type === 'video' ? 'fa-play-circle' : 'fa-search-plus'}"></i></div>
      `;
      div.addEventListener('click', () => openLightbox(i));
      grid.appendChild(div);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGallery(btn.dataset.filter);
    });
  });

  // Lightbox
  const lightboxModal = new bootstrap.Modal(document.getElementById('lightboxModal'));
  const lightboxBody = document.getElementById('lightboxBody');

  function openLightbox(index) {
    lightboxIndex = index;
    showLightboxContent();
    lightboxModal.show();
  }

  function showLightboxContent() {
    const item = currentItems[lightboxIndex];
    if (item.type === 'video') {
      lightboxBody.innerHTML = `<iframe src="${item.src}" allowfullscreen></iframe>`;
    } else {
      lightboxBody.innerHTML = `<img src="${item.src}" alt="Galéria">`;
    }
  }

  document.querySelector('.lightbox-prev')?.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex - 1 + currentItems.length) % currentItems.length;
    showLightboxContent();
  });

  document.querySelector('.lightbox-next')?.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex + 1) % currentItems.length;
    showLightboxContent();
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    const modal = document.getElementById('lightboxModal');
    if (!modal.classList.contains('show')) return;
    if (e.key === 'ArrowLeft') {
      lightboxIndex = (lightboxIndex - 1 + currentItems.length) % currentItems.length;
      showLightboxContent();
    } else if (e.key === 'ArrowRight') {
      lightboxIndex = (lightboxIndex + 1) % currentItems.length;
      showLightboxContent();
    }
  });

  // Touch swipe for lightbox
  let touchStartX = 0;
  let touchEndX = 0;
  const lightboxEl = document.getElementById('lightboxModal');

  lightboxEl.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightboxEl.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left → next
        lightboxIndex = (lightboxIndex + 1) % currentItems.length;
      } else {
        // Swipe right → prev
        lightboxIndex = (lightboxIndex - 1 + currentItems.length) % currentItems.length;
      }
      showLightboxContent();
    }
  }, { passive: true });

  renderGallery('all');
}

// ===== Contact Form → mailto =====
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('senderName').value.trim();
    const email = document.getElementById('senderEmail').value.trim();
    const date = document.getElementById('weddingDate').value;
    const message = document.getElementById('messageText').value.trim();

    if (!name || !email || !message) {
      alert('Kérlek, töltsd ki az összes kötelező mezőt!');
      return;
    }

    const subject = encodeURIComponent(`Esküvői nyitótánc érdeklődés - ${name}`);
    const body = encodeURIComponent(
      `Feladó neve: ${name}\n` +
      `Feladó e-mail: ${email}\n` +
      `Esküvő dátuma: ${date || 'Még nem tudom'}\n` +
      `\nÜzenet:\n${message}`
    );

    window.location.href = `mailto:feher.n28@gmail.com?subject=${subject}&body=${body}`;

    // Show success feedback
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check me-2"></i>Megnyitom az email klienst...';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 3000);
  });
}
