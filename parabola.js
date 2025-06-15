let coefficients;
let wins = 0;
let losses = 0;
let currentQuestion = 'a';
let correctAnswersCount = 0;

// DOM элементы
const winsElement = document.getElementById('wins');
const lossesElement = document.getElementById('losses');
const checkBtn = document.getElementById('check-btn');

function updateScore() {
    winsElement.textContent = wins;
    lossesElement.textContent = losses;
}

function getRandomCoefficient(min, max, excludeMin = null, excludeMax = null) {
    let result;
    do {
        result = Math.random() * (max - min) + min;
    } while (excludeMin !== null && excludeMax !== null && result >= excludeMin && result <= excludeMax);
    return result;
}

function generateParabolaData() {
    // Случайно выбираем, будет ли a равно 0 (10% вероятность)
    const a = Math.random() < 0.1 ? 0 : (Math.random() < 0.5 ? -1 : 1);

    // Случайно выбираем, будет ли b равно 0 (10% вероятность)
    const b = Math.random() < 0.1 ? 0 : getRandomCoefficient(-5, 5, -2, 2);

    // Случайно выбираем, будет ли c равно 0 (10% вероятность)
    const c = Math.random() < 0.1 ? 0 : getRandomCoefficient(-10, 10, -2, 2);

    const x = [];
    const y = [];
    for (let i = -10; i <= 10; i += 0.5) {
        x.push(i);
        y.push(a * i * i + b * i + c);
    }
    return { x, y, coefficients: { a, b, c } };
}

function createChart() {
    const { x, y, coefficients: coeff } = generateParabolaData();
    coefficients = coeff;

    let equation;
    if (coeff.a === 0) {
        equation = `y = ${coeff.b.toFixed(2)}x + ${coeff.c.toFixed(2)}`;
    } else {
        equation = `y = ${coeff.a.toFixed(2)}x² + ${coeff.b.toFixed(2)}x + ${coeff.c.toFixed(2)}`;
    }

    const trace = {
        x: x,
        y: y,
        mode: 'lines',
        type: 'scatter',
        line: {
            color: '#3498db',
            width: 2
        }
    };

    const layout = {
        title: {
            text: "График параболы", // Уравнение теперь в заголовке
            font: {
                size: 18
            }
        },
        xaxis: {
            title: 'x',
            range: [-10, 10],
            showgrid: true,
            zeroline: true,
            fixedrange: true
        },
        yaxis: {
            title: 'y',
            range: [-20, 20],
            showgrid: true,
            zeroline: true,
            fixedrange: true
        },
        autosize: true,
        height: 400,
        width: 600,
        margin: {
            l: 60,
            r: 30,
            b: 60,
            t: 80, // Увеличили верхний отступ для заголовка
            pad: 4
        },
        showlegend: false, // Скрыли легенду полностью
        dragmode: false,
        hovermode: false
    };

    const config = {
        displayModeBar: false,
        staticPlot: true,
        responsive: true
    };

    Plotly.newPlot('chart-container', [trace], layout, config);
}


function checkAnswer(select, coefficient) {
    const value = select.value;
    const result = select.nextElementSibling;
    let isCorrect = false;

    if (coefficient > 0 && value === 'positive') isCorrect = true;
    else if (coefficient < 0 && value === 'negative') isCorrect = true;
    else if (coefficient === 0 && value === 'zero') isCorrect = true;

    if (isCorrect) {
        result.textContent = '✓';
        result.className = 'result-icon correct';
        correctAnswersCount++;
    } else {
        result.textContent = '✗';
        result.className = 'result-icon incorrect';
        losses++;
        updateScore();
        disableAllSelects();
        setTimeout(newGame, 1500);
    }

    return isCorrect;
}

function resetQuiz() {
    correctAnswersCount = 0;
    document.querySelectorAll('.question').forEach(q => {
        q.classList.add('hidden');
    });
    document.querySelectorAll('select').forEach(select => {
        select.value = '';
        select.disabled = false;
    });
    document.querySelectorAll('.result-icon').forEach(span => {
        span.textContent = '';
        span.className = 'result-icon';
    });
    currentQuestion = 'a';
    document.getElementById('a-question').classList.remove('hidden');
}

function setupQuiz() {
    const aSelect = document.getElementById('a-select');
    const bSelect = document.getElementById('b-select');
    const cSelect = document.getElementById('c-select');
    const bQuestion = document.getElementById('b-question');
    const cQuestion = document.getElementById('c-question');

    aSelect.addEventListener('change', () => {
        if (aSelect.value === '') return;

        checkAnswer(aSelect, coefficients.a);
        bQuestion.classList.remove('hidden');
        currentQuestion = 'b';
    });

    bSelect.addEventListener('change', () => {
        if (bSelect.value === '') return;

        checkAnswer(bSelect, coefficients.b);
        cQuestion.classList.remove('hidden');
        currentQuestion = 'c';
    });

    cSelect.addEventListener('change', () => {
        if (cSelect.value === '') return;

        checkAnswer(cSelect, coefficients.c);

        // Если все ответы правильные
        if (correctAnswersCount === 3) {
            wins++;
            updateScore();
        }

        disableAllSelects();
        setTimeout(newGame, 1500);
    });
}

function disableAllSelects() {
    document.querySelectorAll('select').forEach(select => {
        select.disabled = true;
    });
}

function newGame() {
    createChart();
    resetQuiz();
}

document.addEventListener('DOMContentLoaded', () => {
    newGame();
    setupQuiz();
    updateScore();

    checkBtn.addEventListener('click', () => {
        const currentSelect = document.getElementById(`${currentQuestion}-select`);
        if (currentSelect.value === '') {
            alert('Пожалуйста, выберите ответ');
            return;
        }

        currentSelect.dispatchEvent(new Event('change'));
    });
});