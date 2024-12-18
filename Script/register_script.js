import { API_BASE_URL } from "./config.js";

// Adiciona o evento de clique ao botão
document.querySelector(".login__button").addEventListener("click", () => {
    window.location.href = "../index.html"; 
});

// Função para enviar o formulário de registro
document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário

    const email = document.getElementById("email").value;
    const senha = document.getElementById("password").value;
    const nome = document.getElementById("name").value;

    const requestBody = JSON.stringify({
        email: email,
        senha: senha,
        nome: nome
    });

    try {
        // Monta a URL completa usando a URL base e o endpoint
        const response = await fetch(`${API_BASE_URL}/usuarios`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: requestBody
        });

        // Verifica se o servidor retornou uma resposta com corpo
        let responseData = null;
        if (response.status !== 204) { // 204 significa sem conteúdo
            responseData = await response.json().catch(() => null); // Tenta converter para JSON, se não der certo, retorna null
        }

        if (response.ok) {
            // Caso a resposta seja 201 (sucesso)
            showSuccessBox("Usuário cadastrado com sucesso!");
            window.location.href = "../index.html"; // Redireciona para a página de login
        } else if (response.status === 400 || response.status === 409) {
            // Verifica se a resposta tem um corpo com erro
            const errorMessage = responseData ? responseData.mensagem : "Erro desconhecido.";
            showErrorBox(errorMessage);
        } else {
            showErrorBox("Erro ao processar o registro. Tente novamente mais tarde.");
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

// Função para exibir uma caixa de sucesso
function showSuccessBox(message) {
    const successBox = document.createElement("div");
    successBox.className = "success-box";
    successBox.textContent = message;

    document.body.appendChild(successBox);

    // Remove a mensagem após 5 segundos
    setTimeout(() => {
        successBox.remove();
    }, 5000);
}
