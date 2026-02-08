
// GSAP and ScrollTrigger are loaded via CDN in index.html
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}


document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Logic
    const toggleBtn = document.getElementById('theme-toggle');
    const blueBtn = document.getElementById('blue-mode-toggle');
    const html = document.documentElement;
    const icon = toggleBtn.querySelector('svg');

    // Function to activate theme
    const setTheme = (theme) => {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateIcon(theme);
    };

    // Check for saved preference
    const savedTheme = localStorage.getItem('theme') || 'blue';
    setTheme(savedTheme);

    // Blue Mode Button Listener
    if (blueBtn) {
        blueBtn.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            if (currentTheme === 'blue') {
                setTheme('light'); // Return to light if clicked again
            } else {
                setTheme('blue');
            }
        });
    }

    // Main Toggle Listener (Light/Dark)
    toggleBtn.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        // If Light -> Go Dark
        // If Dark or Blue -> Go Light
        if (currentTheme === 'light') {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    });

    function updateIcon(theme) {
        // If theme is 'light', we want to go to Dark -> Show Moon
        // If theme is 'dark' or 'blue', we want to go to Light -> Show Sun
        if (theme === 'light') {
            // Moon icon (indicates switch to dark)
            icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        } else {
            // Sun icon (indicates switch to light)
            icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        }
    }

    initLoader();
    initCursor();
    initAnimations();
    initLenis();
    initSplitTextReveals();
    initScrollStagger();
    initMagneticButtons();
    initOrbitalSystem();
    initLiquidSphere(); // New Liquid Grid Effect
    initMarquee();
    initSmartNavbar();
    initProjectSheet();
});

function initLiquidSphere() {
    const container = document.getElementById('liquid-container');
    if (!container || typeof THREE === 'undefined') return;

    // Limpa canvas antigo se houver recarregamento
    while (container.firstChild) {
        if (container.firstChild.className !== 'circle-inner') {
            container.removeChild(container.firstChild);
        } else {
            break;
        }
    }

    const width = 250;
    const height = 250;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Insere o canvas ANTES do ponto central
    container.insertBefore(renderer.domElement, container.firstChild);

    // --- SHADERS CALIBRADOS PARA VISIBILIDADE ---
    // --- SHADERS CALIBRADOS PARA VISIBILIDADE ---
    const vertexShader = `
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uHover;

        void main() {
            vUv = uv;
            vec3 pos = position;
            float dist = distance(uv, uMouse);
            
            // Onda mais pronunciada (multiplicadores aumentados)
            float wave = sin(dist * 12.0 - uTime * 2.5) * (1.0 - smoothstep(0.0, 1.0, dist));
            
            // A distorção agora é mais visível
            pos.z += wave * uHover * 30.0; 
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `;

    const fragmentShader = `
        varying vec2 vUv;
        uniform vec3 uColor;
        
        void main() {
            // Grade mais densa
            float scale = 18.0; 
            vec2 grid = fract(vUv * scale);
            
            // Linhas levemente mais grossas (0.92 em vez de 0.95)
            float line = step(0.92, grid.x) + step(0.92, grid.y);
            
            // Máscara circular
            float dist = distance(vUv, vec2(0.5));
            float mask = 1.0 - smoothstep(0.48, 0.5, dist);

            // AUMENTO DE OPACIDADE: Mudamos de 0.3 para 0.6 para ser visível no escuro
            gl_FragColor = vec4(uColor, line * mask * 0.6); 
        }
    `;

    // Função auxiliar para pegar a cor correta
    const getThemeColor = () => {
        const style = getComputedStyle(document.body);
        // Garante que pegamos a cor do texto (Preto no light, Branco no dark)
        return style.getPropertyValue('--text-primary').trim();
    };

    const uniforms = {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uHover: { value: 0 },
        uColor: { value: new THREE.Color(getThemeColor()) }
    };

    const geometry = new THREE.PlaneGeometry(width, height, 48, 48); // Mais polígonos para suavidade
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // --- INTERAÇÃO ---
    let targetHover = 0;

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / width;
        const y = 1.0 - (e.clientY - rect.top) / height;
        uniforms.uMouse.value.set(x, y);
        targetHover = 1.2; // Intensidade extra no movimento
    });

    container.addEventListener('mouseleave', () => {
        targetHover = 0;
    });

    // --- DARK MODE LISTENER ---
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                // Atualiza a cor da grade imediatamente ao trocar o tema
                uniforms.uColor.value = new THREE.Color(getThemeColor());
            }
        });
    });
    observer.observe(document.documentElement, { attributes: true });

    // --- LOOP ---
    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);
        uniforms.uTime.value = clock.getElapsedTime();
        // Lerp suave
        uniforms.uHover.value += (targetHover - uniforms.uHover.value) * 0.08;
        renderer.render(scene, camera);
    };
    animate();
}

