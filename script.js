// 1. КЛАСИ ТА АРХІТЕКТУРА
class Question {
    constructor(text, points) {
        this.text = text;
        this.points = points;
    }

    render(container) {
        const title = document.createElement('h3');
        title.textContent = this.text;
        container.appendChild(title);
    }
}

class RadioQuestion extends Question {
    constructor(text, options, correctIndex, points) {
        super(text, points);
        this.options = options;
        this.correctIndex = correctIndex;
    }

    render(container) {
        super.render(container);
        const form = document.createElement('div');
        form.className = 'options-list';
        
        // Перемішування варіантів відповідей
        const shuffledIndices = this.options.map((_, i) => i).sort(() => Math.random() - 0.5);
        this.currentMapping = shuffledIndices;

        shuffledIndices.forEach((originalIndex) => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'question-opt';
            input.value = originalIndex;
            
            label.appendChild(input);
            label.appendChild(document.createTextNode(` ${this.options[originalIndex]}`));
            form.appendChild(label);
        });
        container.appendChild(form);
    }

    checkAnswer() {
        const selected = document.querySelector('input[name="question-opt"]:checked');
        if (!selected) return 0;
        return parseInt(selected.value) === this.correctIndex ? this.points : 0;
    }
}

class CheckboxQuestion extends Question {
    constructor(text, options, correctIndices, points) {
        super(text, points);
        this.options = options;
        this.correctIndices = correctIndices;
    }

    render(container) {
        super.render(container);
        const form = document.createElement('div');
        this.options.forEach((opt, idx) => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.value = idx;
            label.appendChild(input);
            label.appendChild(document.createTextNode(` ${opt}`));
            form.appendChild(label);
        });
        container.appendChild(form);
    }

    checkAnswer() {
        const checked = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
        const isCorrect = checked.length === this.correctIndices.length && 
                          checked.every(val => this.correctIndices.includes(val));
        return isCorrect ? this.points : 0;
    }
}

class InputQuestion extends Question {
    constructor(text, correctAnswers, points) {
        super(text, points);
        this.correctAnswers = correctAnswers.map(a => a.toLowerCase().trim());
    }

    render(container) {
        super.render(container);
        const input = document.createElement('textarea');
        input.placeholder = 'Введіть ваш код або відповідь тут...';
        input.id = 'input-answer';
        container.appendChild(input);
    }

    checkAnswer() {
        const val = document.getElementById('input-answer').value.toLowerCase().trim();
        return this.correctAnswers.includes(val) ? this.points : 0;
    }
}

class DragDropQuestion extends Question {
    constructor(text, pairs, points) {
        super(text, points);
        this.pairs = pairs;
    }

    render(container) {
        super.render(container);
        const dragContainer = document.createElement('div');
        dragContainer.className = 'drag-container';

        const draggablesDiv = document.createElement('div');
        draggablesDiv.className = 'draggables';
        
        const dropzonesDiv = document.createElement('div');
        dropzonesDiv.className = 'dropzones';

        const keys = Object.keys(this.pairs);
        const values = Object.values(this.pairs).sort(() => Math.random() - 0.5);

        values.forEach((val, idx) => {
            const dragItem = document.createElement('div');
            dragItem.className = 'draggable-item';
            dragItem.draggable = true;
            dragItem.textContent = val;
            dragItem.id = `drag-${idx}`;
            
            dragItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', val);
            });
            draggablesDiv.appendChild(dragItem);
        });

        keys.forEach(key => {
            const dropzone = document.createElement('div');
            dropzone.className = 'dropzone';
            dropzone.dataset.match = this.pairs[key];
            
            const label = document.createElement('span');
            label.textContent = key;
            dropzone.appendChild(label);

            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('over');
            });

            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('over');
            });

            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('over');
                const val = e.dataTransfer.getData('text/plain');
                
                const existing = dropzone.querySelector('.draggable-placed');
                if(existing) existing.remove();

                const placedItem = document.createElement('div');
                placedItem.className = 'draggable-placed';
                placedItem.textContent = val;
                placedItem.style.background = '#2ecc71';
                placedItem.style.color = 'white';
                placedItem.style.padding = '5px';
                placedItem.style.marginTop = '5px';
                
                dropzone.appendChild(placedItem);
            });
            
            dropzonesDiv.appendChild(dropzone);
        });

        dragContainer.appendChild(draggablesDiv);
        dragContainer.appendChild(dropzonesDiv);
        container.appendChild(dragContainer);
    }

    checkAnswer() {
        let correctCount = 0;
        const dropzones = document.querySelectorAll('.dropzone');
        dropzones.forEach(zone => {
            const placed = zone.querySelector('.draggable-placed');
            if (placed && placed.textContent === zone.dataset.match) {
                correctCount++;
            }
        });
        return correctCount === Object.keys(this.pairs).length ? this.points : 0;
    }
}

