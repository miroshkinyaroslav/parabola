let coefficients;

function getRandomCoefficient(min, max, excludeMin = null, excludeMax = null) {
    let result;
    do {
        result = Math.random() * (max - min) + min;
    } while (excludeMin !== null && excludeMax !== null && result >= excludeMin && result <= excludeMax);
    return result;
}

function generateParabolaData() {
    const a = Math.random() < 0.5 ? -1 : 1;
    const b = getRandomCoefficient(-5, 5, -2, 2);
    const c = getRandomCoefficient(-10, 10, -2, 2);

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

    const trace = {
        x: x,
        y: y,
        mode: 'lines',
        type: 'scatter',
        name: `y = ${coeff.a}x² + ${coeff.b.toFixed(2)}x + ${coeff.c.toFixed(2)}`
    };

    const layout = {
        title: 'График параболы',
        xaxis: { title: 'x', range: [-10, 10] },
        yaxis: { title: 'y', range: [-20, 20] },
        autosize: true,
        height: 600,
        width: 800
    };

    Plotly.newPlot('chart-container', [trace], layout);
}

function checkAnswer(select, coefficient) {
    const value = select.value;
    const result = select.nextElementSibling;
    let isCorrect = false;

    if (coefficient > 0 && value === 'positive') isCorrect = true;
    else if (coefficient < 0 && value === 'negative') isCorrect = true;
    else if (coefficient === 0 && value === 'zero') isCorrect = true;

    if (isCorrect) {
        result.textContent = '✅';
        result.className = 'correct';
    } else {
        result.textContent = '❌';
        result.className = 'incorrect';
    }

    return isCorrect;
}

function disableAllSelects() {
    document.querySelectorAll('select').forEach(select => {
        select.disabled = true;
    });
}

function setupQuiz() {
    const aSelect = document.getElementById('a-select');
    const bSelect = document.getElementById('b-select');
    const cSelect = document.getElementById('c-select');
    const bQuestion = document.getElementById('b-question');
    const cQuestion = document.getElementById('c-question');

    aSelect.addEventListener('change', () => {
        if (checkAnswer(aSelect, coefficients.a)) {
            bQuestion.classList.remove('hidden');
        } else {
            disableAllSelects();
        }
    });

    bSelect.addEventListener('change', () => {
        if (checkAnswer(bSelect, coefficients.b)) {
            cQuestion.classList.remove('hidden');
        } else {
            disableAllSelects();
        }
    });

    cSelect.addEventListener('change', () => {
        if (!checkAnswer(cSelect, coefficients.c)) {
            disableAllSelects();
        }
    });
}

function setupRefreshButton() {
    const refreshButton = document.getElementById('refresh-button');
    refreshButton.addEventListener('click', () => {
        location.reload();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    createChart();
    setupQuiz();
    setupRefreshButton();
});