function initSmartNavbar() {
    const nav = document.querySelector('.nav');
    let lastScrollY = 0;

    ScrollTrigger.create({
        start: 'top top',
        end: 99999,
        onUpdate: (self) => {
            const currentScrollY = self.scroll();

            // Show if scrolling up or at the very top (within buffer)
            if (currentScrollY < lastScrollY || currentScrollY < 50) {
                nav.classList.remove('nav-hidden');
            } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // Hide if scrolling down and not at top
                nav.classList.add('nav-hidden');
            }

            lastScrollY = currentScrollY;
        }
    });
}

function initLenis() {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });
    window.lenis = lenis;

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    lenis.scrollTo(targetElement, {
                        offset: 0,
                        duration: 2.0, // Slower, smoother scroll for anchors
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                        immediate: false
                    });
                }
            }
        });
    });
}

// Helper: Split text into spans for animation
function splitText(element) {
    if (!element) return;
    const text = element.innerText;
    element.innerHTML = '';
    text.split('').forEach(char => {
        const span = document.createElement('span');
        span.innerText = char;
        if (char === ' ') span.innerHTML = '&nbsp;';
        span.style.display = 'inline-block';
        span.style.transform = 'translateY(100%)';
        span.style.opacity = '0';
        span.style.transition = 'none'; // let GSAP handle it
        element.appendChild(span);
    });
}

function initSplitTextReveals() {
    // Select only main titles, excluding nested spans from the initial selection to avoid double-binding
    const titles = document.querySelectorAll('.projects-title, .about-title, .contact-title');

    titles.forEach(title => {
        const chars = [];

        // Helper to create the animated span
        const wrapChar = (char) => {
            const span = document.createElement('span');
            span.innerHTML = char === ' ' ? '&nbsp;' : char;
            span.style.display = 'inline-block';
            span.style.opacity = '0';
            span.style.transform = 'translateY(50px)';
            span.style.transition = 'none';
            return span;
        };

        // Process child nodes to handle mixed content (text + spans)
        const nodes = Array.from(title.childNodes);

        nodes.forEach(node => {
            if (node.nodeType === 3) { // Text Node
                const text = node.textContent;
                // If it's just a newline or empty, ignore, unless it's a significant space
                if (text.trim().length === 0 && !text.includes(' ')) return;

                const fragment = document.createDocumentFragment();
                text.split('').forEach(char => {
                    const span = wrapChar(char);
                    fragment.appendChild(span);
                    chars.push(span);
                });
                node.replaceWith(fragment);

            } else if (node.nodeType === 1) { // Element Node
                if (node.tagName === 'BR') {
                    chars.push(node); // Keep specific order if needed, or just ignore
                    return;
                }

                const text = node.innerText;
                node.innerHTML = ''; // Clear content
                text.split('').forEach(char => {
                    const span = wrapChar(char);
                    node.appendChild(span); // Append to the container to keep style
                    chars.push(span);
                });
            }
        });

        // Animate all chars collected from this title
        gsap.to(chars, {
            scrollTrigger: {
                trigger: title,
                start: "top 85%",
            },
            y: 0,
            opacity: 1,
            stagger: 0.03,
            duration: 1,
            ease: "power3.out"
        });
    });
}

