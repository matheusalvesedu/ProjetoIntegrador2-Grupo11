// Função para obter o token de autenticação
function getToken() {
    return localStorage.getItem("authToken");
}

// Função para mostrar o saldo na tela
async function getWallet() {
    const token = getToken(); // Obtem o token do localStorage
    if (!token) {
        alert("Você precisa estar logado!");
        window.location.href = "/login"; // Redireciona para a página de login
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/getWallet", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, // Adiciona o token ao cabeçalho da requisição
            },
        });

        if (response.ok) {
            const data = await response.text(); // Supondo que a API retorna o saldo como texto
            document.getElementById("wallet").textContent = data; // Atualiza o elemento com o saldo
        } else {
            document.getElementById("wallet").textContent = "Erro ao carregar o saldo."; // Exibe mensagem de erro
        }
    } catch (error) {
        console.error("Erro ao obter o saldo:", error);
        document.getElementById("wallet").textContent = "Erro ao carregar o saldo."; // Exibe mensagem de erro
    }
}

// Chama a função para carregar o saldo assim que a página for carregada
window.onload = getWallet;
