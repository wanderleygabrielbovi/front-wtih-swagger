function checkAuth() {
  const token = localStorage.getItem("authToken");
  const email = localStorage.getItem("userEmail");
  const expiration = localStorage.getItem("tokenExpiration");

  if (!token || !email || !expiration) {
    window.location.href = "index.html";
    return;
  }

  const expirationDate = new Date(expiration);
  if (expirationDate < new Date()) {
    logout();
    return;
  }

  const welcomeMessage = document.getElementById("welcomeMessage");
  const tokenInfo = document.getElementById("tokenInfo");

  welcomeMessage.textContent = `Seja bem-vindo(a), ${email}!`;
  tokenInfo.textContent = `Seu token expira em: ${formatDate(expirationDate)}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("tokenExpiration");
  window.location.href = "index.html";
}

document.getElementById("logoutButton").addEventListener("click", logout);

document.addEventListener("DOMContentLoaded", checkAuth);
