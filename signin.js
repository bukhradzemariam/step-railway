if (isLoggedIn()) {
  const rd = localStorage.getItem("redirectAfterLogin") || "index.html";
  localStorage.removeItem("redirectAfterLogin");
  window.location.href = rd;
}

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3500);
}

async function doSignIn() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) {
    toast("შეავსეთ ყველა ველი");
    return;
  }

  const btn = document.getElementById("signinBtn");
  btn.disabled = true;
  btn.textContent = "მუშავდება...";

  try {
    const data = await apiLogin(email, password);
    saveUser(data); // მომხმარებლის მონაცემების შენახვა localStorage-ში
    
    toast("წარმატებით შეხვედით!", true);
    
    const rd = localStorage.getItem("redirectAfterLogin") || "index.html";
    localStorage.removeItem("redirectAfterLogin");
    
    // პატარა დაყოვნება, რომ მომხმარებელმა ტოასტი დაინახოს
    setTimeout(() => {
        window.location.href = rd;
    }, 1500);

  } catch (err) {
    toast(err.message || "შეცდომა");
    btn.disabled = false;
    btn.textContent = "შესვლა";
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") doSignIn();
});
