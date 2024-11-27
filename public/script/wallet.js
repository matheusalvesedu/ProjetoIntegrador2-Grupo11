if (localStorage.getItem('authToken') === null) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = 'Você precisa estar logado';
    messageDiv.style.display = 'block';

    // Redireciona após um tempo para que o usuário veja a mensagem
    setTimeout(() => {
        window.location.href = '../pages/signIN.html';
    }, 3000); // Redireciona após 3 segundos
}

function getToken() {
    return localStorage.getItem("authToken"); // Supondo que o token é armazenado no localStorage
}

// Função para buscar o saldo da carteira
async function getWallet() {
    const token = getToken();
    if (!token) {
        alert("Você precisa estar logado!");
        window.location.href = "../pages/signIn.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/getWallet", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
            const saldo = await response.text();
            document.getElementById("wallet").textContent = saldo;
        } else {
            document.getElementById("wallet").textContent = "R$ 0.00";
        }
    } catch (error) {
        console.error(error);
        document.getElementById("wallet").textContent = "Erro ao carregar.";
    }
}

function updateWithdrawFields() {
    const method = document.getElementById('withdrawMethod').value;
    const amountBox = document.getElementById('amountBox');


    // Referências aos contêineres dos campos
    const pixFields = document.getElementById('pixFields');
    const bankFields = document.getElementById('bankFields');
    const amountField = document.getElementById('amountField');
    // Esconde todos os campos por padrão
    [pixFields, bankFields].forEach(field => field.classList.add('d-none'));

    // Exibe os campos com base no método selecionado

    amountField.classList.remove('d-none');

    if (method === 'pix') {
        pixFields.classList.remove('d-none');
        amountBox.style.display = "block";

    } else if (method === 'bank') {
        bankFields.classList.remove('d-none');
    }

    else {
        amountField.classList.add('d-none');
    }

}

function showMessage(messageContent) {
    const messageBox = document.getElementById('messageBox');
    const message = document.getElementById('message');

    if (!messageBox || !message) {
        console.error("Elementos de mensagem não encontrados.");
        return;
    }

    // Exibe a mensagem
    message.textContent = messageContent;
    messageBox.style.display = "block";
}

function validateAmount(amount) {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        showMessage('O valor deve ser um número maior que zero.');
        return false;
    }
    return true;
}

function validatePixFields() {
    const pixKey = document.getElementById('pixKey').value;
    if (!pixKey) {
        showMessage('A chave PIX é obrigatória.');
        return false;
    }
    return true;
}

function validateBankFields() {
    const bank = document.getElementById('bank').value;
    const agency = document.getElementById('agency').value;
    const account = document.getElementById('account').value;

    if (!bank) {
        showMessage('O banco é obrigatório.');
        return false;
    }
    if (!agency) {
        showMessage('A agência é obrigatória.');
        return false;
    }
    if (!account) {
        showMessage('A conta é obrigatória.');
        return false;
    }
    return true;
}

async function withdrawHandle(event) {
    event.preventDefault();

    const token = localStorage.getItem('authToken');
    const method = document.getElementById('withdrawMethod').value;
    const amount = document.getElementById('amount').value.trim();

    // Validações gerais
    if (!validateAmount(amount)) return;
    if (method === 'pix' && !validatePixFields()) return;
    if (method === 'bank' && !validateBankFields()) return;

    try {
        // Configura os cabeçalhos com email e senha
        const reqtHeaders = new Headers();
        reqtHeaders.append("Authorization", `Bearer ${token}`);
        reqtHeaders.append("saque", amount);
        reqtHeaders.append("transactionType", 'WITHDRAW');

        // Faz a requisição para o backend
        const response = await fetch("http://localhost:3001/withdrawFunds", {
            method: "POST",
            headers: reqtHeaders,
        });

        if (response.ok) {
            const data = await response.json();
            showMessage(data.message); // Exibe a mensagem de sucesso (opcional)
        } else if (response.status === 400) {
            const data = await response.json();
            showMessage(data.message);
        } else {
            showMessage("Erro interno no servidor. Tente novamente mais tarde.");
        }
    } catch (error) {
        console.error("Erro na autenticação:", error);
        showMessage("Erro de conexão. Verifique sua internet.");
    }

}


