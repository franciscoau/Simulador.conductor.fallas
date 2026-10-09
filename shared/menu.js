(() => {
  const vehicles = window.SIMCAR_VEHICLES;
  const grid = document.getElementById('vehicleGrid');
  const start = document.getElementById('startTraining');
  let selected;
  function select(vehicle) {
    selected = vehicle;
    grid.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.vehicle === vehicle.id)));
    document.getElementById('detailStatus').textContent = vehicle.status === 'ready' ? 'MÓDULO DISPONIBLE' : 'MÓDULO EN PREPARACIÓN';
    document.getElementById('detailName').textContent = vehicle.name;
    document.getElementById('detailDescription').textContent = vehicle.description;
    document.getElementById('detailNote').textContent = vehicle.note;
    document.getElementById('featureHeading').textContent = vehicle.status === 'ready' ? 'ESTE ENTRENAMIENTO INCLUYE' : 'FUNCIONALIDADES PREVISTAS';
    document.getElementById('detailFeatures').replaceChildren(...vehicle.features.map(text => {
      const li = document.createElement('li'); li.textContent = text; return li;
    }));
    start.disabled = vehicle.status !== 'ready' || !vehicle.entry;
    start.textContent = start.disabled ? 'ENTRENAMIENTO EN PREPARACIÓN' : 'INICIAR ENTRENAMIENTO ↗';
  }
  vehicles.forEach((vehicle, index) => {
    const button = document.createElement('button');
    button.className = 'vehicle-card'; button.dataset.vehicle = vehicle.id;
    button.type = 'button'; button.setAttribute('aria-pressed', 'false');
    // Strings come exclusively from the local vehicle catalog.
    button.innerHTML = `<div class="card-top"><span class="number">0${index + 1} /</span><span class="badge ${vehicle.status === 'ready' ? 'ready' : ''}">${vehicle.status === 'ready' ? 'DISPONIBLE' : 'EN PREPARACIÓN'}</span></div><h3>${vehicle.name}</h3><p>${vehicle.category}</p>`;
    button.addEventListener('click', () => select(vehicle)); grid.append(button);
  });
  start.addEventListener('click', () => {
    if (selected?.status === 'ready' && selected.entry) location.href = selected.entry;
  });
  select(vehicles[0]);
})();
