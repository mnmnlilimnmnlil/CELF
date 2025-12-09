/**
 * CELF - Emotion Cell Interaction
 * Section 09: 감성 세포 인터랙션
 */

/**
 * 잉크 파동 클래스
 */
class InkWave {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = Math.max(canvas.width, canvas.height) * 0.8;
        this.opacity = 0.8;
        this.speed = 4;
        this.canvas = canvas;
    }
    
    update() {
        this.radius += this.speed;
        this.opacity -= 0.015;
        
        return this.opacity > 0 && this.radius < this.maxRadius;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // 그라데이션 원형 파동
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, 'rgba(139, 69, 19, 0.6)'); // 갈색 잉크
        gradient.addColorStop(0.5, 'rgba(139, 69, 19, 0.3)');
        gradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

/**
 * 감성 세포 인터랙션 초기화
 */
export function initEmotion() {
    const character = document.getElementById('emotionCharacter');
    const canvas = document.getElementById('emotionCanvas');
    const section = document.getElementById('section09');
    if (!character || !canvas || !section) return;
    
    const ctx = canvas.getContext('2d');
    let inkWaves = [];
    let animationId = null;
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    /**
     * Canvas 크기 조정 (캐릭터 컨테이너 기준)
     */
    function resizeCanvas() {
        const container = character.parentElement; // cell-character-container
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
    }
    
    /**
     * 마우스 움직임에 잉크 번짐 효과
     */
    function createInkBlot(x, y) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'rgba(139, 69, 19, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // SVG 필터 효과 시뮬레이션 (블러)
        ctx.filter = 'blur(5px)';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = 'none';
        ctx.restore();
    }
    
    /**
     * 호버 시 색 온도 변화
     */
    function handleHover() {
        section.classList.add('emotion-warm');
    }
    
    function handleLeave() {
        section.classList.remove('emotion-warm');
    }
    
    /**
     * 클릭 시 잉크 파동 생성 (캐릭터 컨테이너 기준)
     */
    function createInkWave(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 캐릭터 영역 내에서만 생성
        const characterRect = character.getBoundingClientRect();
        const isInCharacterArea = 
            x >= characterRect.left - rect.left &&
            x <= characterRect.right - rect.left &&
            y >= characterRect.top - rect.top &&
            y <= characterRect.bottom - rect.top;
        
        if (!isInCharacterArea) return;
        
        inkWaves.push(new InkWave(x, y, canvas));
    }
    
    /**
     * 마우스 움직임 추적 (캐릭터 컨테이너 기준)
     */
    function handleMouseMove(event) {
        const canvasRect = canvas.getBoundingClientRect();
        const characterRect = character.getBoundingClientRect();
        
        // 마우스 위치를 canvas 좌표로 변환
        const x = event.clientX - canvasRect.left;
        const y = event.clientY - canvasRect.top;
        
        // 캐릭터 영역 내에서만 작동
        const isInCharacterArea = 
            event.clientX >= characterRect.left &&
            event.clientX <= characterRect.right &&
            event.clientY >= characterRect.top &&
            event.clientY <= characterRect.bottom;
        
        if (!isInCharacterArea) return;
        
        // 이전 위치와의 거리 계산
        const distance = Math.sqrt((x - lastMouseX) ** 2 + (y - lastMouseY) ** 2);
        
        // 일정 거리 이상 이동 시 잉크 생성
        if (distance > 10) {
            createInkBlot(x, y);
            lastMouseX = x;
            lastMouseY = y;
        }
    }
    
    /**
     * 애니메이션 루프
     */
    function animate() {
        // 기존 잉크 블롯은 점점 흐려지게 (매 프레임 약간씩)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 잉크 파동 업데이트 및 그리기
        inkWaves = inkWaves.filter(wave => {
            const isActive = wave.update();
            if (isActive) {
                wave.draw(ctx);
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
    
    // 캐릭터 컨테이너에서 마우스 움직임 추적
    const container = character.parentElement;
    container.addEventListener('mousemove', handleMouseMove);
    character.addEventListener('click', createInkWave);
    
    window.addEventListener('resize', resizeCanvas);
    
    console.log('감성 세포 인터랙션 초기화 완료');
}