function initScrollStagger() {
    // Projects Stagger
    const projects = document.querySelectorAll('.project-item');
    gsap.fromTo(projects,
        { y: 50, opacity: 0 },
        {
            scrollTrigger: {
                trigger: '.projects-list', // Updated trigger
                start: "top 75%",
            },
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 1.2,
            ease: "power3.out"
        }
    );

    // Contact Items Stagger
    const contactItems = document.querySelectorAll('.contact-item');
    gsap.fromTo(contactItems,
        { y: 30, opacity: 0 },
        {
            scrollTrigger: {
                trigger: '.contact-links-grid',
                start: "top 85%",
            },
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 1,
            ease: "power2.out"
        }
    );
}

function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-rounded, .nav-pill, .view-all');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(btn, {
                x: x * 0.3, // Magnetic pull strength
                y: y * 0.3,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });
}

function initOrbitalSystem() {
    const canvas = document.getElementById('hero-blob');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

    // --- CONFIGURAÇÃO (Geometria e Velocidade Lenta) ---
    const config = {
        orbitRadiusOuter: 0, // Definido no resize
        orbitRadiusInner: 0, // Definido no resize
        coreRadius: 5,       // Fixo pequeno
        satelliteRadius: 8,  // Aumentado um pouco conforme pedido
        speedOuter: 0.002,   // Slow motion
        speedInner: -0.003,  // Slow motion
        coreSpeed: 0.005,
    };

    let angleOuter = 0;
    let angleInner = 0;
    let angleCore = 0;

    // --- HELPER MATEMÁTICO ---
    // Mapeia um valor de um intervalo para outro (ex: distância para brilho 0-255)
    const mapRange = (value, inMin, inMax, outMin, outMax) => {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    // --- GERENCIAMENTO DE CORES ---
    const getThemeColors = () => {
        const style = getComputedStyle(document.body);
        const isDark = currentTheme === 'dark';
        return {
            colorCore: style.getPropertyValue('--text-primary').trim(),
            colorOrbit: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(26, 26, 26, 0.08)',
            colorFlat: style.getPropertyValue('--text-primary').trim()
        };
    };
    let colors = getThemeColors();

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                currentTheme = document.documentElement.getAttribute('data-theme');
                colors = getThemeColors();
            }
        });
    });
    observer.observe(document.documentElement, { attributes: true });

    // --- RESIZE ---
    const resize = () => {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width * 2;
        canvas.height = height * 2;
        ctx.scale(2, 2);
        const minDim = Math.min(width, height);
        // AUMENTADO DE 12 PARA 35 PARA AFASTAR DA BORDA
        config.orbitRadiusOuter = (minDim / 2) - 35;

        // Mantém o espaçamento interno generoso (0.5)
        config.orbitRadiusInner = config.orbitRadiusOuter * 0.5;
    };
    window.addEventListener('resize', resize);
    resize();

    // --- FUNÇÕES DE DESENHO ---

    // 1. O SOL (Bolinha Externa - Fonte de Luz Fixa)
    const drawSun = (x, y, r) => {
        if (currentTheme !== 'dark') {
            // Light Mode: Flat
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = colors.colorFlat;
            ctx.fill();
            return;
        }
        // Dark Mode: Brilhante
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.shadowBlur = 40; // Aumentado de 20 para 40
        ctx.fill();
        ctx.shadowBlur = 0;
    };

    // 2. A LUA (Bolinha Interna - Fases Dinâmicas)
    const drawLitMoon = (moonX, moonY, r, sunX, sunY) => {
        if (currentTheme !== 'dark') {
            // Light Mode: Flat
            ctx.beginPath();
            ctx.arc(moonX, moonY, r, 0, Math.PI * 2);
            ctx.fillStyle = colors.colorFlat;
            ctx.fill();
            return;
        }

        // DARK MODE: FÍSICA DE LUZ DINÂMICA

        // A. Calcular Ângulo (Direção da Luz)
        const dx = sunX - moonX;
        const dy = sunY - moonY;
        const angle = Math.atan2(dy, dx);

        // B. Calcular Distância (Intensidade da Luz)
        // Math.hypot é a forma mais rápida de calcular distância euclidiana
        const dist = Math.hypot(dx, dy);

        // Definir limites aproximados de distância no sistema
        const minDist = config.orbitRadiusOuter - config.orbitRadiusInner;
        const maxDist = config.orbitRadiusOuter + config.orbitRadiusInner;

        // Mapear distância para intensidade de brilho (RGB 0-255)
        // Perto (minDist) = Brilhante (255). Longe (maxDist) = Escuro (60).
        let brightness = mapRange(dist, minDist, maxDist, 255, 90);
        // Clamp para garantir limites
        brightness = Math.max(60, Math.min(255, brightness));
        brightness = Math.floor(brightness);

        // Cria a cor dinâmica da luz
        const dynamicLightColor = `rgb(${brightness},${brightness},${brightness})`;


        // C. Desenhar Gradiente
        // Desloca o ponto de luz na direção do Sol
        const lightX = moonX + Math.cos(angle) * (r * 0.5);
        const lightY = moonY + Math.sin(angle) * (r * 0.5);

        const gradient = ctx.createRadialGradient(lightX, lightY, 0, moonX, moonY, r);

        // Usa a cor dinâmica baseada na distância no ponto zero
        gradient.addColorStop(0, dynamicLightColor);

        // A sombra começa mais cedo quando está longe para simular fase crescente
        const shadowStart = mapRange(dist, minDist, maxDist, 0.4, 0.2);
        gradient.addColorStop(shadowStart, '#333333');
        gradient.addColorStop(1, '#1a1a1a'); // Fundo

        ctx.beginPath();
        ctx.arc(moonX, moonY, r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    };

    // --- RENDER LOOP ---
    const render = () => {
        ctx.clearRect(0, 0, width, height);
        const cx = width / 2;
        const cy = height / 2;

        angleOuter += config.speedOuter;
        angleInner += config.speedInner;
        angleCore += config.coreSpeed;

        // Calcular posições
        const sunX = cx + Math.cos(angleOuter) * config.orbitRadiusOuter;
        const sunY = cy + Math.sin(angleOuter) * config.orbitRadiusOuter;
        const moonX = cx + Math.cos(angleInner) * config.orbitRadiusInner;
        const moonY = cy + Math.sin(angleInner) * config.orbitRadiusInner;

        // Desenhar Linhas
        ctx.strokeStyle = colors.colorOrbit;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, config.orbitRadiusInner, 0, Math.PI * 2);
        ctx.setLineDash([2, 8]); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, config.orbitRadiusOuter, 0, Math.PI * 2);
        ctx.setLineDash([2, 10]); ctx.stroke(); ctx.setLineDash([]);

        // Desenhar Core
        ctx.save(); ctx.translate(cx, cy); ctx.beginPath();
        ctx.arc(0, 0, config.coreRadius, 0, Math.PI * 2);
        ctx.fillStyle = colors.colorCore; ctx.fill(); ctx.restore();

        // Desenhar Lua Dinâmica (Passando posições)
        drawLitMoon(moonX, moonY, config.satelliteRadius, sunX, sunY);

        // Desenhar Sol
        drawSun(sunX, sunY, config.satelliteRadius);

        requestAnimationFrame(render);
    };
    render();
}

