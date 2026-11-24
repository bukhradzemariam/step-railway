
if (isLoggedIn()) { window.location.href = 'index.html'; }

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3500);
}


async function doSignUp() {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const age       = parseInt(document.getElementById('age').value.trim());
  const phone     = document.getElementById('phone').value.trim();
  const address   = document.getElementById('address').value.trim();
  const zipcode   = document.getElementById('zipcode').value.trim();
  const gender    = document.getElementById('gender').value;
  const email     = document.getElementById('email').value.trim();
  const password  = document.getElementById('password').value.trim();
  const confirm   = document.getElementById('confirmPassword').value.trim();

  if (!firstName || !lastName || !age || !phone || !address || !zipcode || !email || !password || !confirm) {
    toast('შეავსეთ ყველა ველი'); return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('შეიყვანეთ სწორი ელ. ფოსტა'); return; }
  if (isNaN(age) || age < 1 || age > 120)         { toast('შეიყვანეთ სწორი ასაკი'); return; }
  if (password.length < 8)                         { toast('პაროლი მინიმუმ 8 სიმბოლო უნდა იყოს'); return; }
  if (password !== confirm)                        { toast('პაროლები არ ემთხვევა'); return; }

  const btn = document.getElementById('signupBtn');
  btn.disabled    = true;
  btn.textContent = 'მუშავდება...';

  try {
    await apiRegister(firstName, lastName, age, email, password, phone, address, zipcode, gender);
    localStorage.setItem('pendingVerifyEmail', email);
    window.location.href = 'verify.html';
  } catch (err) {
    toast(err.message || 'შეცდომა');
    btn.disabled    = false;
    btn.textContent = 'რეგისტრაცია';
  }
}


document.addEventListener('keyup', e => {
  if (e.key === 'Enter') doSignUp();
});
