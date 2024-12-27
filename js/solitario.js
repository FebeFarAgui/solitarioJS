/***** INICIO DECLARACIÓN DE VARIABLES GLOBALES *****/

// Array de palos
const PALOS = ["viu", "cua", "hex", "cir"];
// Array de número de cartas
const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// paso (top y left) en pixeles de una carta a la siguiente en un mazo
const PASO = 5;

// Tapetes
const tapetes = {
	inicial: document.getElementById("inicial"),
	sobrantes: document.getElementById("sobrantes"),
	receptor1: document.getElementById("receptor1"),
	receptor2: document.getElementById("receptor2"),
	receptor3: document.getElementById("receptor3"),
	receptor4: document.getElementById("receptor4"),
};

// Contadores
const contadores = {
	inicial: document.getElementById("contador_inicial"),
	sobrantes: document.getElementById("contador_sobrantes"),
	receptor1: document.getElementById("contador_receptor1"),
	receptor2: document.getElementById("contador_receptor2"),
	receptor3: document.getElementById("contador_receptor3"),
	receptor4: document.getElementById("contador_receptor4"),
	movimientos: document.getElementById("contador_movimientos"),
	tiempo: document.getElementById("contador_tiempo"),
};

// Mazos
const mazos = {
	inicial: [],
	sobrantes: [],
	receptor1: [],
	receptor2: [],
	receptor3: [],
	receptor4: [],
};

// Tiempo
let contTiempo = document.getElementById("contador_tiempo"); // span cuenta tiempo
let segundos = 0;    // cuenta de segundos
let temporizador = null; // manejador del temporizador

/***** FIN DECLARACIÓN DE VARIABLES GLOBALES *****/


/**
 * Espera a que el contenido de la página esté completamente cargado y luego:
 * - Asocia un evento al botón de reiniciar para limpiar los tapetes y comenzar el juego nuevamente.
 * - Inicia el juego automáticamente cuando la página se carga por primera vez.
 * - Establece los listeners para manejar las interacciones con los tapetes.
 */
document.addEventListener("DOMContentLoaded", () => {
	// Asociar evento al botón reiniciar
	document.getElementById("reset").addEventListener("click", () => {
		limpiarCartas(tapetes.receptor1);
		limpiarCartas(tapetes.receptor2);
		limpiarCartas(tapetes.receptor3);
		limpiarCartas(tapetes.receptor4);
		limpiarCartas(tapetes.sobrantes);
		comenzarJuego();
	});

	// Comenzar el juego automáticamente
	comenzarJuego();
	setListenersTapetes();

});

/**
 * Función encargada de iniciar o reiniciar el juego. 
 */
function comenzarJuego() {

	// Reiniciar mazos
	Object.keys(mazos).forEach(key => (mazos[key] = []));

	// Crear baraja inicial
	mazos.inicial = crearBaraja();

	// Barajar y dejar mazos.inicial en tapete inicial
	barajar(mazos.inicial);
	cargarTapeteInicial(mazos.inicial);

	// Puesta a cero de contadores de mazos
	setContador(contadores.inicial, mazos.inicial.length);
	[contadores.receptor1, contadores.receptor2, contadores.receptor3, contadores.receptor4, contadores.sobrantes, contadores.movimientos].forEach(
		contador => setContador(contador, 0));

	// Añadir listeners a las cartas y tapetes
	setListenersCartas();

	// Arrancar el conteo de tiempo
	arrancarTiempo();

}

/**
 * Crear baraja completa como un array de elementos <img>.
 * @returns {HTMLImageElement[]} Array de cartas
 */
function crearBaraja() {
	const baraja = [];
	for (const palo of PALOS) {
		for (const numero of NUMEROS) {
			const carta = document.createElement("img");
			carta.id = `${numero}${palo}`;
			carta.src = `imagenes/baraja/${numero}-${palo}.png`;
			carta.alt = `${numero} de ${palo}`;
			carta.className = "carta";
			carta.dataset.palo = palo;
			carta.dataset.numero = numero;
			baraja.push(carta);
		}
	}
	return baraja;
}

/**
 * Función encargada de arrancar el temporizador del juego. 
 * Reinicia el contador de segundos, establece el formato adecuado para mostrar el tiempo en horas, minutos y segundos,
 * y actualiza el temporizador en pantalla cada segundo.
 */
function arrancarTiempo() {
	if (temporizador) clearInterval(temporizador);

	const formatTime = (seconds) => {
		const seg = seconds % 60;
		const min = Math.floor((seconds % 3600) / 60);
		const hor = Math.floor(seconds / 3600);
		return [
			hor.toString().padStart(2, '0'),
			min.toString().padStart(2, '0'),
			seg.toString().padStart(2, '0')
		].join(':');
	};

	const updateTimer = () => {
		setContador(contTiempo, formatTime(segundos));
		segundos++;
	};

	segundos = 0;
	updateTimer(); // Mostrar el tiempo inicial (00:00:00)
	temporizador = setInterval(updateTimer, 1000);
}


