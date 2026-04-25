
const API = 'http://localhost:3000';
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.style.background = window.scrollY > 60 ? 'rgba(6,6,6,0.97)' : 'rgba(6,6,6,0.85)';
  });
}
const menuBtn = document.getElementById('menuBtn');
if (menuBtn && navbar) {
  menuBtn.addEventListener('click', () => {
    const ul = navbar.querySelector('ul');
    const isOpen = ul.style.display === 'flex';
    ul.style.cssText = isOpen ? '' : 'display:flex;flex-direction:column;position:fixed;top:72px;left:0;right:0;background:rgba(6,6,6,0.97);padding:2rem;gap:1.5rem;border-bottom:1px solid rgba(123,47,255,0.2);z-index:99;';
  });
}
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.style.animationPlayState = 'running'; animObserver.unobserve(e.target); }});
}, { threshold: 0.1 });
document.querySelectorAll('.animate').forEach(el => { el.style.animationPlayState = 'paused'; animObserver.observe(el); });
function updateCountdown() {
  const diff = new Date('2026-08-15T12:00:00') - new Date();
  if (diff <= 0) return;
  const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  s('days', Math.floor(diff/86400000));
  s('hours', String(Math.floor((diff%86400000)/3600000)).padStart(2,'0'));
  s('mins', String(Math.floor((diff%3600000)/60000)).padStart(2,'0'));
  s('secs', String(Math.floor((diff%60000)/1000)).padStart(2,'0'));
}
updateCountdown();
setInterval(updateCountdown, 1000);
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type=submit]');
    btn.textContent = 'Sending...'; btn.disabled = true;
    try {
      const res = await fetch(API+'/contact', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({firstName:contactForm.querySelector('input[type=text]')?.value,email:contactForm.querySelector('input[type=email]')?.value,subject:contactForm.querySelector('select')?.value,message:contactForm.querySelector('textarea')?.value})});
      if (res.ok) { contactForm.style.display='none'; const s=document.getElementById('formSuccess'); if(s) s.style.display='block'; }
      else throw new Error();
    } catch { btn.textContent='Send Message'; btn.disabled=false; alert('Could not send. Try WhatsApp instead.'); }
  });
}
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  });
});
