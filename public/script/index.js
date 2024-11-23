function getToken() {
    return localStorage.getItem("authToken");
}

// Função para mostrar o saldo na tela
async function getWallet() {
    const token = getToken();
    console.log(token);
    if (!token) {
        alert("Você precisa estar logado!");
        window.location.href = "/login"; // Redireciona para a página de login
        return;
    }

    const response = await fetch("http://localhost:3001/getWallet", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`, // Envia o token no cabeçalho
        },
    });

    if (response.ok) {
        const data = await response.text();
        document.getElementById("wallet").textContent = `Saldo da carteira: ${data}`;
    } else {
        document.getElementById("wallet").textContent = "Erro ao carregar o saldo.";
    }
}

// Chama a função para carregar o saldo assim que a página for carregada
window.onload = getWallet;