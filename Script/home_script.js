import { API_BASE_URL } from "./config.js";

// Função para buscar e exibir categorias
async function fetchCategories() {
    const categoriesList = document.querySelector(".categories-list");

    try {
        const response = await fetch(`${API_BASE_URL}/categorias`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
        });

        if (response.ok) {
            const categories = await response.json();
            displayCategories(categories); // Exibe as categorias
        } else if (response.status === 401) {
            handleUnauthorizedError();
        } else {
            showErrorBox(`Erro: ${response.status}`);
        }
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        showErrorBox("Erro ao conectar ao servidor.");
    }
}

// Exibe as categorias na página
function displayCategories(categories) {
    const categoriesList = document.querySelector(".categories-list");
    categoriesList.innerHTML = ""; // Limpa o conteúdo existente

    categories.forEach((category) => {
        const categoryElement = document.createElement("div");
        categoryElement.className = "category-item";
        categoryElement.innerHTML = `
            <h3>${category.nome}</h3>
            <button class="select-category-button" data-id="${category.id}">Ver Avisos</button>
        `;

        // Adiciona evento para selecionar a categoria
        const selectButton = categoryElement.querySelector(".select-category-button");
        selectButton.addEventListener("click", () => fetchAvisosByCategory(category.id));

        categoriesList.appendChild(categoryElement);
    });
}

// Função para buscar avisos por categoria
async function fetchAvisosByCategory(categoryId) {
    const avisosList = document.querySelector(".avisos-list");

    try {
        const response = await fetch(`${API_BASE_URL}/avisos/${categoryId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
        });

        if (response.ok) {
            const avisos = await response.json();
            displayAvisos(avisos); // Exibe os avisos
        } else if (response.status === 401) {
            handleUnauthorizedError();
        } else {
            showErrorBox(`Erro: ${response.status}`);
        }
    } catch (error) {
        console.error("Erro ao buscar avisos:", error);
        showErrorBox("Erro ao conectar ao servidor.");
    }
}

// Exibe os avisos na página
function displayAvisos(avisos) {
    const avisosList = document.querySelector(".avisos-list");
    avisosList.innerHTML = ""; // Limpa o conteúdo existente

    if (avisos.length === 0) {
        avisosList.innerHTML = `<p>Nenhum aviso encontrado para esta categoria.</p>`;
    } else {
        avisos.forEach((aviso) => {
            const avisoElement = document.createElement("div");
            avisoElement.className = "aviso-item";
            avisoElement.innerHTML = `
                <p>${aviso.descricao}</p>
            `;
            avisosList.appendChild(avisoElement);
        });
    }
}

// Função para lidar com o erro 401
function handleUnauthorizedError() {
    showErrorBox("Sua sessão expirou. Por favor, faça login novamente.");
    setTimeout(() => {
        window.location.href = "/index.html"; // Redireciona para a página de login
    }, 3000);
}

// Função para exibir mensagens de erro
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

// Função para exibir mensagens de sucesso
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

// Carrega as categorias ao carregar a página
document.addEventListener("DOMContentLoaded", fetchCategories);