async function handleAddFunds(event) {
    event.preventDefault();

    const amount = document.getElementById("fundsAmount").value;
    console.log(amount);

    if (!isNaN(amount) && amount > 0) {
        // Simula a adição de créditos (você pode fazer uma chamada para o backend aqui)

        try {
            const h = new Headers();
            h.append('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
            h.append('funds', amount);
            h.append('transactionType', 'DEPOSIT');
            const response = await fetch('http://localhost:3001/addFunds', {
                method: 'POST',
                headers: h
            });
            if (response.ok) {
                const data = await response.json();
                alert(data.message);

            }

            else {
                const errorData = await response.json();
                alert(errorData.message);
            }

            const modal = bootstrap.Modal.getInstance(document.getElementById("addFundsModal"));
            modal.hide();
            window.location.reload();
        }
        catch (error) {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao adicionar fundos. Por favor, tente novamente.');
        }
        // Limpa o campo de entrada
        fundsInput.value = "";


    } else {
        alert("Digite um valor válido!");
    }
}

async function renderDeposit() {
    try {
        const h = new Headers();
        h.append('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
        h.append('transactionType', 'DEPOSIT');

        console.log(h);

        const response = await fetch('http://localhost:3001/getTransactions', {
            method: 'GET',
            headers: h,
        });
        
        console.log("Resposta de histórico de créditos:", response.json);

        const depositData = await response.json();

        // Selecionando o elemento da lista
        const historyList = document.getElementById('creditPurchaseHistoryList');

        // Limpando a lista antes de adicionar os itens
        historyList.innerHTML = '';

        // Iterando pelos dados recebidos
        depositData.forEach(deposit => {
            // Criando um elemento de lista
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');

            // Criando elementos para exibição detalhada
            const amountElement = document.createElement('strong');
            amountElement.textContent = `💰 Valor do Depósito: R$${deposit.AMOUNT.toFixed(2)}`;
            amountElement.style.color = '#28a745';

            const dateElement = document.createElement('span');
            const transactionDate = new Date(deposit.TRANSACTION_DATE).toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short'
            });
            dateElement.textContent = `📅 Data: ${transactionDate}`;
            dateElement.style.display = 'block';
            dateElement.style.marginTop = '5px';
            dateElement.style.color = '#6c757d';

            // Adicionando os elementos ao listItem
            listItem.appendChild(amountElement);
            listItem.appendChild(dateElement);

            // Adicionando o item à lista
            historyList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Erro ao carregar os dados do histórico:', error);
    }
}

async function renderBets() {
    try {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${localStorage.getItem('authToken')}`);

        const response = await fetch('http://localhost:3001/getBets', {
            method: 'GET',
            headers: headers,
        });


        if (!response.ok) {
            throw new Error('Erro ao buscar dados das apostas.');
        }

        const betData = await response.json();

        // Selecionando o elemento da lista
        const historyList = document.getElementById('betHistoryList');

        // Limpando a lista antes de adicionar os itens
        historyList.innerHTML = '';

        // Iterando pelos dados recebidos
        betData.forEach(bet => {
            // Criando um elemento de lista
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

            // Criando o conteúdo a ser exibido
            const betInfo = `
                <div>
                    <strong>Valor da aposta:</strong> R$${bet.BET_VALUE.toFixed(2)}<br>
                    <strong>Opção:</strong>${bet.BET_OPTION.charAt(0).toUpperCase() + bet.BET_OPTION.slice(1).toLowerCase()}<br>
                </div>
            `;

            // Calculando e exibindo os ganhos, se aplicável
            const gainInfo = bet.BET_STATUS === 'GANHOU' && bet.USER_PROPORTION
                ? `<span class="badge bg-success">Ganhou R$${(bet.BET_VALUE * bet.USER_PROPORTION).toFixed(2)}</span>`
                : `<span class="badge bg-secondary">${bet.BET_STATUS || 'Pendente'}</span>`;

            // Adicionando os conteúdos ao item da lista
            listItem.innerHTML = `${betInfo} ${gainInfo}`;

            // Adicionando o item à lista
            historyList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Erro ao renderizar apostas:', error);
        alert('Não foi possível carregar o histórico de apostas.');
    }
}

window.onload = () => {
    renderDeposit();
    renderBets();
    getWallet();

};