function initMarquee() {
    // Marquee text (Move slightly faster/slower)
    gsap.to('.marquee-track', {
        scrollTrigger: {
            trigger: '.marquee',
            start: "top bottom",
            end: "bottom top",
            scrub: true
        },
        x: "-5%" // Additional movement on scroll
    });
}

function initLoader() {
    const loader = document.querySelector('.loader');
    const nameSpans = document.querySelectorAll('.loader-name span');

    // Animate letters in
    gsap.to(nameSpans, {
        y: 0,
        stagger: 0.05,
        duration: 0.8,
        ease: "power3.out",
        onComplete: () => {
            setTimeout(() => {
                loader.classList.add('exit');
                // Trigger hero entrance after loader exits
                setTimeout(revealHero, 500);
            }, 1000);
        }
    });
}

function revealHero() {
    const tl = gsap.timeline();
    tl.to('.hero-title-line span', {
        y: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: "power3.out"
    })
        .to('.hero-description, .hero-cta, .hero-scroll', {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.8
        }, "-=0.8");
}

function initCursor() {
    const cursor = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    const circle = document.querySelector('.cursor-circle');

    window.addEventListener('mousemove', (e) => {
        gsap.to(dot, {
            x: e.clientX,
            y: e.clientY,
            xPercent: -50,
            yPercent: -50,
            duration: 0.1
        });
        gsap.to(circle, {
            x: e.clientX,
            y: e.clientY,
            xPercent: -50,
            yPercent: -50,
            duration: 0.5,
            ease: "power2.out"
        });
    });

    // Hover effects
    document.querySelectorAll('a, button, .hoverable, .contact-item').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            // Scale circle on hover
            gsap.to(circle, { scale: 1.5, duration: 0.3 });
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            gsap.to(circle, { scale: 1, duration: 0.3 });
        });
    });
}

