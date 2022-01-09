function randomInteger(min, max) {//возвращает случайное число от min до max
    if (min > max) throw new Error('min > max');//ловим неверные min и max

    return Math.floor(Math.random() * (max + 1 - min) + min);

}

function askCorrectNumber(text="", default_value="1", asStr=false) {
    let number;
    while (true) {
        number = prompt(text, default_value);//text и default_value используются только здесь
        if (number == null) { 
            results.innerHTML = 'Вы не ввели начальное здоровье';
            throw new Error('Отмена ввода пользователем');
        }
        if (isFinite(number) && +number) {
            break;
        } else {
            alert('Некорректное здоровье');
        }
    }
    if (asStr) return number.trim(); //trim для обрезки пробелов в начале и конце
    return +number;
}

function Game() {
    function updateHealth () {
        let row = '';
        row += `<td id="mageHealth">Здоровье: ${mage.currentHealth}/${mage.maxHealth}</td>`;
        row += `<td></td>`;
        row += `<td id="monsterHealth">Здоровье: ${monster.currentHealth}/${monster.maxHealth}</td>`;
        CharactersHealth.innerHTML = row;
    }
    function updateMovesCharacter(character) {//обновляет атаки в html 
        if (character.name == monster.name) {
            tableCharacter = monsterMoves;
        } else {
            tableCharacter = mageMoves;
        }
            tableCharacter.innerHTML = getMovesTables(character.moves, character).innerHTML; 
        }

    function updateMovesCharacters() {//чтоб обновить для всех, а не конретного персонажа
        updateMovesCharacter(mage);
        updateMovesCharacter(monster);
    }

    function updateCooldownReload(character, value) {//обновляет кулдауны
        if (value == 0){//если 0, то выставляет в боевую готовность кулдауны
            for (let move of character.moves) {
                move.cooldownReload = 0;
            }
        } else {//если не 0, то прибавляет к значению кулдаунов value
            for (let move of character.moves) { 
                if (move.cooldownReload > 0) move.cooldownReload += value;
            }
        }
    }
    //возвращает таблицу со скиллами. В ней добавлены нужные id для работы
    function getMovesTables(moves, character) {
        let translate = {//названия аттрибутов в читабельном виде 
            "name": 'Приём',
            "physicalDmg": 'Физ. урон',
            "magicDmg": 'Маг. урон',
            "physicArmorPercents": 'Физ. броня'  ,                                     
            "magicArmorPercents": 'Маг. броня',
            "cooldown": 'Пер.',
            "cooldownReload": 'Пер. (Ост)',
        };
        let table = document.createElement('table');

        //добавляем наши заголовки
        let trHead = document.createElement('tr');
        for (let fieldname in translate) {
            trHead.innerHTML += `<th>${translate[fieldname]}</th>`;
        }


        table.insertAdjacentHTML('beforeend', trHead.outerHTML);
        //добавляем мувы
        let i = 0;
        for (let move of moves) {

            let tr = document.createElement('tr');//строка для добавления в неё
            
            let field;//заполняем полями

            for (field in move) {
                tr.innerHTML += `<td>${move[field]}</td>`;
            }
            //если перезарядка 0, то тогда навык готов для использования
            if(move[field] == 0) { 
                tr.className = 'ready';
                //для доступных магу мувов добавляем класс, чтобы можно было добавлять css к ним
                if(character.name == mage.name) tr.firstChild.className = 'readyMove';
            } else { 
                //если не 0, значит свойство ещё не перезарядилось
                tr.className = 'notready';
            }
                //добавим id, чтобы можно было удобно обрабатывать клики
                tr.dataset.idMove = i;
                i++;
            //добавляем строку в таблицу
            table.insertAdjacentHTML('beforeend', tr.outerHTML );
        }
        return table;
    }


    function initGame() { //инициализация игры

        namesCharacter.cells[0].textContent = mage.name;
        namesCharacter.cells[2].textContent = monster.name;

        mage.maxHealth = askCorrectNumber('Введите начальное здоровье мага', 10);
        mage.currentHealth = mage.maxHealth;
        monster.currentHealth = monster.maxHealth;
        updateHealth();
        results.innerHTML = 'Кликните на название навыка, для его выбора. Красные навыки перезаряжаются';
        updateCooldownReload(mage, 0);
        updateCooldownReload(monster, 0);

        updateMovesCharacters();
    }

    this.doMonsterMove =  function () {//выбор атаки монстра
        while (true) {
            this.monsterMoveNum = randomInteger(0, monster.moves.length - 1);
            if (monster.moves[this.monsterMoveNum]['cooldownReload'] == 0) {
                break;
            }

        }
        //добавляем класс для подсветки
        monsterMoves.querySelector(`[data-id-move='${this.monsterMoveNum}']`).className = "dragonMoveSelected";
        //мув использован, нужно поставить её кулдаун. +1 для того, чтобы перезарядка ждала столько ходов
        monster.moves[this.monsterMoveNum].cooldownReload = monster.moves[this.monsterMoveNum].cooldown + 1;
    }

    this.checkEnd = function () {//проверяем не конец ли игры
        let end = false;
        if(mage.currentHealth <= 0 && monster.currentHealth <= 0) {
            results.innerHTML = 'Все погибли!';
            mageHealth.style.color = 'red';
            monsterHealth.style.color = 'red';
            end = true;
        } else if (mage.currentHealth <= 0) {
            results.innerHTML = `${mage.name} пал смертью храбрых`;
            mageHealth.style.color = 'red';
            end = true;
        } else if (monster.currentHealth <= 0) {
            results.innerHTML = `${monster.name} был повержен`;
            monsterHealth.style.color = 'red';
            end = true;
        }
        if (end) {
         let button = document.createElement('button');
         button.textContent = 'Сыграть ещё раз';
         button.onclick = () => {button.remove(); this.startGame.call(this)};
         main.append(button);

     }
     return end;
    }


    this.increaseTurn = function() {//меняем номер хода
        turns.innerHTML = `Ход ${++this.turn}`;
    };

    this.doDamage = function () {//нанесение урона
        let mageMove = mage.moves[this.mageMoveNum];
        let monsterMove = monster.moves[this.monsterMoveNum];
        let damageToMonster = mageMove["physicalDmg"] * (1 - monsterMove["physicArmorPercents"] / 100) +
        mageMove["magicDmg"] * (1 - monsterMove["magicArmorPercents"] / 100);
        let damageToMage = monsterMove["physicalDmg"] * (1 - mageMove["physicArmorPercents"] / 100) +
        monsterMove["magicDmg"] * (1 - mageMove["magicArmorPercents"] / 100);
        mage.currentHealth -= Math.round(damageToMage);
        monster.currentHealth -= Math.round(damageToMonster);
    };


    this.mainLogic = function  () {//обработка клика
        if (event.target.className == 'readyMove') {
            results.innerHTML = '';
            this.mageMoveNum = event.target.parentNode.dataset.idMove;
            mage.moves[this.mageMoveNum].cooldownReload = mage.moves[this.mageMoveNum].cooldown + 1;
            this.doDamage();
            updateCooldownReload(mage, -1);
            updateCooldownReload(monster, -1);
            updateHealth();
            updateMovesCharacters();
            if (this.checkEnd()) {
                mageMoves.removeEventListener('click', this.mainLogic);
                return;
            }
            this.doMonsterMove();
            this.increaseTurn();
        }
    }.bind(this);
    //bind нужен для того, чтобы EventListener передавал в this этот класс(почти класс), а не таблицу  

    //стартуем игру
    this.startGame = function () {
        this.turn = 0;
        initGame();
        this.increaseTurn();
        this.doMonsterMove();
        mageMoves.addEventListener('click', this.mainLogic);
    };

}

game = new Game();
game.startGame();