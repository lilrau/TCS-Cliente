import { API_BASE_URL } from "./config.js";

// Atualiza a função de fetchCategories para usar createCategoryElement
async function fetchCategories() {
    const mainBox = document.querySelector(".mainBox");
    const newCategorySection = document.querySelector(".new-category-section");

    mainBox.innerHTML = ""; // Limpa o conteúdo existente
    mainBox.appendChild(newCategorySection); // Reinsere a seção de nova categoria

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

            categories.forEach((category) => {
                const categoryElement = createCategoryElement(category);
                mainBox.appendChild(categoryElement);
            });
        } else if (response.status === 401) {
            handleUnauthorizedError();
        } else {
            mainBox.innerHTML += `<p class="error-message">Erro: ${response.status}</p>`;
        }
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        mainBox.innerHTML += `<p class="error-message">Erro ao conectar ao servidor.</p>`;
    }
}

// Adicionar botões de exclusão para cada categoria
function createCategoryElement(category) {
    const categoryElement = document.createElement("div");
    categoryElement.className = "category-item";
    categoryElement.innerHTML = `
        <h3>${category.nome}</h3>
        <p>ID: ${category.id}</p>
        <button class="edit-button" data-id="${category.id}">Editar</button>
        <button class="delete-button" data-id="${category.id}">Excluir</button>
    `;

    // Adicionar eventos aos botões
    const editButton = categoryElement.querySelector(".edit-button");
    editButton.addEventListener("click", () => openEditCategoryModal(category));

    const deleteButton = categoryElement.querySelector(".delete-button");
    deleteButton.addEventListener("click", () => deleteCategoryById(category.id));

    return categoryElement;
}


// Função para enviar uma nova categoria
async function addCategory(event) {
    event.preventDefault(); // Previne o comportamento padrão do formulário

    const categoryNameInput = document.querySelector("#categoryName");
    const categoryName = categoryNameInput.value.trim();

    if (!categoryName) {
        showErrorBox("O nome da categoria não pode estar vazio.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/categorias`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({ nome: categoryName }),
        });

        if (response.status === 201) {
            showSuccessBox("Categoria criada com sucesso.");
            categoryNameInput.value = ""; // Limpa o campo de entrada
            fetchCategories(); // Atualiza a lista de categorias
        } else if (response.status === 401) {
            handleUnauthorizedError();
        } else if (response.status === 400 || response.status === 403) {
            const errorData = await response.json();
            showErrorBox(errorData.mensagem);
        } else {
            showErrorBox(`Erro desconhecido: ${response.status}`);
        }
    } catch (error) {
        console.error("Erro ao adicionar categoria:", error);
        showErrorBox("Erro ao conectar ao servidor.");
    }
}

// Função para lidar com o erro 401
function handleUnauthorizedError() {
    showErrorBox("Sua sessão expirou. Por favor, faça login novamente.");
    setTimeout(() => {
        window.location.href = "/index.html"; // Redireciona para a página de login
    }, 3000); // Redireciona após 3 segundos
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

// Adiciona o evento ao formulário de nova categoria
document
    .querySelector("#newCategoryForm")
    .addEventListener("submit", addCategory);

// Chama a função para carregar as categorias ao carregar a página
document.addEventListener("DOMContentLoaded", fetchCategories);

// Função para deletar uma categoria por ID
async function deleteCategoryById(categoryId) {
    if (!confirm("Tem certeza de que deseja excluir esta categoria?")) {
        return; // Cancela a exclusão se o usuário não confirmar
    }

    try {
        const response = await fetch(`${API_BASE_URL}/categorias/${categoryId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
        });

        if (response.ok) {
            showSuccessBox("Categoria deletada com sucesso.");
            fetchCategories(); // Atualiza a lista de categorias
        } else if (response.status === 404) {
            const errorData = await response.json();
            showErrorBox(errorData.mensagem || "Categoria não encontrada.");
        } else if (response.status === 400 || response.status === 403) {
            const errorData = await response.json();
            showErrorBox(errorData.mensagem);
        } else if (response.status === 401) {
            handleUnauthorizedError();
        } else {
            showErrorBox(`Erro desconhecido: ${response.status}`);
        }
    } catch (error) {
        console.error("Erro ao deletar categoria:", error);
        showErrorBox("Erro ao conectar ao servidor.");
    }
}

function openEditCategoryModal(category) {
    const editModal = document.createElement("div");
    editModal.className = "edit-category-modal";

    editModal.innerHTML = `
        <h2>Editar Categoria</h2>
        <form id="editCategoryForm">
            <label for="editCategoryName">Nome da Categoria:</label>
            <input type="text" id="editCategoryName" name="categoryName" value="${category.nome}" required>
            <button type="submit">Salvar Alterações</button>
            <button type="button" id="closeModal">Cancelar</button>
        </form>
    `;

    document.body.appendChild(editModal);

    // Fechar modal
    document.querySelector("#closeModal").addEventListener("click", () => {
        editModal.remove();
    });

    // Enviar os dados de edição
    document.querySelector("#editCategoryForm").addEventListener("submit", (event) => {
        event.preventDefault();
        updateCategory(category.id);
    });
}

async function updateCategory(categoryId) {
    const categoryNameInput = document.querySelector("#editCategoryName");
    const categoryName = categoryNameInput.value.trim();

    if (!categoryName) {
        showErrorBox("O nome da categoria não pode estar vazio.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/categorias/${categoryId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({ nome: categoryName }),
        });

        if (response.ok) {
            showSuccessBox("Categoria atualizada com sucesso.");
            fetchCategories(); // Atualiza a lista de categorias
        } else {
            const errorData = await response.json();
            if (response.status === 404) {
                showErrorBox(errorData.mensagem || "Categoria não encontrada.");
            } else if (response.status === 400 || response.status === 403) {
                showErrorBox(errorData.mensagem);
            } else {
                showErrorBox(`Erro desconhecido: ${response.status}`);
            }
        }
    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        showErrorBox("Erro ao conectar ao servidor.");
    }

    // Fechar o modal após a atualização
    const editModal = document.querySelector(".edit-category-modal");
    if (editModal) {
        editModal.remove();
    }
}