function initAnimations() {
    // Kept for generic reveal classes if used
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
        gsap.fromTo(el,
            { y: 50, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                },
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out"
            }
        );
    });
}

function initProjectSheet() {
    // Sheet structure is in luxury.html


    // 2. Select Elements
    const overlay = document.querySelector('.project-sheet-overlay');
    const sheet = document.querySelector('.project-sheet');
    const closeBtn = document.querySelector('.sheet-close');
    const titleEl = document.querySelector('.sheet-title');
    const bodyEl = document.querySelector('.sheet-body');
    const imageContainer = document.querySelector('.sheet-image-container');
    const imageEl = document.querySelector('.sheet-image');
    const metaEl = document.querySelector('.sheet-meta');

    const triggers = document.querySelectorAll('.project-trigger');

    // 3. Open Function
    function openSheet(data) {
        titleEl.textContent = data.title;
        bodyEl.textContent = data.desc;
        if (data.image && data.image !== "") {
            imageEl.src = data.image;
            imageEl.alt = data.title;
            imageContainer.style.display = 'block';
        } else {
            imageContainer.style.display = 'none';
        }

        // Clear and add tags
        metaEl.innerHTML = '';
        if (data.tags) {
            data.tags.split(',').forEach(tag => {
                const span = document.createElement('span');
                span.classList.add('project-tag');
                span.textContent = tag.trim();
                metaEl.appendChild(span);
            });
        }



        overlay.classList.add('is-visible');
        sheet.classList.add('is-visible');
        document.body.classList.add('no-scroll');
        if (window.lenis) window.lenis.stop();
    }

    // 4. Close Function
    const closeSheet = () => {
        overlay.classList.remove('is-visible');
        sheet.classList.remove('is-visible');
        document.body.classList.remove('no-scroll');
        if (window.lenis) window.lenis.start();
    };

    // 5. Event Listeners
    triggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = btn.closest('.project-item');
            if (!item) return;

            const data = {
                title: item.dataset.title,
                desc: item.dataset.desc,
                image: item.dataset.image,
                tags: item.dataset.tags,
                link: item.dataset.link
            };
            openSheet(data);
        });
    });

    closeBtn.addEventListener('click', closeSheet);
    overlay.addEventListener('click', closeSheet);

    // Force native scroll by preventing event bubbling to Lenis
    sheet.addEventListener('wheel', (e) => {
        e.stopPropagation();
    }, { passive: false });

    // Also stop touch events propagation for mobile
    sheet.addEventListener('touchmove', (e) => {
        e.stopPropagation();
    }, { passive: false });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sheet.classList.contains('is-visible')) {
            closeSheet();
        }
    });
}