// 2. БАНК ПИТАНЬ (ВАРІАНТ 8)
const questionBank = {
    easy: [
        new RadioQuestion("Який метод створює новий HTML-елемент?", ["document.createElement()", "document.newElement()", "document.addTag()", "document.makeNode()"], 0, 1),
        new RadioQuestion("Як змінити колір тексту елемента на червоний через JS?", ["element.style.fontColor = 'red'", "element.style.color = 'red'", "element.css.color = 'red'", "element.color = 'red'"], 1, 1),
        new InputQuestion("Який метод видаляє клас 'active' зі списку класів елемента?", ["remove", "classList.remove"], 1),
        new RadioQuestion("Що робить метод elem.remove()?", ["Приховує елемент", "Видаляє елемент з DOM", "Очищує вміст елемента", "Видаляє атрибути"], 1, 1),
        new CheckboxQuestion("Які властивості дозволяють змінити текстовий вміст?", ["textContent", "innerText", "innerHTML", "value"], [0, 1, 2], 1),
        new RadioQuestion("Як отримати доступ до атрибута 'src' картинки?", ["img.src", "img.getAttribute('src')", "img.attribute.src", "Варіанти 1 та 2"], 3, 1),
        new DragDropQuestion("Встановіть відповідність атрибутів тегам", {"href": "a", "src": "img", "type": "input", "alt": "img"}, 1),
        new InputQuestion("Напишіть команду для додавання елемента `li` в кінець списку `ul`.", ["ul.append(li)", "ul.appendChild(li)"], 1),
        new RadioQuestion("Який атрибут використовується для унікальної ідентифікації елемента?", ["class", "id", "name", "tag"], 1, 1),
        new RadioQuestion("Чи безпечно використовувати innerHTML для вставки тексту від користувача?", ["Так", "Ні, це загроза XSS", "Тільки в Chrome", "Так, якщо текст короткий"], 1, 1),
        new InputQuestion("Як перевірити, чи має елемент клас 'visible'? (метод)", ["contains", "classList.contains"], 1),
        new RadioQuestion("Що повертає document.body?", ["Елемент <body>", "Весь HTML документ", "null", "Елемент <head>"], 0, 1),
        new CheckboxQuestion("Які методи додають елемент в DOM?", ["append()", "prepend()", "after()", "push()"], [0, 1, 2], 1),
        new RadioQuestion("Як повністю очистити вміст елемента?", ["elem.value = ''", "elem.innerHTML = ''", "elem.remove()", "elem.delete()"], 1, 1),
        new InputQuestion("Властивість, що дозволяє читати/змінювати data-атрибути (наприклад data-id).", ["dataset", "data"], 1)
    ],

    medium: [
        new RadioQuestion("У чому різниця між append() та appendChild()?", ["appendChild приймає лише вузли, append - вузли та рядки", "Немає різниці", "append працює швидше", "appendChild дозволяє вставляти кілька елементів"], 0, 2),
        new InputQuestion("Метод для заміни дочірнього елемента oldNode на newNode.", ["replaceChild", "parent.replaceChild"], 2),
        new DragDropQuestion("Методи вставки відносно елемента (insertAdjacentHTML)", {"beforebegin": "Перед елементом", "afterbegin": "Всередину, на початок", "beforeend": "Всередину, в кінець", "afterend": "Після елемента"}, 2),
        new RadioQuestion("Що відбудеться, якщо вставити вже існуючий в DOM елемент в інше місце?", ["Він скопіюється", "Він переміститься", "Виникне помилка", "Нічого не станеться"], 1, 2),
        new CheckboxQuestion("Які методи працюють з класами через classList?", ["toggle", "replace", "add", "set"], [0, 1, 2], 2),
        new InputQuestion("Метод для створення глибокої копії вузла (разом з дітьми).", ["cloneNode(true)", "node.cloneNode(true)"], 2),
        new RadioQuestion("Як отримати обчислені стилі елемента (ті, що з CSS-файлу)?", ["element.style", "getComputedStyle(element)", "element.css", "element.computed"], 1, 2),
        new RadioQuestion("Що повертає elem.closest('.css-class')?", ["Перший дочірній елемент з класом", "Найближчий батьківський елемент (або сам elem), що відповідає селектору", "Сусідній елемент", "Масив всіх батьків"], 1, 2),
        new CheckboxQuestion("Які типи вузлів існують в DOM?", ["ELEMENT_NODE", "TEXT_NODE", "COMMENT_NODE", "STYLE_NODE"], [0, 1, 2], 2),
        new InputQuestion("Властивість для отримання всього HTML елемента разом з тегами (зовнішній HTML).", ["outerHTML"], 2),
        new RadioQuestion("Як переключити клас 'open': додати якщо немає, видалити якщо є?", ["classList.add()", "classList.toggle()", "classList.switch()", "classList.change()"], 1, 2),
        new DragDropQuestion("Співставте властивості навігації", {"nextElementSibling": "Наступний тег", "previousSibling": "Попередній вузол (будь-який)", "parentElement": "Батьківський тег", "firstChild": "Перший вузол (може бути текст)"}, 2),
        new InputQuestion("Як перевірити, чи відповідає елемент CSS-селектору? (метод)", ["matches", "element.matches"], 2),
        new RadioQuestion("Який метод вставляє елемент newEl перед referenceEl?", ["parent.prepend(newEl)", "parent.insertBefore(newEl, referenceEl)", "parent.appendBefore(newEl, referenceEl)", "referenceEl.before(newEl)"], 1, 2),
        new RadioQuestion("Властивість hidden = true еквівалентна якому CSS?", ["display: none", "visibility: hidden", "opacity: 0", "z-index: -1"], 0, 2)
    ],

    hard: [
        new RadioQuestion("Для чого використовується DocumentFragment?", ["Для створення коментарів", "Для групування елементів та вставки їх без зайвих перемалювань (reflow)", "Для роботи з iframes", "Для збереження даних"], 1, 3),
        new CheckboxQuestion("Які зміни викликають Reflow (перерахунок макету)?", ["Зміна offsetWidth", "Зміна background-color", "Зміна font-size", "Зміна opacity (у деяких випадках)"], [0, 2], 3),
        new InputQuestion("Як перетворити live-колекцію HTMLCollection в звичайний масив? (наприклад, через Array)", ["Array.from", "Array.from()"], 3),
        new DragDropQuestion("Типи даних DOM атрибутів", {"style": "CSSStyleDeclaration", "classList": "DOMTokenList", "dataset": "DOMStringMap", "attributes": "NamedNodeMap"}, 3),
        new RadioQuestion("Що станеться з подіями (event listeners) при клонуванні елемента через cloneNode(true)?", ["Вони скопіюються", "Вони НЕ скопіюються", "Скопіюються тільки inline-події (onclick=...)", "Залежить від браузера"], 1, 3),
        new InputQuestion("Напишіть метод, щоб вставити HTML-рядок '<p>Hi</p>' прямо перед кінцем елемента elem.", ["insertAdjacentHTML", "elem.insertAdjacentHTML"], 3),
        new RadioQuestion("Яка різниця між node.isConnected та document.contains(node)?", ["Це одне й те саме", "isConnected - новіший стандарт, працює так само", "contains перевіряє лише нащадків, isConnected перевіряє чи є вузол в активному документі", "Різниці немає"], 2, 3),
        new CheckboxQuestion("Які методи дозволяють вставити текст без ризику XSS?", ["textContent", "innerText", "innerHTML", "createTextNode"], [0, 1, 3], 3),
        new RadioQuestion("Чи можна змінювати значення властивостей у read-only колекції elem.attributes напряму?", ["Так", "Ні, тільки через setAttribute", "Тільки видаляти", "Тільки додавати"], 1, 3),
        new InputQuestion("Спеціальний об'єкт для спостереження за змінами в DOM дереві.", ["MutationObserver"], 3),
        new DragDropQuestion("Методи координат елемента", {"getBoundingClientRect()": "Координати відносно вьюпорта", "offsetTop": "Координати відносно батька (offsetParent)", "clientTop": "Ширина верхньої рамки (border)", "scrollTop": "Прокручена частина зверху"}, 3),
        new RadioQuestion("Що швидше для браузера: innerHTML += 'text' чи append(textNode)?", ["innerHTML += 'text'", "append(textNode)", "Однаково", "Залежить від довжини тексту"], 1, 3),
        new InputQuestion("Атрибут HTML, що дозволяє користувачу редагувати вміст елемента.", ["contenteditable"], 3),
        new RadioQuestion("Як змусити браузер примусово застосувати стилі (flush styles) прямо зараз?", ["elem.style.flush()", "Звернутися до властивості типу elem.offsetHeight", "setTimeout(0)", "elem.repaint()"], 1, 3),
        new CheckboxQuestion("Які з наведених селекторів є валідними для querySelector?", ["div > p", "#id.class", "[data-val='1']", "::before"], [0, 1, 2], 3)
    ]
};

