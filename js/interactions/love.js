/**
 * CELF - Love Cell Interaction
 * Section 05: 사랑 세포 인터랙션
 * Matter.js를 사용한 물리 기반 하트 쌓기
 */

/**
 * 사랑 세포 인터랙션 초기화
 */
export function initLove() {
    const character = document.getElementById('loveCharacter');
    const section = document.getElementById('section04');
    if (!character || !section) return;
    
    const container = character.parentElement;
    
    // Matter.js 엔진 초기화
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Body = Matter.Body;
    
    // 엔진 생성
    const engine = Engine.create();
    engine.world.gravity.y = 0.8; // 중력 설정 (조금 약하게)
    engine.world.gravity.scale = 0.001;
    
    // 렌더러는 사용하지 않고 DOM으로 직접 렌더링
    // 대신 물리 엔진만 사용
    
    // 컨테이너 크기
    let containerWidth = container.offsetWidth;
    let containerHeight = container.offsetHeight;
    
    // 바닥 벽 생성 (보이지 않음) - 이미지 하단에 맞춤
    // 바닥 벽의 상단이 컨테이너 하단에 오도록 설정
    const ground = Bodies.rectangle(
        containerWidth / 2,
        containerHeight + 10,
        containerWidth,
        20,
        { isStatic: true, render: { visible: false } }
    );
    
    // 좌우 벽 생성 (보이지 않음)
    const leftWall = Bodies.rectangle(
        0,
        containerHeight / 2,
        20,
        containerHeight,
        { isStatic: true, render: { visible: false } }
    );
    
    const rightWall = Bodies.rectangle(
        containerWidth,
        containerHeight / 2,
        20,
        containerHeight,
        { isStatic: true, render: { visible: false } }
    );
    
    // 벽들을 월드에 추가
    World.add(engine.world, [ground, leftWall, rightWall]);
    
    // 하트 요소들을 저장할 맵 (body -> DOM element)
    const heartBodies = new Map();
    
    // 파티클 컨테이너 생성
    const particleContainer = document.createElement('div');
    particleContainer.className = 'love-particles-container';
    particleContainer.style.position = 'absolute';
    particleContainer.style.top = '0';
    particleContainer.style.left = '0';
    particleContainer.style.width = '100%';
    particleContainer.style.height = '100%';
    particleContainer.style.pointerEvents = 'none';
    particleContainer.style.zIndex = '2';
    particleContainer.style.overflow = 'hidden';
    container.appendChild(particleContainer);
    
    let growingHeart = null;
    let loveCount = 0;
    const MIN_LOVE_COUNT = 5;
    const MAX_HEART_SIZE = 500;
    const INITIAL_HEART_SIZE = 100;
    const SIZE_INCREMENT = 20;
    
    /**
     * 하트 SVG 생성
     */
    function createHeartSVG(size, color) {
        return `
            <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${color}"/>
            </svg>
        `;
    }
    
    /**
     * 물리 하트 생성
     */
    function createPhysicsHeart(x, y) {
        // 랜덤 크기 (20~40px)
        const size = Math.random() * 30 + 30;
        
        // 랜덤 색상
        const heartColors = ['#FF6B80', '#FF8FA3', '#FFC4D6', '#FFB3BA', '#FFCCCB', '#FF6B9D'];
        const color = heartColors[Math.floor(Math.random() * heartColors.length)];
        
        // Matter.js 바디 생성 (원형으로 근사)
        const heartBody = Bodies.circle(x, y, size / 2, {
            restitution: 0.3, // 탄성 (튕김)
            friction: 0.5,     // 마찰
            density: 0.001,   // 밀도
            render: { visible: false } // Matter.js 렌더러는 사용하지 않음
        });
        
        // DOM 요소 생성
        const heartElement = document.createElement('div');
        heartElement.className = 'falling-heart';
        heartElement.style.position = 'absolute';
        heartElement.style.width = `${size}px`;
        heartElement.style.height = `${size}px`;
        heartElement.style.pointerEvents = 'none';
        heartElement.innerHTML = createHeartSVG(size, color);
        
        // 컨테이너에 추가
        particleContainer.appendChild(heartElement);
        
        // 바디와 요소 연결
        heartBodies.set(heartBody, heartElement);
        
        // 월드에 추가
        World.add(engine.world, heartBody);
        
        return heartBody;
    }
    
    /**
     * 물리 엔진 업데이트 및 DOM 동기화
     */
    function updatePhysics() {
        // 물리 엔진 업데이트
        Engine.update(engine);
        
        // 모든 하트 바디의 위치를 DOM에 반영
        heartBodies.forEach((element, body) => {
            const pos = body.position;
            const angle = body.angle;
            
            // 컨테이너 기준으로 위치 계산
            element.style.left = `${pos.x - parseFloat(element.style.width) / 2}px`;
            element.style.top = `${pos.y - parseFloat(element.style.height) / 2}px`;
            element.style.transform = `rotate(${angle}rad)`;
        });
        
        requestAnimationFrame(updatePhysics);
    }
    
    // 물리 엔진 업데이트 시작
    updatePhysics();
    
    /**
     * 하트 떨어뜨리기 (터질 때)
     */
    function createFallingHearts(centerX) {
        const count = Math.floor(Math.random() * 11) + 15; // 15~25개
        
        // 여러 프레임에 걸쳐 분산 생성
        let created = 0;
        const batchSize = 3;
        
        function createBatch() {
            const batchCount = Math.min(batchSize, count - created);
            for (let i = 0; i < batchCount; i++) {
                setTimeout(() => {
                    // 랜덤한 x 위치 (중앙 기준 ±150px)
                    const x = centerX + (Math.random() - 0.5) * 300;
                    const y = -30; // 위에서 시작
                    
                    createPhysicsHeart(x, y);
                }, i * 30);
            }
            created += batchCount;
            
            if (created < count) {
                requestAnimationFrame(createBatch);
            }
        }
        
        createBatch();
    }
    
    /**
     * 입력 칸 이벤트 처리
     */
    const loveInput = document.getElementById('loveInput');
    
    if (loveInput) {
        loveInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const inputValue = event.target.value.trim();
                
                if (inputValue.includes('사랑')) {
                    const containerRect = container.getBoundingClientRect();
                    const characterRect = character.getBoundingClientRect();
                    const centerX = characterRect.left + characterRect.width / 2 - containerRect.left;
                    const centerY = characterRect.top + characterRect.height / 2 - containerRect.top;
                    
                    loveCount++;
                    
                    // 기존 하트가 없으면 새로 생성
                    if (!growingHeart) {
                        growingHeart = document.createElement('div');
                        growingHeart.className = 'growing-heart';
                        
                        // 랜덤 색상 선택
                        const heartColors = ['#FF6B80', '#FF8FA3', '#FFC4D6', '#FFB3BA', '#FFCCCB', '#FF6B9D'];
                        const color = heartColors[Math.floor(Math.random() * heartColors.length)];
                        
                        // SVG 도형 하트 사용
                        growingHeart.innerHTML = createHeartSVG(INITIAL_HEART_SIZE, color);
                        growingHeart.style.position = 'absolute';
                        growingHeart.style.left = `${centerX}px`;
                        growingHeart.style.top = `${centerY}px`;
                        growingHeart.style.transform = 'translate(-50%, -50%)';
                        growingHeart.style.width = `${INITIAL_HEART_SIZE}px`;
                        growingHeart.style.height = `${INITIAL_HEART_SIZE}px`;
                        growingHeart.style.zIndex = '10';
                        growingHeart.style.pointerEvents = 'none';
                        growingHeart.style.transition = 'width 0.3s ease-out, height 0.3s ease-out, transform 0.3s ease-out, opacity 0.3s ease-out';
                        growingHeart.style.filter = 'drop-shadow(0 0 20px rgba(255, 107, 128, 0.8))';
                        particleContainer.appendChild(growingHeart);
                    }
                    
                    // 하트 크기 증가
                    const currentSize = parseInt(growingHeart.style.width) || INITIAL_HEART_SIZE;
                    const newSize = Math.min(currentSize + SIZE_INCREMENT, MAX_HEART_SIZE);
                    growingHeart.style.width = `${newSize}px`;
                    growingHeart.style.height = `${newSize}px`;
                    // SVG도 크기에 맞게 업데이트
                    const svg = growingHeart.querySelector('svg');
                    if (svg) {
                        svg.setAttribute('width', newSize);
                        svg.setAttribute('height', newSize);
                    }
                    
                    // 입력 칸 초기화
                    loveInput.value = '';
                    
                    // 5번 이상 커졌고, 일정 크기에 도달하면 하트 떨어뜨리기
                    if (loveCount >= MIN_LOVE_COUNT && (newSize >= MAX_HEART_SIZE || loveCount >= MIN_LOVE_COUNT + 2)) {
                        // 하트 떨어뜨리기
                        createFallingHearts(centerX);
                        
                        // 커지는 하트 제거
                        if (growingHeart && growingHeart.parentNode) {
                            growingHeart.style.opacity = '0';
                            growingHeart.style.transform = 'translate(-50%, -50%) scale(2)';
                            setTimeout(() => {
                                if (growingHeart && growingHeart.parentNode) {
                                    growingHeart.parentNode.removeChild(growingHeart);
                                }
                                growingHeart = null;
                            }, 300);
                        }
                        
                        // 카운터 리셋
                        loveCount = 0;
                    }
                }
            }
        });
    }
    
    /**
     * 리사이즈 처리
     */
    function handleResize() {
        containerWidth = container.offsetWidth;
        containerHeight = container.offsetHeight;
        
        // 바닥 위치 업데이트 - 이미지 하단에 맞춤
        // 바닥 벽의 상단이 컨테이너 하단에 오도록 설정
        Body.setPosition(ground, {
            x: containerWidth / 2,
            y: containerHeight + 10
        });
        Body.setVertices(ground, [
            { x: 0, y: containerHeight },
            { x: containerWidth, y: containerHeight },
            { x: containerWidth, y: containerHeight + 20 },
            { x: 0, y: containerHeight + 20 },
            
        ]);
        
        // 우측 벽 위치 업데이트
        Body.setPosition(rightWall, {
            x: containerWidth,
            y: containerHeight / 2
        });
    }
    
    window.addEventListener('resize', handleResize);
    
    console.log('사랑 세포 인터랙션 초기화 완료 (Matter.js)');
}