/**
 * Baraja un array de cartas (Fisher-Yates Shuffle).
 * @param {Array} mazo - Array de elementos <img> a barajar.
 */
function barajar(mazo) {
	for (let i = mazo.length - 1; i > 0; i--) {
		const randomIndex = Math.floor(Math.random() * (i + 1));
		[mazo[i], mazo[randomIndex]] = [mazo[randomIndex], mazo[i]]; // Intercambio
	}
}

/**
 * Añade cartas al tapete inicial con estilo y atributos adecuados.
 * @param {Array} mazo - Array de cartas (<img>) a cargar en el tapete inicial.
 */
function cargarTapeteInicial(mazo) {
	limpiarCartas(tapetes.inicial);

	const cartaWidth = "60px";
	mazo.forEach((carta, index) => {
		Object.assign(carta.style, {
			top: `${index * PASO}px`,
			left: `${index * PASO}px`,
			width: cartaWidth,
			zIndex: index,
		});
		tapetes.inicial.appendChild(carta);
	});

	setContador(contadores.inicial, mazo.length);
}

/**
 * Incrementa el valor del contador dado.
 * @param {HTMLElement} contador - Elemento HTML cuyo texto representa el contador.
 */
function incContador(contador) {
	const currentCount = parseInt(contador.textContent) || 0;
	contador.textContent = currentCount + 1;
}

/**
 * Decrementa el valor del contador dado, sin bajar de cero.
 * @param {HTMLElement} contador - Elemento HTML cuyo texto representa el contador.
 */
function decContador(contador) {
	const currentCount = parseInt(contador.textContent) || 0;
	contador.textContent = Math.max(0, currentCount - 1);
}

/**
 * Ajusta el valor del contador al valor especificado.
 * @param {HTMLElement} contador - Elemento HTML cuyo texto representa el contador.
 * @param {number} valor - Nuevo valor del contador.
 */
function setContador(contador, valor) {
	contador.textContent = valor;
}

/**
 * Agrega los eventos necesarios para las cartas (dragstart, dragend).
 */
function setListenersCartas() {
	const cartas = document.querySelectorAll('.carta'); // Selección de todas las cartas

	cartas.forEach(carta => {
		carta.addEventListener('dragstart', (event) => handleDragStart(event, carta));
		carta.addEventListener('dragend', (event) => handleDragEnd(carta));
	});

	/**
	 * Maneja el inicio del arrastre.
	 * @param {DragEvent} event - Evento de arrastre.
	 * @param {HTMLElement} carta - Elemento de la carta.
	 */
	function handleDragStart(event, carta) {
		const parentTapete = carta.parentElement;
		if (parentTapete === tapetes.inicial || parentTapete === tapetes.sobrantes) {
			event.dataTransfer.setData('text/plain', carta.id); // Almacena el ID
			carta.style.opacity = '0.5'; // Indica que está siendo arrastrada
		} else {
			event.preventDefault(); // Bloquea arrastre si no es válido
		}
	}

	/**
	 * Restaura la opacidad al finalizar el arrastre.
	 * @param {HTMLElement} carta - Elemento de la carta.
	 */
	function handleDragEnd(carta) {
		carta.style.opacity = '1'; // Restaura opacidad
	}
}


/**
 * Agrega los eventos necesarios a los tapetes (dragenter, dragover, dragleave, drop).
 */
function setListenersTapetes() {
	const tapetes = document.querySelectorAll('.tapete'); // Selección de todos los tapetes

	tapetes.forEach(tapete => {
		tapete.addEventListener('dragenter', (event) => handleDragEnter(event, tapete));
		tapete.addEventListener('dragover', handleDragOver);
		tapete.addEventListener('dragleave', (event) => handleDragLeave(tapete));
		tapete.addEventListener('drop', (event) => handleDrop(event, tapete));
	});

	/**
	 * Cambia el estilo al entrar el arrastre.
	 * @param {DragEvent} event - Evento de entrada.
	 * @param {HTMLElement} tapete - Tapete actual.
	 */
	function handleDragEnter(event, tapete) {
		if (tapete !== tapetes.inicial) {
			event.preventDefault(); // Necesario para permitir drop
			tapete.style.backgroundColor = 'lightyellow'; // Destaca el tapete
		}
	}

	/**
	 * Permite el arrastre sobre el tapete.
	 * @param {DragEvent} event - Evento de arrastre.
	 */
	function handleDragOver(event) {
		event.preventDefault(); // Habilita drop
	}

	/**
	 * Restaura el estilo al salir del arrastre.
	 * @param {HTMLElement} tapete - Tapete actual.
	 */
	function handleDragLeave(tapete) {
		tapete.style.backgroundColor = ''; // Restaura color original
	}

	/**
	 * Maneja el soltar de una carta sobre un tapete.
	 * @param {DragEvent} event - Evento de drop.
	 * @param {HTMLElement} tapete - Tapete actual.
	 */
	function handleDrop(event, tapete) {
		event.preventDefault(); // Evita comportamiento predeterminado

		const cartaId = event.dataTransfer.getData('text/plain');
		const carta = document.getElementById(cartaId);
		tapete.style.backgroundColor = ''; // Restaura color original

		if (puedeMoverCarta(carta, tapete)) {
			moverCarta(carta, tapete);

			if (mazos.inicial.length === 0 && mazos.sobrantes.length > 0) {
				recargarTapeteInicial(); // Recarga si corresponde
			}

			if (mazos.inicial.length == 0 && mazos.sobrantes.length == 0) {
				alert("¡Felicidades, has ganado el juego!");
				clearInterval(temporizador);
			}
		}
	}

	/**
	 * Mueve una carta de un tapete a otro.
	 * @param {HTMLElement} carta - Carta a mover.
	 * @param {HTMLElement} tapeteDestino - Tapete de destino.
	 */
	function moverCarta(carta, tapeteDestino) {
		const mazoDestino = obtenerMazoDesdeTapete(tapeteDestino);
		const mazoOrigen = obtenerMazoDesdeTapete(carta.parentElement);

		mazoOrigen.pop();
		mazoDestino.push(carta);

		decContador(carta.parentElement.querySelector(".contador"));
		carta.style.top = "0px";
		carta.style.left = "0px";
		carta.style.zIndex = tapeteDestino.children.length;

		tapeteDestino.appendChild(carta);
		incContador(contadores.movimientos);
		incContador(tapeteDestino.querySelector(".contador"));
	}
}


