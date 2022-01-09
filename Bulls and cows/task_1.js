function randomInteger(min, max) {//возвращает случайное число от min до max
	if (min > max) throw new Error('min > max');//ловим неверные min и max

	return Math.floor(Math.random() * (max + 1 - min) + min);

}

//возвращает случайный набор из уникальных цифр заданной длины
function randomNumberFromLength(min_length, max_length) {
	if (min_length > max_length) {//ловим неверные min и max
		alert('До > После');
		return;		
	}

	if ((0 >= min_length) || (0 >= max_length)) {//ловим неверные min и max
		alert('Ну и как прикажете обрабатывать такую длину?');
		return;		
	}

	let numberLength = randomInteger(min_length, max_length);//случайная длина
	let number = '';
	for (let i = 0; i < numberLength; i++) {
		while (true) {
			let rand = randomInteger(0, 9);
			if (!number.includes(rand)) {
				number += rand;
				break;
			}
		}
	}
	return number;
}

/*
функция нужна для проверки корректности числа.
Для выхода из неё можно отменить ввод, что повлечёт выход из программы, либо ввести корректное число, которое она и вернёт
asStr нужен для вывода числа в типе строка
*/
function askCorrectNumber(text="", default_value="1", asStr=false) {
	let number;
	while (true) {
		number = prompt(text, default_value);//text и default_value используются только здесь
		if (number == null) { 
			menu.innerHTML = 'Вы вышли из игры';
			throw new Error('Отмена ввода пользователем');
		}
		if (isFinite(number) && number != '') {
			break;
		} else {
			alert('Некорректное число');
		}
	}
	if (asStr) return number.trim(); //trim для обрезки пробелов в начале и конце
	return +number;
}

function Game () {//конструктор игры
	//запрашивает у пользователя верные параметры числа, потом загадывает и возвращает его
	this.createConceivedNumber = function () {
		while (true) {
			let a = askCorrectNumber('Введите от какой длины вы хотите угадывать число:', 3);
			let b = askCorrectNumber('Введите до какой длины вы хотите угадывать число:', 6);
			let conceivedNumber = randomNumberFromLength(a, b);
			console.log(`Загаданное число ${conceivedNumber}`);
			if (conceivedNumber)  {
				alert(`Длина загаданного числа = ${conceivedNumber.length}`);
				return conceivedNumber;
			}
		}
	}

	this.ask_userTryCount = function () {//Спрашивает верное количество попыток
		let userTryCount = askCorrectNumber('Введите количество попыток', 5);
		if (userTryCount <= 0) {
			alert('Надо просто же натуральную циферку ввести. Пускай их будет 5');
			userTryCount = 5;
		};
		return userTryCount;
	}

	this.guessing = function () {//спрашивает у пользователя его догадку. Она должна быть корректной
		while (true) {
			let guess = askCorrectNumber(`Осталось попыток: ${this.userTryCount - this.n_try}`, '', true);
			if (this.isCorrectGuessNumber(guess))//проверяем корректность
			 return guess;
		}
	}
	//сверяет длину числа и уникальность цифр. Если корректно => true, иначе false
	this.isCorrectGuessNumber = function (guessNumber) {
		if (guessNumber.length != this.conceivedNumber.length) {
			alert(`Длина у загаданного числа ${this.conceivedNumber.length}, а у вас ${guessNumber.length}`);
			return false;
		}

		for (let i = 0; i < guessNumber.length; i++) {
			let digitCount = guessNumber.split(guessNumber[i]).length - 1;
			if (digitCount > 1) {
				alert(`Цифры не должны повторяться`);
				return false;
			}
		}	
		return true;
	}
	//сравнивает числа. Alert совпадения. Если числа совпадают => true, иначе false
	this.checkGuess = function () {
		let correctDigit = [];
		let includesDigit = [];

		for (let i = 0; i < this.conceivedNumber.length; i++) {
			if (this.conceivedNumber[i] == this.guessNumber[i]) {
				correctDigit.push(this.guessNumber[i]);
			} else if (this.conceivedNumber.includes(this.guessNumber[i])) {
				includesDigit.push(this.guessNumber[i]);
			}
		}

		if (correctDigit.length == this.conceivedNumber.length) return true;

		let msgCorrect = `Количество цифр на своих местах: ${correctDigit.length}. ${correctDigit.length ? `(${correctDigit})` : ''}`;
		let msgIncludes = `Количество цифр не на своих местах: ${includesDigit.length}. ${includesDigit.length ? `(${includesDigit})` : ''}`;
		alert(`${msgCorrect}\n${msgIncludes}`);
		return false;
	}
	//метод запускающий игру
	this.startGame = function () {

		this.conceivedNumber = this.createConceivedNumber();//загаданное число
		this.userTryCount = this.ask_userTryCount();//количество попыток
		this.n_try = 0;//количество использованных попыток. Неверный ввод не учитывается в них

		while (this.userTryCount - this.n_try != 0) {//до тех пор пока у пользователя есть попытки
			this.guessNumber = this.guessing();//спрашиваем догадку
			if(this.checkGuess()) {//проверяем отгадал ли
				alert(`Вы отгадали. Супер!`);
				return true;
			} else {
				this.n_try++;
			}
		}
		//если попытки закончились
		alert(`Попытки закончились. Загаданное число - ${conceivedNumber}`);
		return false;
	}

}

do { //играем
	let game = new Game();
	game.startGame();
	menu.innerHTML = 'Спасибо за внимание';
} while (confirm('Сыграем ещё?'))
