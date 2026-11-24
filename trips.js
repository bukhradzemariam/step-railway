
const trips  = JSON.parse(localStorage.getItem('trips'));
const search = JSON.parse(localStorage.getItem('search'));

const container = document.getElementById('tripsContainer');
const info      = document.getElementById('searchInfo');

// ნავბარი — მომხმარებლის ჩვენება
(function () {
  const user = getUser();
  const el = document.getElementById('navAuth');
  if (!el) return;
  if (user) {
    const inf  = user.user || user;
    const name = inf.firstName || inf.username || inf.name || inf.email || 'მომხმარებელი';
    el.innerHTML =
      '<span class="nav-username"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M3 21a9 9 0 0 1 18 0"/></svg>' + name + '</span>' +
      '<button class="btn-nav btn-logout" onclick="logout()">გამოსვლა</button>';
  } else {
    el.innerHTML = '<a href="signin.html" class="btn-nav">შესვლა</a>';
  }
})();

// თუ მონაცემები არ არის .......შეტყობინება
if (!trips || !search) {
  container.innerHTML = '<p style="text-align:center;color:rgba(160,155,175,1);padding:40px;">მონაცემები ვერ მოიძებნა</p>';
} else {
  showSearchInfo();
  showTrips();
}

// ძებნის შეჯამება — საიდან/სად  თარიღი, მგზავრები
function showSearchInfo() {
  info.innerHTML = `
    <div>
      <h2>${search.fromName} → ${search.toName}</h2>
      <p>${search.date} (${search.dayName})</p>
    </div>
    <p>მგზავრები: ${search.ticketCount}</p>
  `;
}

// API-ის პასუხიდან ყველა მატარებლის ამოღება
function getAllTrains() {
  const allTrains = [];
  trips.forEach(item => {
    if (item.trains && Array.isArray(item.trains)) {
      item.trains.forEach(t => allTrains.push(t));
    } else if (item.id !== undefined) {
      allTrains.push(item);
    }
  });
  return allTrains;
}


function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3500);
}

// რეისების ბარათების ჩვენება
function showTrips() {
  const allTrains = getAllTrains();

  if (!allTrains.length) {
    container.innerHTML = '<p style="text-align:center;color:rgba(160,155,175,1);padding:40px;">რეისი ვერ მოიძებნა</p>';
    return;
  }

  container.innerHTML = '';

  allTrains.forEach((train, index) => {
    const price      = train.price || 25;
    const totalPrice = price * search.ticketCount;

    const card = document.createElement('div');
    card.className = 'trip-card';
    card.dataset.index = index;

    card.innerHTML = `
      <div class="trip-left">
        <h3>${search.fromName} → ${search.toName}</h3>
        <div class="trip-time">${train.departure} → ${train.arrive}</div>
        <div class="trip-arrive">მატარებელი #${train.number}</div>
        <div class="trip-price">სულ: ${totalPrice}₾ (${search.ticketCount} მგზავრი)</div>
      </div>
      <div>
        <button class="book-btn">დაჯავშნა</button>
      </div>
    `;

    
    card.querySelector('.book-btn').addEventListener('click', () => {
      localStorage.setItem('selectedTrain', JSON.stringify(train));
      window.location.href = 'passengers.html';
    });

    container.appendChild(card);
  });
}
