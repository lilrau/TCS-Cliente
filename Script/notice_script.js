import { API_BASE_URL } from "./config.js";

// Função para buscar e exibir categorias
async function fetchCategories() {
    const mainBox = document.querySelector(".mainBox");
    const newNoticeSection = document.querySelector(".new-notice-section");

    mainBox.innerHTML = ""; // Limpa o conteúdo existente
    mainBox.appendChild(newNoticeSection); // Reinsere a seção de novo aviso

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
            displayCategories(categories); // Exibe as categorias para seleção
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

// Função para buscar e exibir categorias
async function fetchCategoriesSelection() {
    const categorySelect = document.querySelector("#noticeCategory");

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
            populateCategorySelect(categories); // Preenche o select com as categorias
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

// Exibe as categorias para seleção
function displayCategories(categories) {
    const mainBox = document.querySelector(".mainBox");

    const categoryList = document.createElement("div");
    categoryList.className = "category-list";

    categories.forEach((category) => {
        const categoryElement = document.createElement("div");
        categoryElement.className = "category-item";
        categoryElement.innerHTML = `
            <h3>${category.nome}</h3>
            <button class="select-category-button" data-id="${category.id}">Selecionar</button>
        `;

        // Adiciona evento para selecionar a categoria
        const selectButton = categoryElement.querySelector(".select-category-button");
        selectButton.addEventListener("click", () => fetchAvisosByCategory(category.id));

        categoryList.appendChild(categoryElement);
    });

    mainBox.appendChild(categoryList);
}

// Função para buscar avisos por categoria
async function fetchAvisosByCategory(categoryId) {
    const mainBox = document.querySelector(".mainBox");
    const newNoticeSection = document.querySelector(".new-notice-section");

    mainBox.innerHTML = ""; // Limpa o conteúdo existente
    mainBox.appendChild(newNoticeSection); // Reinsere a seção de novo aviso

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

// Exibe os avisos retornados
function displayAvisos(avisos) {
    const mainBox = document.querySelector(".mainBox");

    const avisosList = document.createElement("div");
    avisosList.className = "avisos-list";

    if (avisos.length === 0) {
        avisosList.innerHTML = `<p>Nenhum aviso encontrado para esta categoria.</p>`;
    } else {
        avisos.forEach((aviso) => {
            const avisoElement = document.createElement("div");
            avisoElement.className = "aviso-item";
            avisoElement.innerHTML = `
                <p>${aviso.descricao}</p>
                <button class="edit-aviso-button" data-id="${aviso.id}">Editar</button>
                <button class="delete-aviso-button" data-id="${aviso.id}">Deletar</button>
            `;

            // Adiciona eventos aos botões
            const editButton = avisoElement.querySelector(".edit-aviso-button");
            editButton.addEventListener("click", () => openEditAvisoModal(aviso));

            const deleteButton = avisoElement.querySelector(".delete-aviso-button");
            deleteButton.addEventListener("click", () => deleteAvisoById(aviso.id));

            avisosList.appendChild(avisoElement);
        });
    }

    mainBox.appendChild(avisosList);
}

// Função para abrir o modal de edição de aviso
function openEditAvisoModal(aviso) {
    const editModal = document.createElement("div");
    editModal.className = "edit-aviso-modal";

    editModal.innerHTML = `
        <h2>Editar Aviso</h2>
        <form id="editAvisoForm">
            <label for="editAvisoDescription">Descrição do Aviso:</label>
            <textarea id="editAvisoDescription" name="description" required>${aviso.descricao}</textarea>
            <button type="submit">Salvar Alterações</button>
            <button type="button" id="closeEditModal">Cancelar</button>
        </form>
    `;

    document.body.appendChild(editModal);

    // Fechar modal
    document.querySelector("#closeEditModal").addEventListener("click", () => {
        editModal.remove();
    });

    // Enviar os dados de edição
    document.querySelector("#editAvisoForm").addEventListener("submit", (event) => {
        event.preventDefault();
        updateAviso(aviso.id);
    });
}

// Função para atualizar um aviso
async function updateAviso(avisoId) {
    const descriptionInput = document.querySelector("#editAvisoDescription");
    const description = descriptionInput.value.trim();

    if (!description) {
        showErrorBox("A descrição do aviso não pode estar vazia.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/avisos/${avisoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({
                descricao: description,
            }),
        });

        if (response.ok) {
            showSuccessBox("Aviso atualizado com sucesso.");
            const categoryId = document.querySelector("#noticeCategory").value;
            fetchAvisosByCategory(categoryId); // Atualiza a lista de avisos
        } else {
            const errorData = await response.json();
            if (response.status === 404) {
                showErrorBox(errorData.mensagem || "Aviso não encontrado.");
            } else if (response.status === 400 || response.status === 403) {
                showErrorBox(errorData.mensagem);
            } else {
                showErrorBox(`Erro desconhecido: ${response.status}`);
            }
        }
    } catch (error) {
        console.error("Erro ao atualizar aviso:", error);
        showErrorBox("Erro ao conectar ao servidor.");
    }

    // Fechar o modal após a atualização
    const editModal = document.querySelector(".edit-aviso-modal");
    if (editModal) {
        editModal.remove();
    }
}

