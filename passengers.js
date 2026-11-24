const API = 'https://railway.stepprojects.ge';
const search = JSON.parse(localStorage.getItem('search'));
const selectedTrain = JSON.parse(localStorage.getItem('selectedTrain'));

let vagons = [];
let currentPassengerIndex = 0;
let selectedSeats = {};
let selectedVagon = null;
let selectedClass = null;


window.onload = function () {
  if (!search || !selectedTrain) {
    window.location.href = 'index.html';
    return;
  }
  buildPassengerForms();
  updateInvoice();
  loadVagons();
};


function buildPassengerForms() {
  const container = document.getElementById('passengersForm');
  container.innerHTML = '';

  for (let i = 0; i < search.ticketCount; i++) {
    container.innerHTML += `
      <div class="form-section" id="passengerSection${i}">
        <h2>მგზავრი ${i + 1}</h2>
        <div class="form-row">
          <div class="form-group">
            <label>სახელი</label>
            <input type="text" id="firstName${i}" placeholder="სახელი" />
          </div>
          <div class="form-group">
            <label>გვარი</label>
            <input type="text" id="lastName${i}" placeholder="გვარი" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>პირადი ნომერი</label>
            <input type="text" id="personalId${i}" placeholder="11 ციფრი" maxlength="11" />
          </div>
          <div class="form-group">
            <label>ადგილი</label>
            <div class="seat-display" id="seatDisplay${i}">
              <span id="seatText${i}">არჩეული არ არის</span>
              <button class="btn-seat" onclick="openModal(${i})">ადგილის არჩევა</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}


async function loadVagons() {
  try {
    const response = await fetch(`${API}/api/vagons`);
    const allVagons = await response.json();
    vagons = allVagons.filter(function (v) {
      return v.trainNumber === selectedTrain.number;
    });
  } catch (error) {
    console.error('ვაგონები ვერ ჩაიტვირთა', error);
  }
}


async function openModal(passengerIndex) {
  currentPassengerIndex = passengerIndex;
  document.getElementById('seatModal').style.display = 'flex';

  if (vagons.length === 0) {
    await loadVagons();
  }

  if (vagons.length === 0) {
    toast('ვაგონები ვერ ჩაიტვირთა, სცადეთ თავიდან');
    closeModal();
    return;
  }

  showStepClass();
}


function closeModal() {
  document.getElementById('seatModal').style.display = 'none';
  selectedVagon = null;
  selectedClass = null;
}


// ნაბიჯი 1 — კლასის არჩევა
function showStepClass() {
  document.getElementById('stepClass').style.display = 'block';
  document.getElementById('stepVagon').style.display = 'none';
  document.getElementById('stepSeats').style.display = 'none';
  document.getElementById('modalTitle').textContent = 'ადგილის არჩევა';

  const classIcons = {
    'ბიზნესი': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>',
    'I კლასი': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'II კლასი': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><line x1="9" y1="12" x2="15" y2="12"/></svg>'
  };

  // ვაგონების სახელის მიხედვით დაჯგუფება
  const classes = {};
  vagons.forEach(function (vagon) {
    const name = vagon.name || 'სხვა';
    if (!classes[name]) classes[name] = [];
    classes[name].push(vagon);
  });

  const container = document.getElementById('classButtons');
  container.innerHTML = '';

  Object.keys(classes).forEach(function (className) {
    const group = classes[className];
    const price = group[0].seats && group[0].seats[0] ? group[0].seats[0].price : 0;
    const icon = classIcons[className] || '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="10" rx="2"/><path d="M6 18v2"/><path d="M18 18v2"/><path d="M2 12h20"/></svg>';

    const btn = document.createElement('button');
    btn.className = 'btn-class';
    btn.innerHTML =
      '<span class="class-icon">' + icon + '</span>' +
      '<span class="class-name">' + className + '</span>' +
      '<span class="class-price">' + price + '₾-დან</span>';

    btn.onclick = function () {
      selectedClass = className;
      showStepVagon(className, classes[className]);
    };
    container.appendChild(btn);
  });
}


// ნაბიჯი 2 — ვაგონის არჩევა
function showStepVagon(className, vagonsInClass) {
  document.getElementById('stepClass').style.display = 'none';
  document.getElementById('stepVagon').style.display = 'block';
  document.getElementById('stepSeats').style.display = 'none';
  document.getElementById('stepVagonLabel').textContent = className + ' — აირჩიეთ ვაგონი';

  const container = document.getElementById('vagonButtons');
  container.innerHTML = '';

  vagonsInClass.forEach(function (vagon) {
    const freeSeats = vagon.seats
      ? vagon.seats.filter(function (s) { return !s.isOccupied; }).length
      : '?';

    const btn = document.createElement('button');
    btn.className = 'btn-vagon';
    btn.innerHTML =
      '<span class="vagon-num">ვაგ. ' + vagon.id + '</span>' +
      '<span class="vagon-name">' + vagon.name + '</span>' +
      '<span class="vagon-free">თავისუფალი: ' + freeSeats + '</span>';

    btn.onclick = function () {
      selectedVagon = vagon;
      showStepSeats(vagon);
    };
    container.appendChild(btn);
  });
}


function backToClass() {
  showStepClass();
}

function backToVagon() {
  const vagonsInClass = vagons.filter(function (v) { return v.name === selectedClass; });
  showStepVagon(selectedClass, vagonsInClass);
}


// ნაბიჯი 3 — ადგილების ჩვენება
async function showStepSeats(vagon) {
  document.getElementById('stepClass').style.display = 'none';
  document.getElementById('stepVagon').style.display = 'none';
  document.getElementById('stepSeats').style.display = 'block';
  document.getElementById('stepSeatsLabel').textContent = vagon.name + ' | ვაგ. ' + vagon.id;

  const grid = document.getElementById('seatsGrid');
  grid.innerHTML = '<p style="font-size:0.85rem;color:rgba(160,155,175,1);grid-column:1/-1;">იტვირთება...</p>';

  try {
    const response = await fetch(`${API}/api/getvagon/${vagon.id}`);
    const rawData = await response.json();
    const vagonData = Array.isArray(rawData) ? rawData[0] : rawData;

    if (!vagonData) {
      grid.innerHTML = '<p style="color:rgba(255,110,110,1);font-size:0.85rem;">ადგილების ჩატვირთვა ვერ მოხერხდა</p>';
      return;
    }

    const seats = vagonData.seats || vagonData.Seats || [];

    if (seats.length === 0) {
      grid.innerHTML = '<p style="color:rgba(255,110,110,1);font-size:0.85rem;">ადგილები ვერ მოიძებნა</p>';
      return;
    }

    grid.innerHTML = '';

    const takenByOthers = Object.entries(selectedSeats)
      .filter(function (entry) { return parseInt(entry[0]) !== currentPassengerIndex; })
      .map(function (entry) { return entry[1].seatId; });

    seats.sort(function (a, b) { return a.number.localeCompare(b.number); });

    seats.forEach(function (seat) {
      const isOccupied = seat.isOccupied;
      const isTaken = takenByOthers.includes(seat.seatId);
      const isSelected = selectedSeats[currentPassengerIndex] &&
        selectedSeats[currentPassengerIndex].seatId === seat.seatId;

      const btn = document.createElement('button');
      btn.className = 'seat-btn';
      btn.textContent = seat.number;

      if (isOccupied || isTaken) {
        btn.classList.add('occupied');
        btn.disabled = true;
      } else if (isSelected) {
        btn.classList.add('selected');
      }

      btn.onclick = function () {
        const resolvedVagon = vagon || { id: vagonData.id, name: vagonData.name };
        selectSeat(seat, resolvedVagon);
      };

      grid.appendChild(btn);
    });

  } catch (error) {
    console.error('ადგილები ვერ ჩაიტვირთა', error);
    grid.innerHTML = '<p style="color:rgba(255,110,110,1);font-size:0.85rem;">ადგილების ჩატვირთვა ვერ მოხერხდა</p>';
  }
}


function selectSeat(seat, vagon) {
  selectedSeats[currentPassengerIndex] = {
    seatId: seat.seatId,
    number: seat.number,
    price: seat.price,
    vagonId: vagon.id,
    vagonName: vagon.name
  };

  document.getElementById('seatText' + currentPassengerIndex).textContent =
    'ვაგონი: ' + vagon.name + ' | ადგილი: ' + seat.number + ' | ' + seat.price + '₾';

  updateInvoice();
  closeModal();
}


function updateInvoice() {
  document.getElementById('invoiceRoute').textContent = search.fromName + ' → ' + search.toName;
  document.getElementById('invoiceDate').textContent = search.date + ' (' + search.dayName + ')';

  const passDiv = document.getElementById('invoicePassengers');
  passDiv.innerHTML = '';
  let total = 0;

  for (let i = 0; i < search.ticketCount; i++) {
    const seat = selectedSeats[i];
    const price = seat ? seat.price : 0;
    total += price;

    passDiv.innerHTML += `
      <div class="invoice-row">
        <span>მგზავრი ${i + 1}</span>
        <span>${seat ? seat.number + ' (' + seat.vagonName + ')' : 'არჩეული არ არის'}</span>
        <span>${price}₾</span>
      </div>
    `;
  }

  document.getElementById('invoiceTotal').textContent = total + '₾';
}


function registerTickets() {
  // ავტორიზაციის შემოწმება
  var user = null;
  try { user = JSON.parse(localStorage.getItem('user')); } catch(e) {}
  if (!user) {
    localStorage.setItem('redirectAfterLogin', window.location.href);
    window.location.href = 'signin.html';
    return;
  }

  const email = document.getElementById('contactEmail').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();

  if (!email || !phone) {
    toast('შეავსეთ საკონტაქტო ინფორმაცია');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    toast('შეიყვანეთ სწორი იმეილი');
    return;
  }

  const passengers = [];

  for (let i = 0; i < search.ticketCount; i++) {
    const firstName = document.getElementById('firstName' + i).value.trim();
    const lastName = document.getElementById('lastName' + i).value.trim();
    const personalId = document.getElementById('personalId' + i).value.trim();
    const seat = selectedSeats[i];

    if (!firstName || !lastName || !personalId) {
      toast('მგზავრი ' + (i + 1) + ': შეავსეთ ყველა ველი');
      return;
    }

    if (personalId.length !== 11 || !/^\d+$/.test(personalId)) {
      toast('მგზავრი ' + (i + 1) + ': პირადი ნომერი უნდა იყოს ზუსტად 11 ციფრი');
      return;
    }

    if (!seat) {
      toast('მგზავრი ' + (i + 1) + ': აირჩიეთ ადგილი');
      return;
    }

    passengers.push({ firstName, lastName, personalId, seat });
  }

  localStorage.setItem('passengers', JSON.stringify(passengers));
  localStorage.setItem('contact', JSON.stringify({ email, phone }));
  window.location.href = 'payment.html';
}


function toast(msg) {
  const toastEl = document.getElementById('toast');
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(function () {
    toastEl.classList.remove('show');
  }, 3500);
}
