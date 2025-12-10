/**
 * CELF - Main Canvas
 * 메인 Canvas 파티클 + 오디오 반응형 + 텍스트 파동 구현
 */

const PARTICLE_COLORS = ['#ffffff', '#ff4545', '#050505'];
const RIPPLE_DELAY_FRAMES = 30; // 약 0.5초 간격 (60fps 기준)

function getThemeMode() {
    return document.documentElement.getAttribute('data-theme') || 'light';
}

class Particle {
    constructor(canvas, audioData) {
        this.canvas = canvas;
        this.audioData = audioData;
        this.reset();
        this.wobbleSeed = Math.random() * Math.PI * 2;
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.baseSize = Math.random() * 0.8 + 0.15;
        this.size = this.baseSize;
        this.velocityX = (Math.random() - 0.5) * 0.15;
        this.velocityY = (Math.random() - 0.5) * 0.15;
        this.color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
        this.opacity = Math.random() * 0.25 + 0.15;
        this.multiplier = Math.random() * 0.9 + 0.4;
    }

    update() {
        const level = this.audioData?.average || 0;
        this.x += this.velocityX + Math.sin(this.wobbleSeed + performance.now() * 0.0003) * 0.05;
        this.y += this.velocityY + Math.cos(this.wobbleSeed + performance.now() * 0.0005) * 0.05;

        if (this.x <= 0 || this.x >= this.canvas.width) this.velocityX *= -1;
        if (this.y <= 0 || this.y >= this.canvas.height) this.velocityY *= -1;

        this.size = this.baseSize + level * this.multiplier * 5;
        this.currentOpacity = Math.min(0.65, this.opacity + level * 0.5);
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.currentOpacity || this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Ripple {
    constructor(x, y, canvas, delayFrames = 0, scaleRange = { min: 0.05, max: 0.85 }) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.radius = 0;
        const baseDimension = Math.min(canvas.width, canvas.height);
        const minScale = scaleRange.min;
        const maxScale = scaleRange.max;
        this.targetRadius = baseDimension * (minScale + Math.random() * (maxScale - minScale));
        this.opacity = 0.97;
        this.speed = 0.25 + Math.random() * 0.25;
        this.delayFrames = delayFrames;
    }

    update(audioBoost = 0) {
        if (this.delayFrames > 0) {
            this.delayFrames -= 1;
            return true;
        }

        const boost = audioBoost * 6;
        this.radius += (this.speed + boost) * 0.5;
        this.opacity -= 0.0018 + audioBoost * 0.01;
        return this.opacity > 0 && this.radius < this.targetRadius;
    }

    draw(ctx) {
        if (this.delayFrames > 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(this.opacity, 0);
        const theme = getThemeMode();
        ctx.strokeStyle = theme === 'dark'
            ? 'rgba(255, 255, 255, 1)'
            : 'rgba(5, 5, 5, 0.95)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

class Wave {
    constructor(x, y, canvas) {
        this.ripples = [];
        const minScaleBase = 0.03 + Math.random() * 0.07;
        const maxScaleBase = minScaleBase + 0.2 + Math.random() * 0.5;
        for (let i = 0; i < 5; i++) {
            this.ripples.push(new Ripple(
                x,
                y,
                canvas,
                i * RIPPLE_DELAY_FRAMES,
                {
                    min: Math.max(0.02, minScaleBase + i * 0.02),
                    max: Math.min(0.95, maxScaleBase + i * 0.05)
                }
            ));
        }
    }

    update(audioBoost) {
        this.ripples = this.ripples.filter(ripple => ripple.update(audioBoost));
        return this.ripples.length > 0;
    }

    draw(ctx) {
        this.ripples.forEach(ripple => ripple.draw(ctx));
    }
}

export function initMainCanvas() {
    const canvas = document.getElementById('mainCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let waves = [];
    let audioData = { average: 0, dataArray: [] };
    let audioReady = false;
    let lastWaveTime = 0;
    const waveCooldown = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }

    function initParticles() {
        const particleCount = Math.max(150, Math.min(320, Math.floor((canvas.width * canvas.height) / 9000)));
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(canvas, audioData));
        }
    }

    function initAudioAnalysis() {
        const audioElement = document.getElementById('audioSource');
        if (!audioElement) {
            console.warn('오디오 소스를 찾을 수 없습니다. 오디오 반응형이 비활성화됩니다.');
            return;
        }

        if (!window.AudioContext && !window.webkitAudioContext) {
            console.warn('AudioContext를 지원하지 않는 브라우저입니다.');
            return;
        }

        // 오디오 파일 로드 확인
        audioElement.addEventListener('error', (e) => {
            console.warn('오디오 파일 로드 실패:', e);
            console.warn('오디오 파일 경로를 확인해주세요:', audioElement.src);
        });

        audioElement.addEventListener('canplaythrough', () => {
            console.log('오디오 파일 로드 완료');
        });

        // 오디오 파일이 로드되지 않았을 경우를 대비한 재시도 로직
        const checkAudioLoaded = () => {
            if (audioElement.readyState >= 2) { // HAVE_CURRENT_DATA 이상
                return true;
            }
            return false;
        };

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaElementSource(audioElement);

            analyser.fftSize = 256;
            source.connect(analyser);
            analyser.connect(audioContext.destination);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            function updateAudioData() {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength / 255;
                audioData.average = average;
                audioData.dataArray = dataArray;
            }

        const startAudio = () => {
            if (audioReady) return;
            
            // AudioContext가 suspended 상태일 수 있으므로 resume
            if (audioContext.state === 'suspended') {
                audioContext.resume().catch(err => {
                    console.warn('AudioContext resume 실패:', err);
                });
            }
            
            // 오디오 파일이 로드되었는지 확인
            if (!checkAudioLoaded()) {
                console.warn('오디오 파일이 아직 로드되지 않았습니다. 잠시 후 다시 시도합니다.');
                // 오디오 로드 대기
                const loadHandler = () => {
                    audioElement.removeEventListener('canplaythrough', loadHandler);
                    startAudio();
                };
                audioElement.addEventListener('canplaythrough', loadHandler);
                
                // 타임아웃 설정 (5초 후 포기)
                setTimeout(() => {
                    audioElement.removeEventListener('canplaythrough', loadHandler);
                    if (!audioReady) {
                        console.error('오디오 파일을 로드할 수 없습니다. 파일 경로와 파일 존재 여부를 확인해주세요.');
                        console.error('현재 오디오 소스:', audioElement.src);
                        console.error('오디오 readyState:', audioElement.readyState);
                    }
                }, 5000);
                return;
            }

            audioElement.play()
                .then(() => {
                    audioReady = true;
                    console.log('오디오 재생 시작');
                })
                .catch(err => {
                    console.warn('오디오 재생 실패:', err);
                    console.warn('오디오 파일 경로:', audioElement.src);
                    console.warn('오디오 readyState:', audioElement.readyState);
                    // 사용자에게 알림 (선택사항)
                    if (err.name === 'NotAllowedError') {
                        console.warn('브라우저가 오디오 재생을 허용하지 않았습니다. 페이지를 클릭/터치해주세요.');
                    } else if (err.name === 'NotSupportedError') {
                        console.error('오디오 형식이 지원되지 않습니다. 다른 형식의 오디오 파일을 사용해주세요.');
                    }
                });
        };

        const interactionHandler = () => {
            startAudio();
            document.removeEventListener('click', interactionHandler);
            document.removeEventListener('touchstart', interactionHandler);
        };

        document.addEventListener('click', interactionHandler);
        document.addEventListener('touchstart', interactionHandler);

            setInterval(updateAudioData, 50);
        } catch (error) {
            console.warn('오디오 분석 초기화 실패:', error);
        }
    }

    function triggerWave(x, y) {
        const now = performance.now();
        if (now - lastWaveTime < waveCooldown) return;
        lastWaveTime = now;
        waves.push(new Wave(x, y, canvas));
    }

    // 텍스트 페이드아웃 함수
    let hasTextFadedOut = false;
    function fadeOutHeroText() {
        if (hasTextFadedOut) return;
        const heroInfo = document.querySelector('.prime-hero-info');
        if (heroInfo) {
            hasTextFadedOut = true;
            heroInfo.style.transition = 'opacity 1s ease-out';
            heroInfo.style.opacity = '0';
        }
    }

    function handlePointerWave(event) {
        fadeOutHeroText();
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        triggerWave(x, y);
    }

    function handleTouchWave(event) {
        fadeOutHeroText();
        event.preventDefault();
        const touch = event.touches[0];
        if (!touch) return;
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        triggerWave(x, y);
    }

    function drawOverlayTexts() {
        if (audioReady) return;
        const theme = getThemeMode();
        const callout = theme === 'dark' ? 'rgba(255, 69, 69, 0.95)' : 'rgba(200, 0, 0, 0.9)';
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = callout;
        ctx.font = '600 16px "Pretendard", sans-serif';
        ctx.fillText('터치해서 사운드를 켜주세요', canvas.width / 2, canvas.height * 0.12);
        ctx.restore();
    }

    function animate() {
        const audioLevel = audioData?.average || 0;
        const theme = getThemeMode();
        if (theme === 'dark') {
            const darkness = Math.min(0.9, 0.55 + audioLevel * 0.35);
            ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
        } else {
            const wash = Math.min(0.6, 0.18 + audioLevel * 0.25);
            ctx.fillStyle = `rgba(255, 255, 255, ${wash})`;
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw(ctx);
        });

        waves = waves.filter(wave => {
            const active = wave.update(audioLevel);
            if (active) {
                wave.draw(ctx);
            }
            return active;
        });

        drawOverlayTexts();
        requestAnimationFrame(animate);
    }

    resizeCanvas();
    initAudioAnalysis();
    animate();

    window.addEventListener('resize', () => {
        resizeCanvas();
    });

    canvas.addEventListener('click', handlePointerWave);
    canvas.addEventListener('touchstart', handleTouchWave);

    const primeCell = document.getElementById('primeCell');
    if (primeCell) {
        primeCell.addEventListener('click', (e) => {
            fadeOutHeroText();
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            triggerWave(x, y);
        });
    }
}

