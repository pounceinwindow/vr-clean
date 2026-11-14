(() => {
  const app = document.querySelector('#estimate-app');
  const itemsContainer = document.querySelector('#estimate-items');
  const selectedContainer = document.querySelector('#estimate-selected');
  const totalNode = document.querySelector('#estimate-total');
  const clearButton = document.querySelector('#estimate-clear');
  const announcement = document.querySelector('#estimate-announcement');
  if (!app || !itemsContainer || !selectedContainer || !totalNode || !clearButton || !announcement) return;

  // Indicative market rates from other Kazan providers, not VR Clean's own prices.
  const services = [
    { name: 'Поддерживающая уборка', price: 60, unit: 'м²' },
    { name: 'Генеральная уборка', price: 120, unit: 'м²' },
    { name: 'Уборка после ремонта', price: 140, unit: 'м²' },
    { name: 'Диван двухместный', price: 1800, unit: 'шт.' },
    { name: 'Диван трёхместный', price: 2300, unit: 'шт.' },
    { name: 'Диван угловой', price: 3000, unit: 'шт.' },
    { name: 'Химчистка ковра', price: 150, unit: 'м²' },
    { name: 'Мойка окна, две створки', price: 800, unit: 'шт.' }
  ];
  // A compact total stays with the service list on small screens.
  const summary = app.querySelector('.estimate-summary');
  let compactTotal;
  if (summary) {
    summary.id = 'estimate-summary';
    summary.tabIndex = -1;
    const compact = document.createElement('div');
    compact.className = 'estimate-compact-total';
    const amount = document.createElement('div');
    amount.className = 'estimate-compact-amount';
    amount.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = 'Примерно';
    compactTotal = document.createElement('strong');
    amount.append(label, compactTotal);
    const link = document.createElement('a');
    link.href = '#estimate-summary';
    link.textContent = 'К расчёту';
    link.setAttribute('aria-label', 'Перейти к подробному расчёту');
    compact.append(amount, link);
    app.insertBefore(compact, itemsContainer);
  }

  const currency = (amount) => `${new Intl.NumberFormat('ru-RU').format(amount)} ₽`;
  const quantities = services.map(() => 0);
  const inputs = [];
  const minusButtons = [];
  const plusButtons = [];

  services.forEach((service, index) => {
    const row = document.createElement('div');
    row.className = 'estimate-row';
    const text = document.createElement('div');
    const name = document.createElement('p');
    name.className = 'estimate-item-name';
    name.textContent = service.name;
    const price = document.createElement('p');
    price.className = 'estimate-item-price';
    price.textContent = `${currency(service.price)} / ${service.unit}`;
    text.append(name, price);

    const counter = document.createElement('div');
    counter.className = 'estimate-counter';
    const minus = document.createElement('button');
    minus.type = 'button';
    minus.textContent = '−';
    minus.setAttribute('aria-label', `Уменьшить количество: ${service.name}`);
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = '999';
    input.step = '1';
    input.inputMode = 'numeric';
    input.value = '0';
    input.setAttribute('aria-label', `Количество: ${service.name}, ${service.unit}`);
    const plus = document.createElement('button');
    plus.type = 'button';
    plus.textContent = '+';
    plus.setAttribute('aria-label', `Увеличить количество: ${service.name}`);
    inputs.push(input);
    minusButtons.push(minus);
    plusButtons.push(plus);
    counter.append(minus, input, plus);
    row.append(text, counter);
    itemsContainer.append(row);

    const sanitize = (value) => Math.max(0, Math.min(999, Math.floor(Number(value) || 0)));
    const change = (quantity) => {
      quantities[index] = sanitize(quantity);
      input.value = String(quantities[index]);
      render();
    };
    minus.addEventListener('click', () => change(quantities[index] - 1));
    plus.addEventListener('click', () => change(quantities[index] + 1));
    input.addEventListener('input', () => {
      quantities[index] = sanitize(input.value);
      render();
    });
    input.addEventListener('blur', () => { input.value = String(quantities[index]); });
  });

  function render() {
    selectedContainer.replaceChildren();
    let total = 0;
    services.forEach((service, index) => {
      const quantity = quantities[index];
      minusButtons[index].disabled = quantity === 0;
      plusButtons[index].disabled = quantity === 999;
      if (!quantity) return;
      const subtotal = service.price * quantity;
      total += subtotal;
      const line = document.createElement('p');
      line.className = 'estimate-line';
      const label = document.createElement('span');
      label.textContent = `${service.name} · ${quantity} ${service.unit}`;
      const value = document.createElement('span');
      value.textContent = currency(subtotal);
      line.append(label, value);
      selectedContainer.append(line);
    });
    if (!total) {
      const empty = document.createElement('p');
      empty.className = 'estimate-empty';
      empty.textContent = 'Пока ничего не выбрано';
      selectedContainer.append(empty);
    }
    totalNode.textContent = currency(total);
    if (compactTotal) compactTotal.textContent = currency(total);
    clearButton.disabled = total === 0;
    announcement.textContent = `Примерная сумма: ${currency(total)}`;
  }
  clearButton.addEventListener('click', () => {
    quantities.fill(0);
    inputs.forEach((input) => { input.value = '0'; });
    render();
  });
  render();
  app.hidden = false;
})();
