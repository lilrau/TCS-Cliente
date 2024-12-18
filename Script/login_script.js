import { API_BASE_URL } from "./config.js";

document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário

    const email = document.getElementById("email").value;
    const senha = document.getElementById("password").value;

    const requestBody = JSON.stringify({
        email: email,
        senha: senha
    });

    try {
        // Monta a URL completa usando a URL base e o endpoint
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: requestBody
        });

        if (response.ok) {
            const responseData = await response.json();

            // Verifica se existe o token na resposta
            if (responseData.token) {
                localStorage.setItem("authToken", responseData.token); // Armazena o token
                window.location.href = "./Pages/home_page.html"; // Redireciona para a página home
            } else {
                throw new Error("Resposta inesperada do servidor.");
            }
        } else if (response.status === 401) {
            const errorData = await response.json();
            showErrorBox(errorData.mensagem || "Erro desconhecido ao fazer login.");
        } else {
            showErrorBox("Erro ao processar o login. Tente novamente mais tarde.");
            console.error("Erro:", response.status, response.statusText);
        }
    } catch (error) {
        showErrorBox("Falha ao conectar ao servidor.");
        console.error("Erro:", error);
    }
});

// Função para exibir uma caixa de erro
function showErrorBox(message) {
    const errorBox = document.createElement("div");
    errorBox.className = "error-box";
    errorBox.textContent = message;

    document.body.appendChild(errorBox);

    // Remove a mensagem após 5 segundos
    setTimeout(() => {
        errorBox.remove();
    }, 5000);
}
