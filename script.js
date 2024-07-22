document.getElementById('summarize_btn').addEventListener('click', () => {
    const chapterText = document.getElementById('chapter_text').value;
    const ratio = document.getElementById('ratio').value;

    fetch('/summarize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `chapter_text=${encodeURIComponent(chapterText)}&ratio=${ratio}`
    })
    .then(response => response.json())
    .then(summary => {
        const summaryOutput = document.getElementById('summary_output');
        summaryOutput.innerHTML = '';
        summary.forEach(point => {
            const p = document.createElement('p');
            p.textContent = `- ${point}`;
            summaryOutput.appendChild(p);
        });
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('generate_image_btn').addEventListener('click', () => {
    fetch('/generate_image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary: document.getElementById('summary_output').innerText })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const img = document.getElementById('summary_image');
        img.src = url;
        img.style.display = 'block';
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('generate_quiz_btn').addEventListener('click', () => {
    const chapterText = document.getElementById('chapter_text').value;

    fetch('/generate_quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `text=${encodeURIComponent(chapterText)}`
    })
    .then(response => response.json())
    .then(data => {
        const { quiz, answers } = data;
        const quizForm = document.getElementById('quiz_form');
        quizForm.innerHTML = '';
        quiz.forEach((question, index) => {
            const p = document.createElement('p');
            p.textContent = `Question ${index + 1}: ${question}`;
            const yesButton = document.createElement('input');
            yesButton.type = 'radio';
            yesButton.name = `question_${index}`;
            yesButton.value = 'yes';
            const yesLabel = document.createElement('label');
            yesLabel.textContent = 'Yes';
            const noButton = document.createElement('input');
            noButton.type = 'radio';
            noButton.name = `question_${index}`;
            noButton.value = 'no';
            const noLabel = document.createElement('label');
            noLabel.textContent = 'No';
            quizForm.appendChild(p);
            quizForm.appendChild(yesButton);
            quizForm.appendChild(yesLabel);
            quizForm.appendChild(noButton);
            quizForm.appendChild(noLabel);
            quizForm.appendChild(document.createElement('br'));
        });

        document.getElementById('quiz_container').style.display = 'block';
        document.getElementById('submit_quiz_btn').style.display = 'block';

        // Save answers to sessionStorage for evaluation
        sessionStorage.setItem('quiz_answers', JSON.stringify(answers));
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('submit_quiz_btn').addEventListener('click', (event) => {
    event.preventDefault();
    const quizForm = document.getElementById('quiz_form');
    const formData = new FormData(quizForm);
    const userAnswers = [];
    for (let pair of formData.entries()) {
        userAnswers.push(pair[1]);
    }

    fetch('/evaluate_quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_answers: userAnswers, quiz_answers: JSON.parse(sessionStorage.getItem('quiz_answers')) })
    })
    .then(response => response.json())
    .then(data => {
        const resultsContainer = document.getElementById('results_container');
        resultsContainer.innerHTML = `<p>Your score: ${data.score}/${data.total_questions}</p>`;
    })
    .catch(error => console.error('Error:', error));
});
