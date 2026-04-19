(function (global) {
    function initSectionIntros(options = {}) {
        const {
            selector = '[data-section-intro]',
            threshold = 0.3,
            rootMargin = '0px 0px -10% 0px',
        } = options;

        const intros = document.querySelectorAll(selector);
        if (!intros.length) {
            return {
                intros,
                observer: null,
                runIntro: () => {},
            };
        }

        function revealSectionTarget(targetId) {
            if (!targetId) {
                return;
            }

            const target = document.getElementById(targetId);
            if (!target) {
                return;
            }

            target.classList.add('is-ready');
        }

        function runIntro(intro) {
            if (!intro || intro.dataset.introStarted === 'true') {
                return;
            }

            intro.dataset.introStarted = 'true';

            const command = intro.dataset.command || '';
            const targetId = intro.dataset.target || '';
            const typewriterEl = intro.querySelector('[data-section-typewriter]');
            const typeSpeed = Number(intro.dataset.typeSpeed || 14);
            const pauseAfterType = Number(intro.dataset.pauseAfterType || 180);
            const startDelay = Number(intro.dataset.startDelay || 0);
            let charIndex = 0;

            function finishIntro() {
                revealSectionTarget(targetId);
            }

            function typeCommand() {
                if (!typewriterEl || !command) {
                    finishIntro();
                    return;
                }

                typewriterEl.textContent = command.substring(0, charIndex + 1);
                charIndex++;

                if (charIndex === command.length) {
                    setTimeout(finishIntro, pauseAfterType);
                    return;
                }

                setTimeout(typeCommand, typeSpeed);
            }

            setTimeout(typeCommand, startDelay);
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                }

                runIntro(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold, rootMargin });

        intros.forEach(intro => observer.observe(intro));

        return {
            intros,
            observer,
            runIntro,
        };
    }

    global.initSectionIntros = initSectionIntros;
})(typeof window !== 'undefined' ? window : globalThis);
