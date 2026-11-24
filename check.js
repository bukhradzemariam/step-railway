const API = "https://railway.stepprojects.ge";

// ნავბარი — მომხმარებლის ჩვენება
(function () {
  const user = getUser();
  const el = document.getElementById("navAuth");
  if (!el) return;
  if (user) {
    const info = user.user || user;
    const name =
      info.firstName ||
      info.username ||
      info.name ||
      info.email ||
      "მომხმარებელი";
    el.innerHTML =
      '<span class="nav-username"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M3 21a9 9 0 0 1 18 0"/></svg>' +
      name +
      "</span>" +
      '<button class="btn-nav btn-logout" onclick="logout()">გამოსვლა</button>';
  } else {
    el.innerHTML = '<a href="signin.html" class="btn-nav">შესვლა</a>';
  }
})();

// URLდან ბილეთის idის წამოღება (Qr სკანირებისთვის)
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const idFromUrl = params.get("id");
  if (idFromUrl) {
    document.getElementById("ticketId").value = idFromUrl;
    checkTicket();
  }

  document.getElementById("ticketId").addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkTicket();
  });
});

async function checkTicket() {
  const ticketId = document.getElementById("ticketId").value.trim();

  if (!ticketId) {
    toast("შეიყვანეთ ბილეთის ნომერი");
    return;
  }

  const resultSection = document.getElementById("resultSection");
  resultSection.style.display = "block";
  resultSection.innerHTML =
    '<p style="text-align:center;color:rgba(160,155,175,1);padding:20px;">იტვირთება...</p>';

  try {
    const response = await fetch(`${API}/api/tickets/checkstatus/${ticketId}`);
    if (!response.ok) throw new Error("not found");

    const ticket = await response.json();
    showTicket(ticket);
  } catch (error) {
    resultSection.innerHTML = `
      <div class="not-found">
        <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
          <circle cx='12' cy='12' r='10'/><line x1='15' y1='9' x2='9' y2='15'/><line x1='9' y1='9' x2='15' y2='15'/>
        </svg>
        ასეთი ბილეთი ვერ მოიძებნა. შეამოწმეთ ბილეთის ნომერი.
      </div>
    `;
  }
}

// ბილეთის ინფორმაციის გამოტანა
function showTicket(ticket) {
  const resultSection = document.getElementById("resultSection");

  const statusText = ticket.confirmed ? "დადასტურებული" : "განხილვაში";
  const statusClass = ticket.confirmed ? "confirmed" : "pending";

  // მგზავრების სია
  const passengersHTML = ticket.persons
    .map(
      (person) => `
    <div class="ticket-passenger-row">
      <span>${person.name} ${person.surname}</span>
      <span>პირ. ნომ: ${person.idNumber}</span>
      <span>ადგილი: ${person.seat.number}</span>
    </div>
  `,
    )
    .join("");

  resultSection.innerHTML = `
    <div class="ticket-result">
      <div class="ticket-header">
        <div>
          <div class="ticket-logo">
            <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
              <rect x='2' y='8' width='20' height='10' rx='2'/><path d='M6 18v2'/><path d='M18 18v2'/>
              <path d='M2 12h20'/><circle cx='6' cy='14' r='1'/><circle cx='18' cy='14' r='1'/>
              <path d='M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2'/>
            </svg>
            Step Railway
          </div>
          <div class="ticket-id-text">ბილეთი: <span>#${ticket.id}</span></div>
        </div>
        <div class="ticket-status ${statusClass}">${statusText}</div>
      </div>

      <div class="ticket-route">
        <div class="ticket-station">
          <div class="city">${ticket.train.from}</div>
          <div class="time">${ticket.train.departure}</div>
        </div>
        <div class="ticket-arrow">→</div>
        <div class="ticket-station">
          <div class="city">${ticket.train.to}</div>
          <div class="time">${ticket.train.arrive}</div>
        </div>
      </div>

      <div class="ticket-info-grid">
        <div class="ticket-info-item"><label>თარიღი</label><span>${ticket.date}</span></div>
        <div class="ticket-info-item"><label>მატარებელი</label><span>#${ticket.train.number}</span></div>
        <div class="ticket-info-item"><label>იმეილი</label><span>${ticket.email}</span></div>
        <div class="ticket-info-item"><label>ტელეფონი</label><span>${ticket.phone}</span></div>
        <div class="ticket-info-item"><label>სულ გადახდილი</label><span>${ticket.ticketPrice}₾</span></div>
      </div>

      <div class="ticket-passengers">
        <h4>მგზავრები</h4>
        ${passengersHTML}
      </div>

      <div class="ticket-actions">
        <button class="btn-print" onclick="window.print()">
          <svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
            <polyline points='6 9 6 2 18 2 18 9'/><path d='M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'/>
            <rect x='6' y='14' width='12' height='8'/>
          </svg>
          დაბეჭდვა
        </button>
        <button class="btn-cancel" onclick="cancelTicket('${ticket.id}')">ბილეთის გაუქმება</button>
      </div>

      <div style="margin-top:20px; text-align:center; padding-top:16px; border-top:1px solid rgba(255,255,255,0.07);">
        <p style="font-size:0.78rem;color:rgba(160,155,175,1);margin-bottom:10px;">QR კოდი</p>
        <div id="ticketQR" style="display:inline-block; padding:10px; background:white; border-radius:10px;"></div>
      </div>
    </div>
  `;

  // QR კოდის გენერირება — check.html id=. ლინკზე
  const base = window.location.href.replace(/check\.html.*$/, "");
  const checkUrl = base + "check.html?id=" + ticket.id;
  new QRCode(document.getElementById("ticketQR"), {
    text: checkUrl,
    width: 140,
    height: 140,
    colorDark: "#0f2a7a",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.L,
  });
}

// ბილეთის გაუქმება
async function cancelTicket(ticketId) {
  const confirmed = confirm("დარწმუნებული ხართ რომ გინდათ ბილეთის გაუქმება?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API}/api/tickets/cancel/${ticketId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("cancel failed");

    toast("ბილეთი წარმატებით გაუქმდა");
    document.getElementById("resultSection").innerHTML = `
      <div class="not-found">
        <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(22,163,74,1)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
          <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/><polyline points='22 4 12 14.01 9 11.01'/>
        </svg>
        ბილეთი წარმატებით გაუქმდა.
      </div>
    `;
  } catch (error) {
    toast("გაუქმებისას მოხდა შეცდომა");
  }
}

function toast(msg) {
  const toastEl = document.getElementById("toast");
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 3500);
}
