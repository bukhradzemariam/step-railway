const API = "https://railway.stepprojects.ge";
const API_AUTH = "https://api.everrest.educata.dev";

let ticketCount = 1;

let stations = [];

// ნავბარში მომხმარებლის სახელის ჩვენება
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
      '<span class="nav-username">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M3 21a9 9 0 0 1 18 0"/></svg>' +
      name +
      "</span>" +
      '<button class="btn-nav btn-logout" onclick="logout()">გამოსვლა</button>';
  } else {
    el.innerHTML = '<a href="signin.html" class="btn-nav">შესვლა</a>';
  }
})();

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3500);
}

// სადგურების ჩატვირთვა API-დან და Select-ებში ჩასმა
async function loadStations() {
  try {
    const res = await fetch(API + "/api/stations");
    stations = await res.json();

    const from = document.getElementById("fromStation");
    const to = document.getElementById("toStation");

    stations.forEach((s) => {
      const o1 = document.createElement("option");
      o1.value = s.id;
      o1.textContent = s.name;
      from.appendChild(o1);

      const o2 = document.createElement("option");
      o2.value = s.id;
      o2.textContent = s.name;
      to.appendChild(o2);
    });
  } catch (e) {
    toast("სადგურების ჩატვირთვა ვერ მოხერხდა");
  }
}

function changeCount(delta) {
  ticketCount = Math.min(5, Math.max(1, ticketCount + delta));
  document.getElementById("countVal").textContent = ticketCount + " მგზავრი";
  document.getElementById("minusBtn").disabled = ticketCount <= 1;
  document.getElementById("plusBtn").disabled = ticketCount >= 5;
}

// სწრაფი არჩევანის ღილაკები — სადგურის ავტომატური შევსება
function quickPick(type, name) {
  const sel = document.getElementById(
    type === "from" ? "fromStation" : "toStation",
  );
  for (let i = 0; i < sel.options.length; i++) {
    if (sel.options[i].text === name) {
      sel.value = sel.options[i].value;
      break;
    }
  }
}

function quickDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  document.getElementById("travelDate").value = d.toISOString().split("T")[0];
}

// კვირის დღის სახელი ქართულად
function getGeorgianDay(dateStr) {
  const days = [
    "კვირა",
    "ორშაბათი",
    "სამშაბათი",
    "ოთხშაბათი",
    "ხუთშაბათი",
    "პარასკევი",
    "შაბათი",
  ];
  return days[new Date(dateStr).getDay()];
}

// მატარებლების ძებნა და trips.html-ზე გადასვლა
async function searchTrips() {
  const fromId = document.getElementById("fromStation").value;
  const toId = document.getElementById("toStation").value;
  const date = document.getElementById("travelDate").value;
  const fromName =
    document.getElementById("fromStation").selectedOptions[0].text;
  const toName = document.getElementById("toStation").selectedOptions[0].text;

  if (!fromId || !toId || !date) {
    toast("გთხოვთ შეავსოთ ყველა ველი");
    return;
  }
  if (fromId === toId) {
    toast("სადგურები არ უნდა ემთხვეოდეს");
    return;
  }

  try {
    const res = await fetch(
      API +
        "/api/getdeparture?from=" +
        encodeURIComponent(fromName) +
        "&to=" +
        encodeURIComponent(toName) +
        "&date=" +
        date,
    );
    if (!res.ok) throw new Error("სერვერმა დააბრუნა შეცდომა: " + res.status);

    const data = await res.json();
    const trips = data.trains || data;

    if (!trips || trips.length === 0) {
      toast("რეისი ვერ მოიძებნა");
      return;
    }

    // ძებნის შედეგების შენახვა localStorage-ში
    localStorage.setItem("trips", JSON.stringify(trips));
    localStorage.setItem(
      "search",
      JSON.stringify({
        fromId,
        toId,
        fromName,
        toName,
        date,
        dayName: getGeorgianDay(date),
        ticketCount,
      }),
    );

    window.location.href = "trips.html";
  } catch (e) {
    toast("შეცდომა ძებნისას: " + e.message);
  }
}


document.getElementById("travelDate").min = new Date()
  .toISOString()
  .split("T")[0];

loadStations();

document.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchTrips();
});