// 3. ЛОГІКА ТЕСТУВАННЯ
class Quiz {
    constructor() {
        this.questions = [];
        this.score = 0;
        this.currentQuestionIndex = 0;
        this.user = {};
    }

    start(user, difficulty) {
        this.user = user;
        this.score = 0;
        this.currentQuestionIndex = 0;
        
        // Вибір 10 випадкових питань
        const pool = questionBank[difficulty];
        // Клонування масиву, щоб не псувати оригінал, і перемішування
        this.questions = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
        
        document.getElementById('total-questions').textContent = this.questions.length;
        this.showScreen('quiz-screen');
        this.renderQuestion();
    }

    renderQuestion() {
        const container = document.getElementById('question-container');
        container.innerHTML = '';
        
        const q = this.questions[this.currentQuestionIndex];
        q.render(container);
        
        document.getElementById('current-question-num').textContent = this.currentQuestionIndex + 1;
    }

    nextQuestion() {
        const q = this.questions[this.currentQuestionIndex];
        const points = q.checkAnswer();
        this.score += points;

        this.currentQuestionIndex++;

        if (this.currentQuestionIndex < this.questions.length) {
            this.renderQuestion();
        } else {
            this.finish();
        }
    }

    finish() {
        this.showScreen('result-screen');
        
        const maxScore = this.questions.reduce((acc, q) => acc + q.points, 0);
        
        document.getElementById('res-name').textContent = this.user.name;
        document.getElementById('res-group').textContent = this.user.group;
        document.getElementById('res-level').textContent = document.getElementById('difficulty').value;
        document.getElementById('score-val').textContent = this.score;
        document.getElementById('max-score').textContent = maxScore;

        const resultData = {
            name: this.user.name,
            group: this.user.group,
            score: this.score,
            date: new Date().toLocaleString()
        };
        localStorage.setItem('lastQuizResult', JSON.stringify(resultData));
    }

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
            s.style.display = 'none';
        });
        
        const screen = document.getElementById(id);
        screen.style.display = 'block';
        setTimeout(() => screen.classList.add('active'), 10);
    }
}

// 4. ІНІЦІАЛІЗАЦІЯ
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new Quiz();
    
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!loginForm.checkValidity()) {
            alert('Будь ласка, заповніть всі поля коректно.');
            return;
        }

        const user = {
            name: document.getElementById('username').value,
            group: document.getElementById('group').value
        };

        document.getElementById('header-student-name').textContent = user.name;
        document.getElementById('header-group').textContent = user.group;

        const difficulty = document.getElementById('difficulty').value;
        quiz.start(user, difficulty);
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        quiz.nextQuestion();
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
        location.reload();
    });
});