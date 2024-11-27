if (localStorage.getItem('authToken') === null) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = 'Você precisa estar logado';
    messageDiv.style.display = 'block';

    setTimeout(() => {
        window.location.href = '../pages/signIN.html';
    }, 3000); // Redireciona após 3 segundos
}

async function handle(event) {
    event.preventDefault();
    createEvent();
}
// Função que será chamada quando o formulário for enviado
async function createEvent(event) {
    const title = document.getElementById('title').value;
    if (title === "eu vou fazer um leilao") {
        window.location.href = 'https://youtu.be/rS2FDyOKR2g?si=fCGeLc8pEKvGy-HM&t=37';
        return;
    }
    const description = document.getElementById('description').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const Date = document.getElementById('Date').value;
    console.log(startDate, endDate);
    const token = localStorage.getItem('authToken');
    console.log(token);
    try {
        const h = new Headers();
        h.append('Content-Type', 'application/json');
        h.append('Authorization', `Bearer ${token}`);
        h.append('event_title', title);
        h.append('event_description', description);
        h.append('eventStartDate', startDate);
        h.append('eventFinalDate', endDate);
        h.append('eventDate', Date);
        
        console.log(h);
        const response = await fetch('http://localhost:3001/addEvent', {
            method: 'PUT',
            headers: h
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            window.location.href = '../pages/index.html';
        } else {
            const errorData = await response.json();
            alert(errorData.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao criar o evento. Por favor, tente novamente.');
    }
}
