  // Бургер-меню
  const burger = document.getElementById('burgerBtn');
  const navClose = document.getElementById('navCloseBtn');
  const nav = document.getElementById('primaryNav');
  const closeNav = () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', isOpen);
  });
  navClose.addEventListener('click', closeNav);
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') closeNav();
  });

  // Универсальный фильтр по рейке оттенков
  function initRailFilter(railId, itemsSelector, allValue){
    const rail = document.getElementById(railId);
    if(!rail) return;
    const buttons = rail.querySelectorAll('.shade-dot');
    const items = document.querySelectorAll(itemsSelector);
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.setAttribute('aria-pressed','false'));
        btn.setAttribute('aria-pressed','true');
        const cat = btn.dataset.cat;
        items.forEach(item => {
          const show = (cat === allValue) || (item.dataset.cat === cat) || !allValue && item.dataset.cat === cat;
          item.classList.toggle('is-visible', cat === 'all' ? true : item.dataset.cat === cat);
        });
      });
    });
  }
  initRailFilter('serviceFilter', '#serviceList .service-row');
  initRailFilter('portfolioFilter', '#portfolioGrid .port-item', 'all');

  // Отправка формы записи
  // По умолчанию сайт работает в демо-режиме (без backend) — это удобно
  // для GitHub Pages, где Node.js не запустить. Чтобы подключить реальный
  // backend (см. папку /backend), укажите его адрес ДО main.js:
  // <script>window.API_BASE_URL = 'https://ваш-backend.example.com';</script>
  const API_BASE_URL = window.API_BASE_URL || null;

  const form = document.getElementById('bookingForm');
  const status = document.getElementById('formStatus');
  const submitBtn = form.querySelector('button[type="submit"]');

  function setStatus(message, isError){
    status.textContent = message;
    status.classList.add('show');
    status.style.color = isError ? '#b03a3a' : '';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('f-name').value.trim(),
      phone: document.getElementById('f-phone').value.trim(),
      service: document.getElementById('f-service').value,
      date: document.getElementById('f-date').value,
      comment: document.getElementById('f-comment').value.trim()
    };

    // Демо-режим: backend не подключён (обычный случай для GitHub Pages).
    // Заявка никуда не уходит — просто показываем, как будет выглядеть отклик.
    if(!API_BASE_URL){
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляем…';
      setTimeout(() => {
        setStatus('Демо-режим: заявка не отправляется на сервер. Подключите backend (см. /backend), чтобы форма работала по-настоящему.', false);
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить заявку';
      }, 500);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем…';

    try{
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if(!res.ok){
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Не удалось отправить заявку');
      }

      setStatus('Заявка отправлена — мы свяжемся с вами для подтверждения.', false);
      form.reset();
    } catch(err){
      setStatus('Не получилось отправить заявку. Попробуйте ещё раз или позвоните нам напрямую.', true);
      console.error(err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить заявку';
    }
  });