/**
 * Elimina todas las cartas de un tapete.
 * @param {HTMLElement} tapete - El tapete del que se eliminarán las cartas.
 */
function limpiarCartas(tapete) {
	Array.from(tapete.children).forEach(child => {
		if (child.tagName === "IMG") {
			tapete.removeChild(child);
		}
	});
}


/**
 * Verifica si se puede mover una carta al tapete destino según las reglas del juego.
 * @param {HTMLElement} carta - La carta que se intenta mover.
 * @param {HTMLElement} tapeteDestino - El tapete al que se intenta mover la carta.
 * @returns {boolean} - Retorna verdadero si la carta se puede mover, falso si no.
 */
function puedeMoverCarta(carta, tapeteDestino) {
	const numero = parseInt(carta.dataset.numero); // Número de la carta
	const palo = carta.dataset.palo; // Palo de la carta
	const colorCarta = obtenerColorPalo(palo); // Color de la carta

	// Si el tapete destino es el tapete de sobrantes, siempre es permitido
	if (tapeteDestino === tapetes.sobrantes) {
		return true;
	}

	// Si el tapete destino está vacío, solo se puede colocar un 12 en los receptores
	if (tapeteDestino.children.length === 1) {
		return tapeteDestino.classList.contains('receptor') && numero === 12;
	}

	// Si el tapete destino tiene cartas, obtenemos la carta superior para comparar
	const cartaSuperior = tapeteDestino.querySelector('img:last-child');
	const numeroSuperior = parseInt(cartaSuperior.dataset.numero);
	const paloSuperior = cartaSuperior.dataset.palo;
	const colorSuperior = obtenerColorPalo(paloSuperior);

	// Las reglas: La carta debe ser una secuencia decreciente (número - 1) y de color alternativo
	return ((numero === numeroSuperior - 1) && (colorCarta !== colorSuperior));
}


/**
 * Obtiene el color del palo de una carta.
 * "viu" y "cua" son naranjas; "hex" y "cir" son grises.
 * @param {string} palo - El palo de la carta.
 * @returns {string} - El color correspondiente al palo.
 */
function obtenerColorPalo(palo) {
	return ['viu', 'cua'].includes(palo) ? 'naranja' : 'gris';
}


/**
 * Obtiene el mazo correspondiente a un tapete dado.
 * @param {HTMLElement} tapete - El tapete cuyo mazo queremos obtener.
 * @returns {Array} - El mazo correspondiente.
 */
function obtenerMazoDesdeTapete(tapete) {
	const tapetesMap = {
		'inicial': mazos.inicial,
		'sobrantes': mazos.sobrantes,
		'receptor1': mazos.receptor1,
		'receptor2': mazos.receptor2,
		'receptor3': mazos.receptor3,
		'receptor4': mazos.receptor4,
	};

	return tapetesMap[tapete.id] || [];
}

/**
 * Verifica si el tapete inicial está vacío y recarga con cartas sobrantes si están disponibles.
 */
function recargarTapeteInicial() {
	if (mazos.sobrantes.length > 0) {
		// Barajar y mover cartas al tapete inicial
		barajar(mazos.sobrantes);
		mazos.inicial.push(...mazos.sobrantes);
		mazos.sobrantes.length = 0; // Vaciar el mazo de sobrantes

		// Actualizar visualmente el tapete y los contadores
		cargarTapeteInicial(mazos.inicial);
		setContador(contadores.inicial, mazos.inicial.length);
		setContador(contadores.sobrantes, 0);
	}
}
