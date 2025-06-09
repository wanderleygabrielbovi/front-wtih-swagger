const API_BASE_URL =
  "https://umfgcloud-autenticacao-service-7e27ead80532.herokuapp.com";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const registerError = document.getElementById("registerError");
const loginError = document.getElementById("loginError");

function showError(element, message) {
  element.textContent = message;
  element.style.display = "block";
}

function clearError(element) {
  element.textContent = "";
  element.style.display = "none";
}

function validatePassword(password) {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 6;

  if (!isLongEnough) return "A senha deve ter pelo menos 6 caracteres";
  if (!hasUpperCase)
    return "A senha deve conter pelo menos uma letra maiúscula";
  if (!hasLowerCase)
    return "A senha deve conter pelo menos uma letra minúscula";
  if (!hasNumbers) return "A senha deve conter pelo menos um número";
  if (!hasSpecialChar)
    return "A senha deve conter pelo menos um caractere especial";

  return null;
}

async function handleApiResponse(response) {
  if (response.status === 204) {
    return {
      ok: true,
      data: "Operação realizada com sucesso",
      status: response.status,
    };
  }

  const data = await response.text();
  try {
    const parsedData = data ? JSON.parse(data) : null;
    return {
      ok: response.ok,
      data: parsedData,
      status: response.status,
      message:
        parsedData?.message || parsedData || "Operação realizada com sucesso",
    };
  } catch {
    return {
      ok: response.ok,
      data: data || "Operação realizada com sucesso",
      status: response.status,
      message: data || "Operação realizada com sucesso",
    };
  }
}

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError(registerError);

  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById(
    "registerConfirmPassword"
  ).value;

  if (!email || !password || !confirmPassword) {
    showError(registerError, "Por favor, preencha todos os campos!");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError(registerError, "Por favor, insira um email válido!");
    return;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    showError(registerError, passwordError);
    return;
  }

  if (password !== confirmPassword) {
    showError(registerError, "As senhas não coincidem!");
    return;
  }

  try {
    console.log("URL da API:", `${API_BASE_URL}/Autenticacao/registar`);
    console.log("Dados:", {
      email,
      senha: password,
      senhaConfirmada: confirmPassword,
    });

    const response = await fetch(`${API_BASE_URL}/Autenticacao/registar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: window.location.origin,
      },
      mode: "cors",
      credentials: "omit",
      body: JSON.stringify({
        email,
        senha: password,
        senhaConfirmada: confirmPassword,
      }),
    });

    console.log("Status da resposta:", response.status);
    console.log(
      "Headers da resposta:",
      Object.fromEntries(response.headers.entries())
    );

    const result = await handleApiResponse(response);

    if (result.ok || result.status === 204) {
      showError(
        registerError,
        "Cadastro realizado com sucesso! Faça login para continuar."
      );
      registerForm.reset();

      setTimeout(() => {
        document.body.className = "sign-in";
        clearError(registerError);
      }, 2000);
    } else {
      let errorMessage = "Erro ao realizar cadastro. ";
      switch (result.status) {
        case 400:
          errorMessage +=
            result.message || "Dados inválidos. Verifique as informações.";
          break;
        case 404:
          errorMessage += "Endpoint não encontrado. Verifique a URL da API.";
          break;
        case 409:
          errorMessage += "Este e-mail já está cadastrado.";
          break;
        default:
          errorMessage += result.message || "Tente novamente.";
      }
      showError(registerError, errorMessage);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    showError(
      registerError,
      "Erro ao conectar com o servidor. Verifique sua conexão e tente novamente."
    );
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError(loginError);

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showError(loginError, "Por favor, preencha todos os campos!");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError(loginError, "Por favor, insira um email válido!");
    return;
  }

  try {
    console.log(
      "Enviando requisição para:",
      `${API_BASE_URL}/Autenticacao/autenticar`
    );
    console.log("Dados:", {
      email,
      senha: password,
    });

    const response = await fetch(`${API_BASE_URL}/Autenticacao/autenticar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: window.location.origin,
      },
      mode: "cors",
      credentials: "omit",
      body: JSON.stringify({
        email,
        senha: password,
      }),
    });

    console.log("Status da resposta:", response.status);
    console.log(
      "Headers da resposta:",
      Object.fromEntries(response.headers.entries())
    );

    const result = await handleApiResponse(response);

    if (result.ok) {
      if (result.data && result.data.token) {
        localStorage.setItem("authToken", result.data.token);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("tokenExpiration", result.data.dataExpiracao);
        window.location.href = "welcome.html";
      } else {
        showError(
          loginError,
          "Resposta inválida do servidor. Tente novamente."
        );
      }
    } else {
      let errorMessage = "Erro ao fazer login. ";
      switch (result.status) {
        case 400:
          errorMessage +=
            result.message || "Dados inválidos. Verifique as informações.";
          break;
        case 401:
          errorMessage += "E-mail ou senha incorretos.";
          break;
        case 404:
          errorMessage += "Endpoint não encontrado. Verifique a URL da API.";
          break;
        default:
          errorMessage += result.message || "Tente novamente.";
      }
      showError(loginError, errorMessage);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    showError(
      loginError,
      "Erro ao conectar com o servidor. Verifique sua conexão e tente novamente."
    );
  }
});
