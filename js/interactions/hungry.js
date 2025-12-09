/**
 * CELF - Hungry Cell Interaction
 * Section 03: 출출 세포 인터랙션
 */

/**
 * 출출 세포 이미지 업데이트 (테마에 따라)
 */
function updateHungryCharacterImage() {
    const character = document.getElementById('hungryCharacter');
    if (!character) return;
    
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    
    if (currentTheme === 'dark') {
        character.src = './assets/character/hungrywhite02.png';
    } else {
        character.src = './assets/character/hungry02.png';
    }
}

/**
 * 출출 세포 인터랙션 초기화
 */
export function initHungry() {
    const character = document.getElementById('hungryCharacter');
    const foodContainer = document.getElementById('hungryFoodContainer');
    if (!character || !foodContainer) return;
    
    // 초기 이미지 설정
    updateHungryCharacterImage();
    
    // 테마 변경 감지
    const html = document.documentElement;
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                updateHungryCharacterImage();
            }
        });
    });
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    
    const eatSound = document.getElementById('eatSound');
    let lastClickTime = Date.now();
    let idleTimer = null;
    let foodSpawnRate = 3000; // 기본 3초
    let clickCount = 0;
    
    /**
     * 음식 이모지 배열
     */
    const foodEmojis = ['🍔', '🍗', '🍕', '🧁', '🍰', '🍟', '🌮', '🍜', '🍱', '🍣'];
    
    /**
     * 음식 이모지 생성 (여러 개 동시 생성 - 캐릭터 주변에서)
     */
    function spawnFood() {
        // 한 번에 2~4개 생성
        const count = Math.floor(Math.random() * 3) + 2;
        const containerRect = foodContainer.getBoundingClientRect();
        const characterRect = character.getBoundingClientRect();
        
        // 캐릭터 중심 기준
        const centerX = characterRect.left + characterRect.width / 2 - containerRect.left;
        const centerY = characterRect.top + characterRect.height / 2 - containerRect.top;
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const emoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
                const food = document.createElement('div');
                food.className = 'food-emoji';
                food.textContent = emoji;
                
                // 캐릭터 주변 랜덤 위치에서 시작
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 50 + 30; // 30~80px
                const startX = centerX + Math.cos(angle) * distance;
                const startY = centerY + Math.sin(angle) * distance;
                
                food.style.left = `${startX}px`;
                food.style.top = `${startY}px`;
                
                // 랜덤 크기 (평균 크기 증가)
                const size = Math.random() * 0.7 + 1.2; // 1.2~1.9배 (이전: 0.8~1.3배)
                food.style.fontSize = `${3 * size}rem`;
                
                // 랜덤 속도
                const duration = Math.random() * 2000 + 2500; // 2.5~4.5초
                food.style.animationDuration = `${duration}ms`;
                
                // 랜덤 지연
                food.style.animationDelay = `${Math.random() * 300}ms`;
                
                // 음식 클릭 이벤트 추가 (해당 음식만 제거)
                food.addEventListener('click', (e) => {
                    e.stopPropagation(); // 이벤트 전파 방지
                    removeFood(food);
                });
                
                foodContainer.appendChild(food);
                
                // 애니메이션 종료 후 제거
                setTimeout(() => {
                    if (food.parentNode) {
                        food.parentNode.removeChild(food);
                    }
                }, duration + 500);
            }, i * 150); // 각 음식마다 150ms씩 지연
        }
    }
    
    /**
     * 음식 제거 함수
     */
    function removeFood(foodElement) {
        // 먹는 애니메이션 표시
        showEatingAnimation();
        
        // 효과음 재생
        if (eatSound) {
            eatSound.currentTime = 0;
            eatSound.play().catch(err => {
                console.warn('효과음 재생 실패:', err);
            });
        }
        
        // 해당 음식만 제거 (페이드아웃 효과)
        foodElement.style.animation = 'none';
        foodElement.style.transition = 'all 0.2s ease-out';
        foodElement.style.opacity = '0';
        foodElement.style.transform = 'scale(0)';
        
        setTimeout(() => {
            if (foodElement.parentNode) {
                foodElement.parentNode.removeChild(foodElement);
            }
        }, 200);
    }
    
    /**
     * 먹는 소리 텍스트 배열
     */
    const eatingTexts = ['쩝', '냠냠', '쩝쩝', '꺼억', '뇸뇸', '암냠냠'];
    
    /**
     * 먹는 애니메이션 (여러 방향으로 랜덤 텍스트 표시)
     */
    function showEatingAnimation() {
        const container = character.parentElement; // cell-character-container
        const containerRect = container.getBoundingClientRect();
        const characterRect = character.getBoundingClientRect();
        
        // 캐릭터 중심 기준
        const centerX = characterRect.left + characterRect.width / 2 - containerRect.left;
        const centerY = characterRect.top + characterRect.height / 2 - containerRect.top;
        
        // 3~5개의 텍스트를 랜덤하게 생성
        const count = Math.floor(Math.random() * 3) + 3; // 3~5개
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const eatingMouth = document.createElement('div');
                eatingMouth.className = 'eating-mouth';
                
                // 랜덤 텍스트 선택
                const randomText = eatingTexts[Math.floor(Math.random() * eatingTexts.length)];
                eatingMouth.textContent = randomText;
                
                // 캐릭터 주변 랜덤 위치에서 시작
                const angle = Math.random() * Math.PI * 2; // 0~360도
                const distance = Math.random() * 100 + 50; // 50~150px
                const startX = centerX + Math.cos(angle) * distance;
                const startY = centerY + Math.sin(angle) * distance;
                
                // 랜덤 각도 (-45도 ~ 45도)
                const rotation = (Math.random() - 0.5) * 90; // -45 ~ 45도
                
                eatingMouth.style.left = `${startX}px`;
                eatingMouth.style.top = `${startY}px`;
                eatingMouth.style.setProperty('--rotation', `${rotation}deg`);
                
                // 랜덤 크기
                const size = Math.random() * 0.5 + 0.9; // 0.9~1.4배
                eatingMouth.style.fontSize = `${2.5 * size}rem`;
                
                // 랜덤 지연
                eatingMouth.style.animationDelay = `${Math.random() * 150}ms`;
                
                container.appendChild(eatingMouth);
                
                // 애니메이션 종료 후 제거
                setTimeout(() => {
                    if (eatingMouth.parentNode) {
                        eatingMouth.parentNode.removeChild(eatingMouth);
                    }
                }, 800);
            }, i * 50); // 각 텍스트마다 50ms씩 지연
        }
        
        // 효과음 재생 (한 번만)
        if (eatSound) {
            eatSound.currentTime = 0;
            eatSound.play().catch(err => {
                console.warn('효과음 재생 실패:', err);
            });
        }
    }
    
    /**
     * 클릭 이벤트 처리 (캐릭터 클릭 시 - 음식 생성 속도만 조정)
     */
    function handleClick() {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime;
        lastClickTime = now;
        
        // 연속 클릭 감지 (1초 이내)
        if (timeSinceLastClick < 1000) {
            clickCount++;
            // 연속 클릭 시 음식 생성 속도 감소
            foodSpawnRate = Math.max(1000, 3000 - (clickCount * 200));
        } else {
            clickCount = 0;
            foodSpawnRate = 3000;
        }
        
        // 타이머 리셋
        clearTimeout(idleTimer);
        startIdleTimer();
    }
    
    /**
     * Idle 타이머 시작
     */
    function startIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            spawnFood();
            // 주기적으로 음식 생성 (더 자주)
            const interval = setInterval(() => {
                if (Date.now() - lastClickTime > foodSpawnRate) {
                    spawnFood();
                } else {
                    clearInterval(interval);
                    startIdleTimer();
                }
            }, foodSpawnRate * 0.8); // 더 자주 생성
        }, foodSpawnRate);
    }
    
    /**
     * 초기화 실행
     */
    startIdleTimer();
    
    // 이벤트 리스너
    character.addEventListener('click', handleClick);
    foodContainer.addEventListener('click', handleClick);
    
    console.log('출출 세포 인터랙션 초기화 완료');
}

