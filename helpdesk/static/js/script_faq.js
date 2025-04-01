async function sendFeedback(faqId, feedbackType) {
    const response = await fetch(`/faq_list/${faqId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: `feedback_type=${feedbackType}`
    });
    const data = await response.json();
    if (data.status === 'success') {
        const usefulCount = document.getElementById(`useful-count-${faqId}`);
        const notUsefulCount = document.getElementById(`not-useful-count-${faqId}`);
        usefulCount.textContent = data.useful_count;
        notUsefulCount.textContent = data.not_useful_count;
    } else {
        alert('Erro ao enviar feedback.');
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(
            cookie.substring(name.length + 1)
          );
          break;
        }
      }
    }
    return cookieValue;
  }









function deleteFAQ(faqId) {
  if (confirm("Tem certeza que deseja excluir esta FAQ?")) {
      fetch(`/faq_list/delete/${faqId}/`, {
          method: 'DELETE',
          headers: {
              'X-CSRFToken': getCookie('csrftoken'), // Função para obter o token CSRF
          },
      })
          .then(response => response.json())
          .then(data => {
              alert(data.message);
              location.reload(); // Recarrega a página para refletir a exclusão
          })
          .catch(error => console.error('Erro ao excluir:', error));
  }
}


