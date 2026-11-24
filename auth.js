const API_BASE = "https://api.everrest.educata.dev";

function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
}

function isLoggedIn() { 
  return !!getUser();
}

function logout() {
  const user = getUser();
  if (user && user.access_token) {
    fetch(API_BASE + "/auth/sign_out", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + user.access_token,
      },
    }).catch(() => {});
  }
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

// რეგისტრაცია  ახალი მომხმარებლის შექმნა
async function apiRegister(
  firstName,
  lastName,
  age,
  email,
  password,
  phone,
  address,
  zipcode,
  gender,
) {
  const formattedPhone = phone.startsWith("+")
    ? phone
    : "+995" + phone.replace(/^0/, "");

  const res = await fetch(API_BASE + "/auth/sign_up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName,
      lastName,
      age,
      email,
      password,
      phone: formattedPhone,
      address,
      zipcode,
      avatar: "https://i.pravatar.cc/150?u=" + email,
      gender,
    }),
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.message ||
        (data.errorKeys
          ? data.errorKeys.join(", ")
          : "რეგისტრაცია ვერ მოხერხდა"),
    );
  return data;
}

// ავტორიზაცია — შესვლა და მომხმარებლის შენახვა
async function apiLogin(email, password) {
  const res = await fetch(API_BASE + "/auth/sign_in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.message ||
        (data.errorKeys
          ? data.errorKeys.join(", ")
          : "ავტორიზაცია ვერ მოხერხდა"),
    );
  saveUser(data);
  return data;
}
