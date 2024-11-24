

// Função que será chamada quando o formulário for enviado
async function createEvent(event) {
    event.preventDefault(); // Evita o recarregamento da página ao enviar o formulário

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    try {
        const h = new Headers();
        h.append('Content-Type', 'application/json');
        h.append('Authorization', 'Bearer ' + localStorage.getItem('authToken'));
        h.append('title', title);
        h.append('description', description);
        h.append('startDate', startDate);
        h.append('endDate', endDate);

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