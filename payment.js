const API = "https://railway.stepprojects.ge";

const search = JSON.parse(localStorage.getItem("search"));
const selectedTrain = JSON.parse(localStorage.getItem("selectedTrain"));
const passengers = JSON.parse(localStorage.getItem("passengers"));
const contact = JSON.parse(localStorage.getItem("contact"));

window.onload = function () {
  if (!search || !selectedTrain || !passengers || !contact) {
    window.location.href = "index.html";
    return;
  }
  buildInvoice();
};

function buildInvoice() {
  document.getElementById("invoiceRoute").textContent = search.fromName + " → " + search.toName;
  document.getElementById("invoiceDate").textContent = search.date + " (" + search.dayName + ")";

  const passDiv = document.getElementById("invoicePassengers");
  passDiv.innerHTML = "";
  let total = 0;

  passengers.forEach(function (passenger, index) {
    const price = passenger.seat.price;
    total += price;
    passDiv.innerHTML += `
      <div class="invoice-row">
        <span>მგზავრი ${index + 1} — ${passenger.firstName}</span>
        <span>${price}₾</span>
      </div>
    `;
  });

  document.getElementById("invoiceTotal").textContent = total + "₾";
}

function formatCardNumber(input) {
  let value = input.value.replace(/\D/g, "");
  value = value.match(/.{1,4}/g)?.join(" ") || value;
  input.value = value;
}

function formatExpiry(input) {
  let value = input.value.replace(/\D/g, "");
  if (value.length >= 2) {
    value = value.slice(0, 2) + "/" + value.slice(2);
  }
  input.value = value;
}

async function pay() {
  const cardNumber = document.getElementById("cardNumber").value.trim();
  const cardExpiry = document.getElementById("cardExpiry").value.trim();
  const cardCvc = document.getElementById("cardCvc").value.trim();
  const cardName = document.getElementById("cardName").value.trim();

  if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
    toast("შეავსეთ ბარათის ყველა ველი");
    return;
  }

  const cardDigits = cardNumber.replace(/\s/g, '');
  if (cardDigits.length !== 16 || !/^\d+$/.test(cardDigits)) {
    toast("ბარათის ნომერი უნდა იყოს 16 ციფრი");
    return;
  }

  const expiryParts = cardExpiry.split('/');
  if (expiryParts.length !== 2) {
    toast("შეიყვანეთ სწორი ვადა (MM/YY)");
    return;
  }
  const expMonth = parseInt(expiryParts[0]);
  const expYear = parseInt('20' + expiryParts[1]);
  const now = new Date();
  if (expMonth < 1 || expMonth > 12 || expYear < now.getFullYear() ||
    (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
    toast("ბარათის ვადა გასულია");
    return;
  }

  if (cardCvc.length !== 3 || !/^\d+$/.test(cardCvc)) {
    toast("CVC უნდა იყოს 3 ციფრი");
    return;
  }

  const payBtn = document.querySelector('.btn-register');
  payBtn.disabled = true;
  payBtn.textContent = 'მუშავდება...';

 
  const dateParts = search.date.split('-');
  const isoDate = new Date(
    parseInt(dateParts[0]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[2]),
    12, 0, 0
  ).toISOString();

  const people = passengers.map(function (passenger) {
    return {
      seatId: passenger.seat.seatId,
      name: passenger.firstName,
      surname: passenger.lastName,
      idNumber: passenger.personalId,
      status: "adult",
      payoutCompleted: true,
    };
  });

  const body = {
    trainId: selectedTrain.id,
    date: isoDate,
    email: contact.email,
    phoneNumber: contact.phone,
    people: people,
  };

  try {
    const response = await fetch(`${API}/api/tickets/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "text/plain",
      },
      body: JSON.stringify(body),
    });

    console.log("Status:", response.status);
    const responseText = await response.text();
    console.log("Response:", responseText);

    if (!response.ok) {
      throw new Error("სერვერმა დააბრუნა შეცდომა: " + response.status);
    }

    const ticketId = responseText.includes(' ')
  ? responseText.split(' ').pop().trim()
  : responseText.trim();

showSuccess({ id: ticketId });

localStorage.removeItem('passengers');
localStorage.removeItem('contact');

  } catch (error) {
    console.error(error);
    payBtn.disabled = false;
    payBtn.textContent = 'გადახდა';
    toast("გადახდისას მოხდა შეცდომა: " + error.message);
  }
}

function showSuccess(ticket) {
  document.getElementById("paymentSection").style.display = "none";
  document.getElementById("successSection").style.display = "flex";

  const ticketCard = document.getElementById("ticketCard");

  const passengersHTML = passengers.map(function (passenger) {
    return `
      <div class="ticket-passenger-row">
        <span>${passenger.firstName} ${passenger.lastName}</span>
        <span>ვაგ: ${passenger.seat.vagonName} | ადგ: ${passenger.seat.number}</span>
        <span>${passenger.seat.price}₾</span>
      </div>
    `;
  }).join("");

  ticketCard.innerHTML = `
    <div class="ticket-header">
      <div class="ticket-logo"><svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='8' width='20' height='10' rx='2'/><path d='M6 18v2'/><path d='M18 18v2'/><path d='M2 12h20'/><circle cx='6' cy='14' r='1'/><circle cx='18' cy='14' r='1'/><path d='M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2'/></svg> Step Railway</div>
      <div class="ticket-id">ბილეთი: <span>#${ticket.id || "N/A"}</span></div>
    </div>
    <div class="ticket-route">
      <div class="ticket-station">
        <div class="city">${search.fromName}</div>
        <div class="time">${selectedTrain.departure}</div>
      </div>
      <div class="ticket-arrow">→</div>
      <div class="ticket-station">
        <div class="city">${search.toName}</div>
        <div class="time">${selectedTrain.arrive}</div>
      </div>
    </div>
    <div class="ticket-info-grid">
      <div class="ticket-info-item">
        <label>თარიღი</label>
        <span>${search.date} (${search.dayName})</span>
      </div>
      <div class="ticket-info-item">
        <label>მატარებელი</label>
        <span>#${selectedTrain.number}</span>
      </div>
      <div class="ticket-info-item">
        <label>იმეილი</label>
        <span>${contact.email}</span>
      </div>
      <div class="ticket-info-item">
        <label>ტელეფონი</label>
        <span>${contact.phone}</span>
      </div>
    </div>
    <div class="ticket-passengers">
      <h4>მგზავრები</h4>
      ${passengersHTML}
    </div>
  `;


  const qrContainer = document.getElementById('qrCode');
  qrContainer.innerHTML = '';
  const base = window.location.href.replace(/payment\.html.*$/, '');
  const qrUrl = base + 'check.html?id=' + ticket.id;
  new QRCode(qrContainer, {
    text: qrUrl,
    width: 180,
    height: 180,
    colorDark: '#0f2a7a',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.L
  });
}

function toast(msg) {
  const toastEl = document.getElementById("toast");
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(function () {
    toastEl.classList.remove("show");
  }, 3500);
}