// Função para deletar um aviso por ID
async function deleteAvisoById(avisoId) {
    if (!confirm("Tem certeza de que deseja excluir este aviso?")) {
        return; // Cancela a exclusão se o usuário não confirmar
    }

    try {
        const response = await fetch(`${API_BASE_URL}/avisos/${avisoId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
        });

        if (response.ok) {
            showSuccessBox("Aviso deletado com sucesso.");
            const categoryId = document.querySelector("#noticeCategory").value;
            fetchAvisosByCategory(categoryId); // Atualiza a lista de avisos
        } else if (response.status === 404) {
            const errorData = await response.json();
            showErrorBox(errorData.mensagem || "Aviso não encontrado.");
        } else if (response.status === 400 || response.status === 403) {
            const errorData = await response.json();
            showErrorBox(errorData.mensagem);
        } else if (response.status === 401) {
            handleUnauthorizedError();
        } else {
            showErrorBox(`Erro desconhecido: ${response.status}`);
        }
    } catch (error) {
        console.error("Erro ao deletar aviso:", error);
        showErrorBox("Erro ao conectar ao servidor.");
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

// Preenche o select de categorias
function populateCategorySelect(categories) {
    const categorySelect = document.querySelector("#noticeCategory");
    categorySelect.innerHTML = ""; // Limpa as opções existentes

    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id; // Valor enviado no POST
        option.textContent = category.nome; // Texto exibido no select
        categorySelect.appendChild(option);
    });
}

// Função para enviar um novo aviso
async function addNotice(event) {
    event.preventDefault(); // Previne o comportamento padrão do formulário

    const categoryId = document.querySelector("#noticeCategory").value;
    const noticeDescription = document.querySelector("#noticeName").value.trim();

    if (!noticeDescription) {
        showErrorBox("A descrição do aviso não pode estar vazia.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/avisos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({
                idCategoria: parseInt(categoryId), // Converte para número
                descricao: noticeDescription,
            }),
        });

        if (response.status === 201) {
            showSuccessBox("Aviso criado com sucesso.");
            document.querySelector("#noticeName").value = ""; // Limpa o campo de descrição
            // Removemos a chamada para fetchAvisosByCategory(categoryId);
        } else if (response.status === 401) {
            handleUnauthorizedError();
        } else if (response.status === 400 || response.status === 403) {
            const errorData = await response.json();
            showErrorBox(errorData.mensagem);
        } else {
            showErrorBox(`Erro desconhecido: ${response.status}`);
        }
    } catch (error) {
        console.error("Erro ao adicionar aviso:", error);
        showErrorBox("Erro ao conectar ao servidor.");
    }
}

// Adiciona o evento ao formulário de novo aviso
document.querySelector("#newNoticeForm").addEventListener("submit", addNotice);

// Carrega as categorias ao carregar a página
document.addEventListener("DOMContentLoaded", fetchCategories);
document.addEventListener("DOMContentLoaded", fetchCategoriesSelection);