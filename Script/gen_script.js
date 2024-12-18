import { API_BASE_URL } from "./config.js";

// Função para tratar o logout
async function handleLogout() {
    try {
        // Envia a requisição POST para o endpoint de logout
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}` // Passa o token no cabeçalho
            }
        });

        // Verifica se a resposta é bem-sucedida
        if (response.ok) {
            localStorage.removeItem("authToken"); // Remove o token armazenado
            window.location.href = "../index.html"; // Redireciona para a página inicial
        } else {
            console.error("Erro ao fazer logout:", response.status, response.statusText);
            showErrorBox("Falha ao realizar logout. Tente novamente.");
        }
    } catch (error) {
        console.error("Erro de conexão ao fazer logout:", error);
        showErrorBox("Erro de conexão com o servidor.");
    }
}

// Adiciona o evento de clique ao botão de logout
document.querySelector(".logoutLink").addEventListener("click", (event) => {
    event.preventDefault(); // Impede o comportamento padrão do link
    handleLogout(); // Chama a função de logout
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
