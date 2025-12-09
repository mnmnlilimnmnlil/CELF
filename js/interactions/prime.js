/**
 * CELF - Prime Cell Interaction
 * Section 02: 프라임 세포 (공감 세포) 인터랙션
 */

/**
 * 공감 파동 파티클 클래스
 */
class EmpathyParticle {
    constructor(x, y, angle, speed) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.radius = 5;
        this.opacity = 1;
        this.life = 1;
    }
    
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life -= 0.02;
        this.opacity = this.life;
        this.radius += 0.5;
        
        return this.life > 0;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#4a90e2';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * 프라임 세포 인터랙션 초기화
 */
export function initPrime() {
    const character = document.getElementById('primeCell');
    const canvas = document.getElementById('mainCanvas');
    const heroInfo = document.querySelector('.prime-hero-info');
    const mainSection = document.getElementById('mainSection');
    
    if (!character || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId = null;
    let isHovering = false;
    let scale = 1;
    let scaleDirection = 1;
    
    /**
     * Canvas 크기 조정
     */
    function resizeCanvas() {
        const container = character.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    
    /**
     * 호버 시 부드러운 scale 반복
     */
    function handleHover() {
        isHovering = true;
        animateScale();
    }
    
    function handleLeave() {
        isHovering = false;
        scale = 1;
        character.style.transform = 'scale(1)';
    }
    
    function animateScale() {
        if (!isHovering) return;
        
        scale += 0.02 * scaleDirection;
        if (scale >= 1.15) {
            scaleDirection = -1;
        } else if (scale <= 1.05) {
            scaleDirection = 1;
        }
        
        character.style.transform = `scale(${scale})`;
        requestAnimationFrame(animateScale);
    }
    
    /**
     * 텍스트 페이드 아웃
     */
    let hasTextFadedOut = false;
    function fadeOutText() {
        if (!heroInfo || hasTextFadedOut) return;
        hasTextFadedOut = true;
        
        // transition을 1s로 설정하고 opacity를 0으로 변경
        heroInfo.style.transition = 'opacity 1s ease-out';
        heroInfo.style.opacity = '0';
    }
    
    /**
     * 공감 파동 생성
     */
    function createEmpathyWave(event) {
        // 텍스트 페이드아웃 (한 번만 실행)
        fadeOutText();
        
        const rect = canvas.getBoundingClientRect();
        const containerRect = character.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2 - rect.left;
        const centerY = containerRect.top + containerRect.height / 2 - rect.top;
        
        const particleCount = Math.floor(Math.random() * 9) + 12; // 12~20개
        const angleStep = (Math.PI * 2) / particleCount;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = angleStep * i;
            const speed = Math.random() * 3 + 2;
            particles.push(new EmpathyParticle(centerX, centerY, angle, speed));
        }
    }
    
    /**
     * 애니메이션 루프
     */
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles = particles.filter(particle => {
            const isActive = particle.update();
            if (isActive) {
                particle.draw(ctx);
            }
            return isActive;
        });
        
        animationId = requestAnimationFrame(animate);
    }
    
    /**
     * 초기화 실행
     */
    resizeCanvas();
    animate();
    
    // 이벤트 리스너
    character.addEventListener('mouseenter', handleHover);
    character.addEventListener('mouseleave', handleLeave);
    character.addEventListener('click', createEmpathyWave);
    
    window.addEventListener('resize', resizeCanvas);
    
    console.log('프라임 세포 인터랙션 초기화 완료');
}

