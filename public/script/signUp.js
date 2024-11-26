async function performSignUp(event) {
    event.preventDefault(); // Evita o recarregamento da página ao enviar o formulário

    const email = document.getElementById("fieldEmail").value.trim();
    const password = document.getElementById("fieldPassword").value.trim();
    const name = document.getElementById("fieldName").value.trim();
    const birthDate = document.getElementById("fieldBirthDate").value.trim();
    
    if (!isValid(email, password)) {
        return;
    }

    try {
        // Configura os cabeçalhos com email e senha
        const reqtHeaders = new Headers();
        reqtHeaders.append("Content-Type", "application/json");
        reqtHeaders.append("email", email);
        reqtHeaders.append("password", password);
        reqtHeaders.append("complete_name", name);
        reqtHeaders.append("birthday_date", birthDate);
        // Faz a requisição para o backend
        const response = await fetch("http://localhost:3001/signup", {
            method: "PUT",
            headers: reqtHeaders,
        });

        if (response.ok) {
            const data = await response.json();
            showMessage(data.message);
        } else if (response.status === 400) {
            const data = await response.json();
            showMessage(data.message);
        } else {
            showMessage("Erro interno no servidor. Tente novamente mais tarde.");
        }
    } catch (error) {
        console.error("Erro no cadastro:", error);
        showMessage("Erro de conexão. Verifique sua internet.");
    }
}

function isValid(email, password) {
    if (!email) {
        showMessage("O campo de email é obrigatório.");
        return false;
    }
    if (!password) {
        showMessage("O campo de senha é obrigatório.");
        return false;
    }
    cleanError();
    return true;
}

function showMessage(messageContent) {
    const messageBox = document.getElementById("messageBox");
    const message = document.getElementById("message");

    if (!messageBox || !message) {
        console.error("Elementos de mensagem não encontrados.");
        return;
    }

    message.textContent = messageContent;
    messageBox.style.display = "block";
}


function cleanError() {
    const messageBox = document.getElementById("messageBox");
    if (messageBox) {
        messageBox.style.display = "none";
        messageBox.style.backgroundColor = "red";
    }
}
