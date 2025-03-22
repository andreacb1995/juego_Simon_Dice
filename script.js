/** Secuencia actual de movimientos */
let movimientos = [];

/** Número total de movimientos */
let totalMovimientos = 2;

/** Estado del sonido (true = activado) */
let sonidoActivado = false;

/** Récord máximo alcanzado */
let recordMaximo = parseInt(localStorage.getItem('simonRecord')) || 0;

/** Carga los sonidos y ajusta el volumen */
function cargarSonidos() {
    const sonidos = ['do', 'sol', 'si', 'fa'];
    sonidos.forEach(nota => {
        const audio = document.getElementById(`sonido-${nota}`);
        if (audio) {
            audio.volume = 0.3;
        }
    });
}

/** Reproduce el sonido de una nota */
function reproducirSonido(nota) {
    if (!sonidoActivado) return;
    const audio = document.getElementById(`sonido-${nota}`);
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(error => console.error('Error al reproducir:', error));
    }
}

/** Alterna el sonido */
function toggleSonido() {
    sonidoActivado = !sonidoActivado;
    const $btnSonido = $('#btnSonido');
    const $icon = $btnSonido.find('i');
    
    if (sonidoActivado) {
        $btnSonido.removeClass('muted');
        $icon.removeClass('fa-volume-mute').addClass('fa-volume-up');
    } else {
        $btnSonido.addClass('muted');
        $icon.removeClass('fa-volume-up').addClass('fa-volume-mute');
    }
}

/** Ilumina una celda y reproduce su sonido */
function iluminarCelda(celda, tiempo) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const $celda = $(`.celda[pos="${celda}"]`);
            reproducirSonido($celda.data('sound'));
            $celda.addClass('active');
            
            setTimeout(() => {
                $celda.removeClass('active');
                resolve();
            }, 300);
        }, tiempo);
    });
}

/**
 * Muestra el modal de Game Over
 */
function mostrarGameOver() {
    const nivel = totalMovimientos - 2;
    $('.nivel-final, #nivel-modal').text(nivel);
    $('#record-modal').text(recordMaximo);
    $('#modalGameOver').addClass('show');
}

/**
 * Oculta el modal de Game Over
 */
function ocultarGameOver() {
    $('#modalGameOver').removeClass('show');
}

/**
 * Genera la secuencia de movimientos recursivamente
 * @param {number} movimiento - Número actual de movimiento
 */
function establecerMovimientos(movimiento) {
    movimientos.push(Math.floor(Math.random() * 4) + 1);
    if (movimiento < totalMovimientos) {
        establecerMovimientos(++movimiento);
    }
}

/**
 * Actualiza el nivel y el récord
 */
function actualizarPuntuacion() {
    const nivel = totalMovimientos - 1;
    $('#nivel').text(nivel);
    
    if (nivel > recordMaximo) {
        recordMaximo = nivel;
        localStorage.setItem('simonRecord', recordMaximo);
        $('#record').text(recordMaximo);
        $('#nivel').addClass('level-up');
        setTimeout(() => $('#nivel').removeClass('level-up'), 500);
    }
}

/**
 * Muestra animación de éxito
 */
function mostrarExito() {
    $('#juego').addClass('success');
    setTimeout(() => $('#juego').removeClass('success'), 800);
}

/**
 * Bloquea la interacción con las celdas
 */
function bloquearCeldas() {
    $('.celda').addClass('bloqueada');
}

/**
 * Desbloquea la interacción con las celdas
 */
function desbloquearCeldas() {
    $('.celda').removeClass('bloqueada');
}

/**
 * Inicia una nueva partida
 */
function iniciarJuego() {
    movimientos = [];
    totalMovimientos = 2;
    $('#btnIniciar').hide();
    $('.juego-header').fadeIn();
    $('#btnReiniciarJuego').fadeIn();
    $('#mensaje-secuencia').show();
    $('#record').text(recordMaximo);
    
    // mensaje-secuencia inicial más claro
    $('#mensaje-secuencia').html('¡Preparado!');
    setTimeout(() => {
        $('#mensaje-secuencia').html('¡Memoriza la secuencia!');
        actualizarPuntuacion();
        generarSecuencia();
    }, 1000);
    
    bloquearCeldas();
    ocultarGameOver();
}

/**
 * Genera y muestra la secuencia de movimientos
 */
async function generarSecuencia() {
    movimientos = [];
    establecerMovimientos(1);
    
    bloquearCeldas();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (let i = 0; i < movimientos.length; i++) {
        await iluminarCelda(movimientos[i], 400);
    }
    
    $('#mensaje-secuencia').html('¡Tu turno!');
    desbloquearCeldas();
}

/**
 * Maneja el evento de click en una celda
 * @param {Event} event - Evento del click
 */
async function clickCelda(event) {
    const celdaPos = $(this).attr('pos');
    await iluminarCelda(celdaPos, 0);
    
    if (movimientos && movimientos.length) {
        if (movimientos[0] == celdaPos) {
            movimientos.shift();
            if (!movimientos.length) {
                totalMovimientos++;
                actualizarPuntuacion();
                mostrarExito();
                bloquearCeldas(); 
                setTimeout(() => {
                    generarSecuencia();
                }, 800);
            }
        } else {
            bloquearCeldas(); 
            mostrarGameOver();
        }
    }
}

// Función para reiniciar
function reiniciarJuego() {
    if ($('#btnIniciar').is(':visible')) return;
    
    movimientos = [];
    totalMovimientos = 2;
    actualizarPuntuacion();
    
    $('#mensaje-secuencia').html('¡Empezando de nuevo!');
    setTimeout(() => {
        $('#mensaje-secuencia').html('¡Memoriza la secuencia!');
        generarSecuencia();
    }, 1000);
}

// Inicialización del juego
$(document).ready(function() {
    cargarSonidos();
    $('#btnIniciar, #btnReiniciar').on('click', iniciarJuego);
    $('#btnReiniciarJuego').on('click', reiniciarJuego);
    $('.celda').on('click', clickCelda);
    $('#btnSonido').on('click', toggleSonido);
});




