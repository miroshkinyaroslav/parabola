// Дополнительная защита от открытия консоли
(function () {
    function blockConsoleOpen() {
        // Переопределяем функцию console.log
        const originalConsoleLog = console.log;
        console.log = function () {
            showCustomAlert();
            originalConsoleLog.apply(console, arguments);
        };

        // Перехватываем ошибки, которые могут открыть консоль
        window.onerror = function () {
            return true;
        };
    }

    // Пытаемся заблокировать несколько раз, так как некоторые методы защиты могут быть обойдены
    blockConsoleOpen();
    setInterval(blockConsoleOpen, 1000);
})();


let coefficients;
let wins = 0;
let losses = 0;
let currentQuestion = 'a';
let correctAnswersCount = 0;
let timerOn = false;
let timerSec = 15;
let tRemain = 15;
let tId = null;
let firstRoundStarted = false;

// DOM элементы
const winsElement = document.getElementById('wins');
const lossesElement = document.getElementById('losses');
const timerElement = document.getElementById('timer');
const timerBox = document.getElementById('timer-box');
const checkBtn = document.getElementById('check-btn');
const timerEnable = document.getElementById('timer-enable');
const timerSeconds = document.getElementById('timer-seconds');
const timerSettingsBox = document.getElementById('timer-settings-box');

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
    // Случайно выбираем, будет ли a равно 0 (15% вероятность)
    const a = Math.random() < 0.15 ? 0 : (Math.random() < 0.5 ? -1 : 1);

    // Случайно выбираем, будет ли b равно 0 (15% вероятность)
    const b = Math.random() < 0.15 ? 0 : getRandomCoefficient(-5, 5, -2, 2);

    // Случайно выбираем, будет ли c равно 0 (15% вероятность)
    const c = Math.random() < 0.15 ? 0 : getRandomCoefficient(-10, 10, -2, 2);

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
            text: "График параболы",
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
            t: 80,
            pad: 4
        },
        showlegend: false,
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
        stopTimer();
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

function startTimer() {
    tRemain = timerSec;
    updateTimer();

    tId = setInterval(() => {
        tRemain--;
        updateTimer();

        if (tRemain <= 0) {
            clearInterval(tId);
            losses++;
            updateScore();
            disableAllSelects();
            setTimeout(newGame, 1500);
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(tId);
}

function updateTimer() {
    timerElement.textContent = tRemain;
}

function readTimerSettings() {
    timerOn = timerEnable.checked;
    timerSec = parseInt(timerSeconds.value) || 15;
    tRemain = timerSec;
    updateTimer();

    if (timerOn) {
        timerSettingsBox.classList.remove('hidden');
        timerBox.classList.remove('hidden');
    } else {
        timerSettingsBox.classList.add('hidden');
        timerBox.classList.add('hidden');
        stopTimer();
    }
}

function newGame() {
    stopTimer();
    createChart();
    resetQuiz();
    if (timerOn) startTimer();
}

function setupQuiz() {
    const aSelect = document.getElementById('a-select');
    const bSelect = document.getElementById('b-select');
    const cSelect = document.getElementById('c-select');
    const bQuestion = document.getElementById('b-question');
    const cQuestion = document.getElementById('c-question');

    aSelect.addEventListener('change', () => {
        if (aSelect.value === '') return;

        if (!firstRoundStarted) {
            firstRoundStarted = true;
            timerEnable.disabled = true;
            timerSeconds.disabled = true;
        }

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
        stopTimer();
        setTimeout(newGame, 1500);
    });
}

function disableAllSelects() {
    document.querySelectorAll('select').forEach(select => {
        select.disabled = true;
    });
}

function setupEventListeners() {
    timerEnable.addEventListener('change', readTimerSettings);
    timerSeconds.addEventListener('input', readTimerSettings);

    checkBtn.addEventListener('click', () => {
        const currentSelect = document.getElementById(`${currentQuestion}-select`);
        if (currentSelect.value === '') {
            alert('Пожалуйста, выберите ответ');
            return;
        }

        currentSelect.dispatchEvent(new Event('change'));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupQuiz();
    readTimerSettings();
    newGame();
    updateScore();
});

// Блокировка F12 и консоли разработчика
document.addEventListener('keydown', function (e) {
    // Блокировка F12
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        showCustomAlert();
        return false;
    }

    // Блокировка Ctrl+Shift+I (Chrome), Ctrl+Shift+J (Chrome), Ctrl+Shift+C (Chrome)
    if ((e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        showCustomAlert();
        return false;
    }
});

// Показ красивого alert вместо стандартного
function showCustomAlert() {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';

    // Создаем содержимое модального окна
    const content = document.createElement('div');
    content.style.backgroundColor = 'white';
    content.style.padding = '30px';
    content.style.borderRadius = '10px';
    content.style.maxWidth = '400px';
    content.style.textAlign = 'center';
    content.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';

    // Заголовок
    const title = document.createElement('h2');
    title.textContent = 'Доступ ограничен';
    title.style.color = '#e74c3c';
    title.style.marginTop = '0';

    // Текст сообщения
    const message = document.createElement('p');
    message.textContent = 'Консоль разработчика не доступна на этом сайте.';
    message.style.fontSize = '16px';
    message.style.margin = '20px 0';

    // Кнопка OK
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.padding = '10px 20px';
    okButton.style.backgroundColor = '#3498db';
    okButton.style.color = 'white';
    okButton.style.border = 'none';
    okButton.style.borderRadius = '5px';
    okButton.style.cursor = 'pointer';
    okButton.style.fontSize = '16px';
    okButton.addEventListener('click', function () {
        document.body.removeChild(modal);
    });

    // Собираем модальное окно
    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(okButton);
    modal.appendChild(content);

    // Добавляем модальное окно на страницу
    document.body.appendChild(modal);
}

// Блокировка контекстного меню
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    showCustomAlert();
    return false;
});