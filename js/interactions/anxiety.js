/**
 * CELF - Anxiety Cell Interaction
 * Section 06: 불안 세포 인터랙션
 * 마우스를 천천히 움직여서 안정화시키기
 */

// 설정 상수
const CONFIG = {
    ANXIETY_DECREASE_RATE: 0.3,    // 천천히 움직일 때 불안도 감소 속도
    ANXIETY_INCREASE_RATE: 0.5,    // 빠르게 움직일 때 불안도 증가 속도
    SLOW_SPEED_THRESHOLD: 2,       // 천천히 움직이는 기준 (px/frame)
    FAST_SPEED_THRESHOLD: 10,      // 빠르게 움직이는 기준 (px/frame)
    MAX_ANXIETY: 100,              // 최대 불안도
    MIN_ANXIETY: 0,                // 최소 불안도
    CALM_THRESHOLD: 20,            // 안정화 기준 (불안도가 이 이하로 내려가면)
};

/**
 * 불안 세포 인터랙션 초기화
 */
export function initAnxiety() {
    const character = document.getElementById('anxietyCharacter');
    const section = document.getElementById('section06');
    if (!character || !section) return;
    
    let glitchInterval = null;
    let shadowShakeInterval = null;
    let blurInterval = null;
    let sectionEntered = false;
    
    // 불안 메시지
    const anxietyMessages = {
        calm: [
            "괜찮아",
            "할수 있다!",
            "좋아좋아",
            "나는 최고야",
            "아자아자"
        ],
        low: [
            "할 수 있을까",
            "좀 불안한데",
            "괜찮겠지?",
            "걱정이네",
            "뭔가 불안해"
        ],
        medium: [
            "불안해",
            "난 바보야",
            "걱정돼",
            "모르겠어",
            "어떻게 하지",
            "무서워"
        ],
        high: [
            "너무 불안해!!!",
            "망했어...",
            "난 끝이야...",
            "너무 무서워...",
            "불안해 불안해!!!!!",
            "안될거야...",
            "누가 도와줘!!!"
        ]
    };
    
    // 상태 관리
    let state = {
        anxiety: 50,               // 현재 불안도 (0~100)
        lastMouseX: 0,
        lastMouseY: 0,
        lastMouseTime: 0,
        mouseSpeed: 0,             // 마우스 이동 속도
        isCalm: false,             // 안정화 상태
        updateInterval: null,
        gaugeElement: null,
        hintElement: null,
        messageElements: [],       // 불안 메시지 요소들 (배열)
        messageContainer: null,    // 메시지 컨테이너
        lastMessageTime: 0,        // 마지막 메시지 변경 시간
        messageChangeInterval: 2000, // 메시지 변경 간격 (2초)
        lastAnxietyLevel: 0,       // 마지막 불안도 레벨 (0=calm, 1=low, 2=medium, 3=high)
        redOverlay: null           // 붉은 오버레이 요소
    };
    
    /**
     * UI 생성
     */
    function createUI() {
        // 붉은 오버레이 (불안도에 따라 화면이 붉어지는 효과)
        const redOverlay = document.createElement('div');
        redOverlay.className = 'anxiety-red-overlay';
        redOverlay.style.position = 'absolute';
        redOverlay.style.top = '0';
        redOverlay.style.left = '0';
        redOverlay.style.width = '100%';
        redOverlay.style.height = '100%';
        redOverlay.style.background = 'rgba(244, 67, 54, 0)'; // 빨간색, 초기 투명
        redOverlay.style.pointerEvents = 'none';
        redOverlay.style.zIndex = '1';
        redOverlay.style.transition = 'background 0.3s ease';
        section.appendChild(redOverlay);
        state.redOverlay = redOverlay;
        
        // 불안도 게이지
        const gaugeContainer = document.createElement('div');
        gaugeContainer.className = 'anxiety-gauge-container';
        gaugeContainer.innerHTML = `
            <div class="anxiety-gauge-label">불안도 <span id="anxietyLevel">50%</span></div>
            <div class="anxiety-gauge-bar">
                <div class="anxiety-gauge-fill" id="anxietyGaugeFill"></div>
            </div>
        `;
        section.appendChild(gaugeContainer);
        state.gaugeElement = document.getElementById('anxietyGaugeFill');
        
        // 안내 메시지
        const hint = document.createElement('div');
        hint.className = 'anxiety-hint';
        hint.id = 'anxietyHint';
        hint.textContent = '마우스를 천천히 부드럽게 움직여주세요';
        section.appendChild(hint);
        state.hintElement = hint;
        
        // 불안 메시지 컨테이너 (캐릭터 컨테이너 안에)
        const characterContainer = section.querySelector('.cell-character-container');
        if (characterContainer) {
            const messageContainer = document.createElement('div');
            messageContainer.className = 'anxiety-messages-container';
            characterContainer.appendChild(messageContainer);
            state.messageContainer = messageContainer;
        }
        
        // 초기 메시지 설정
        updateAnxietyMessages();
    }
    
    /**
     * 불안도 레벨 가져오기
     */
    function getAnxietyLevel(anxiety) {
        if (anxiety <= 20) return 0; // calm
        if (anxiety <= 40) return 1; // low
        if (anxiety <= 70) return 2; // medium
        return 3; // high
    }
    
    /**
     * 불안도에 따른 메시지 개수 결정
     */
    function getMessageCount(level) {
        if (level === 0) return 1;      // 안정: 1개
        if (level === 1) return 3;      // 약간 불안: 3개
        if (level === 2) return 6;      // 불안: 6개
        return 8;                       // 매우 불안: 8개
    }
    
    /**
     * 불안도에 따른 메시지 업데이트
     */
    function updateAnxietyMessages(force = false) {
        if (!state.messageContainer) return;
        
        const now = Date.now();
        const currentLevel = getAnxietyLevel(state.anxiety);
        const targetCount = getMessageCount(currentLevel);
        
        // 레벨이 변경되었거나 강제 업데이트 또는 일정 시간 경과 시 메시지 변경
        const shouldUpdate = force || 
                            currentLevel !== state.lastAnxietyLevel ||
                            (now - state.lastMessageTime >= state.messageChangeInterval);
        
        // 메시지 개수가 변경되었을 때도 업데이트
        if (targetCount !== state.messageElements.length) {
            // 기존 메시지 제거
            state.messageElements.forEach(msg => {
                if (msg.parentNode) {
                    msg.style.opacity = '0';
                    setTimeout(() => {
                        if (msg.parentNode) {
                            msg.parentNode.removeChild(msg);
                        }
                    }, 300);
                }
            });
            state.messageElements = [];
            
            // 새로운 메시지 생성
            for (let i = 0; i < targetCount; i++) {
                const message = document.createElement('div');
                message.className = 'anxiety-message';
                message.style.opacity = '0';
                state.messageContainer.appendChild(message);
                state.messageElements.push(message);
                
                // 페이드 인
                setTimeout(() => {
                    message.style.opacity = '1';
                }, i * 100);
            }
        }
        
        if (!shouldUpdate && state.messageElements.length > 0) return;
        
        let messages;
        if (currentLevel === 0) {
            messages = anxietyMessages.calm;
        } else if (currentLevel === 1) {
            messages = anxietyMessages.low;
        } else if (currentLevel === 2) {
            messages = anxietyMessages.medium;
        } else {
            messages = anxietyMessages.high;
        }
        
        // 각 메시지 요소에 랜덤 메시지와 위치 설정 (겹침 방지)
        const usedPositions = []; // 이미 사용된 위치 저장
        const minDistance = 15; // 최소 거리 (%)
        
        state.messageElements.forEach((messageElement, index) => {
            // 랜덤 메시지 선택
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            
            // 태그 스타일 적용
            const levelNames = ['calm', 'low', 'medium', 'high'];
            messageElement.className = 'anxiety-message anxiety-tag';
            messageElement.setAttribute('data-level', levelNames[currentLevel]);
            messageElement.innerHTML = `<span class="tag-content">${randomMessage}</span>`;
            
            // 캐릭터 컨테이너 전체 영역에서 랜덤 위치 설정 (겹침 방지)
            let randomX, randomY;
            let attempts = 0;
            let validPosition = false;
            
            while (!validPosition && attempts < 50) {
                const minX = 15; // 최소 X 위치 (%)
                const maxX = 85; // 최대 X 위치 (%)
                const minY = 15; // 최소 Y 위치 (%)
                const maxY = 85; // 최대 Y 위치 (%)
                
                randomX = minX + Math.random() * (maxX - minX);
                randomY = minY + Math.random() * (maxY - minY);
                
                // 기존 위치와의 거리 확인
                validPosition = usedPositions.every(pos => {
                    const dx = pos.x - randomX;
                    const dy = pos.y - randomY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return distance >= minDistance;
                });
                
                attempts++;
            }
            
            // 위치 저장
            usedPositions.push({ x: randomX, y: randomY });
            
            messageElement.style.left = `${randomX}%`;
            messageElement.style.top = `${randomY}%`;
            
            // 메시지 출력 각도: 왼쪽 -30도 ~ 오른쪽 +30도 범위
            const rotationAngle = (Math.random() - 0.5) * 60; // -30도 ~ +30도
            // CSS 변수로 각도 저장 (애니메이션과 충돌 방지)
            messageElement.style.setProperty('--message-rotation', `${rotationAngle}deg`);
            
            // 태그 스타일은 CSS에서 처리되므로 인라인 스타일 제거
            
            // 애니메이션 딜레이 (각 메시지가 약간씩 다르게)
            messageElement.style.animationDelay = `${index * 0.2 + Math.random() * 0.3}s`;
        });
        
        state.lastMessageTime = now;
        state.lastAnxietyLevel = currentLevel;
    }
    
    /**
     * 불안도 게이지 업데이트
     */
    function updateGauge() {
        if (!state.gaugeElement) return;
        
        const percentage = state.anxiety;
        state.gaugeElement.style.width = `${percentage}%`;
        
        // 게이지 색상 변화
        if (percentage > 70) {
            state.gaugeElement.style.background = '#F44336'; // 빨강 (매우 불안)
        } else if (percentage > 40) {
            state.gaugeElement.style.background = '#FF9800'; // 주황 (불안)
        } else if (percentage > 20) {
            state.gaugeElement.style.background = '#FFC107'; // 노랑 (약간 불안)
        } else {
            state.gaugeElement.style.background = '#4CAF50'; // 초록 (안정)
        }
        
        // 퍼센트 표시
        const levelElement = document.getElementById('anxietyLevel');
        if (levelElement) {
            levelElement.textContent = `${Math.round(percentage)}%`;
        }
        
        // 화면 붉어지는 효과 (불안도에 따라)
        if (state.redOverlay) {
            // 불안도가 높을수록 더 붉게 (0~100% -> 0~0.3 opacity)
            const redIntensity = (percentage / 100) * 0.3;
            state.redOverlay.style.background = `rgba(244, 67, 54, ${redIntensity})`;
        }
        
        // 메시지 업데이트
        updateAnxietyMessages();
    }
    
    /**
     * 안정화 상태 체크
     */
    function checkCalmState() {
        const wasCalm = state.isCalm;
        state.isCalm = state.anxiety <= CONFIG.CALM_THRESHOLD;
        
        if (state.isCalm && !wasCalm) {
            // 안정화 달성
            achieveCalm();
        } else if (!state.isCalm && wasCalm) {
            // 다시 불안 상태
            loseCalm();
        }
    }
    
    /**
     * 안정화 달성
     */
    function achieveCalm() {
        // 모든 불안 효과 중지
        stopAllAnxietyEffects();
        
        // 안정화 효과
        character.classList.add('anxiety-calm');
        section.classList.remove('anxiety-shake-active');
        
        // 붉은 오버레이 제거
        if (state.redOverlay) {
            state.redOverlay.style.background = 'rgba(244, 67, 54, 0)';
        }
        
        // 안내 메시지 변경
        if (state.hintElement) {
            state.hintElement.textContent = '안정화되었습니다!';
            state.hintElement.style.color = '#4CAF50';
        }
        
        // 불안 메시지 숨기기
        state.messageElements.forEach(msg => {
            msg.style.opacity = '0';
        });
        
        console.log('불안세포가 안정화되었습니다!');
    }
    
    /**
     * 안정화 상태 상실
     */
    function loseCalm() {
        character.classList.remove('anxiety-calm');
        
        if (state.hintElement) {
            state.hintElement.textContent = '마우스를 천천히 부드럽게 움직여주세요';
            state.hintElement.style.color = '';
        }
        
        // 불안 메시지 다시 표시
        updateAnxietyMessages(true);
    }
    
    /**
     * 마우스 속도 계산 및 불안도 업데이트
     */
    function updateAnxiety() {
        // 마우스 속도에 따라 불안도 조절
        if (state.mouseSpeed < CONFIG.SLOW_SPEED_THRESHOLD) {
            // 천천히 움직임 → 불안도 감소
            state.anxiety = Math.max(
                CONFIG.MIN_ANXIETY,
                state.anxiety - CONFIG.ANXIETY_DECREASE_RATE
            );
        } else if (state.mouseSpeed > CONFIG.FAST_SPEED_THRESHOLD) {
            // 빠르게 움직임 → 불안도 증가
            state.anxiety = Math.min(
                CONFIG.MAX_ANXIETY,
                state.anxiety + CONFIG.ANXIETY_INCREASE_RATE
            );
        }
        
        // 자연 감소 (매우 느리게)
        if (state.mouseSpeed === 0) {
            state.anxiety = Math.max(
                CONFIG.MIN_ANXIETY,
                state.anxiety - 0.1
            );
        }
        
        // 게이지 업데이트
        updateGauge();
        
        // 안정화 상태 체크
        checkCalmState();
        
        // 불안도에 따라 흔들림 강도 조절
        updateShakeIntensity();
    }
    
    /**
     * 흔들림 강도 조절
     */
    function updateShakeIntensity() {
        if (state.isCalm) {
            section.classList.remove('anxiety-shake-active');
            return;
        }
        
        // 불안도에 따라 흔들림 강도 조절
        const intensity = state.anxiety / 100;
        section.style.setProperty('--shake-intensity', intensity);
        
        if (state.anxiety > 30) {
            section.classList.add('anxiety-shake-active');
        } else {
            section.classList.remove('anxiety-shake-active');
        }
    }
    
    /**
     * 마우스 이동 처리
     */
    function handleMouseMove(event) {
        const now = Date.now();
        const currentX = event.clientX;
        const currentY = event.clientY;
        
        if (state.lastMouseTime > 0) {
            const timeDelta = now - state.lastMouseTime;
            const distance = Math.sqrt(
                Math.pow(currentX - state.lastMouseX, 2) +
                Math.pow(currentY - state.lastMouseY, 2)
            );
            
            // 속도 계산 (px/frame, 약 60fps 기준)
            state.mouseSpeed = distance / (timeDelta / 16.67);
        }
        
        state.lastMouseX = currentX;
        state.lastMouseY = currentY;
        state.lastMouseTime = now;
    }
    
    /**
     * 마우스가 섹션을 벗어났을 때
     */
    function handleMouseLeave() {
        state.mouseSpeed = 0;
    }
    
    /**
     * Glitch 효과 적용 (테두리 깜빡임)
     */
    function applyGlitch() {
        if (state.isCalm) return;
        character.classList.add('glitch');
        setTimeout(() => {
            character.classList.remove('glitch');
        }, 300);
    }
    
    /**
     * 그림자 떨림 효과
     */
    function startShadowShake() {
        if (state.isCalm) return;
        if (shadowShakeInterval) return;
        character.classList.add('shadow-shake');
    }
    
    function stopShadowShake() {
        character.classList.remove('shadow-shake');
        if (shadowShakeInterval) {
            clearInterval(shadowShakeInterval);
            shadowShakeInterval = null;
        }
    }
    
    /**
     * Blur 간헐적 효과
     */
    function startBlurEffect() {
        if (state.isCalm) return;
        if (blurInterval) return;
        blurInterval = setInterval(() => {
            if (state.anxiety > 50) {
                character.classList.add('anxiety-blur');
                setTimeout(() => {
                    character.classList.remove('anxiety-blur');
                }, 200);
            }
        }, 1500);
    }
    
    function stopBlurEffect() {
        if (blurInterval) {
            clearInterval(blurInterval);
            blurInterval = null;
        }
        character.classList.remove('anxiety-blur');
    }
    
    /**
     * 호버 시 Glitch, 그림자 떨림, Blur 효과
     */
    function handleHover() {
        if (state.isCalm) return;
        
        if (!glitchInterval) {
            glitchInterval = setInterval(() => {
                applyGlitch();
            }, 2000);
        }
        startShadowShake();
        startBlurEffect();
    }
    
    function handleLeave() {
        if (glitchInterval) {
            clearInterval(glitchInterval);
            glitchInterval = null;
        }
        stopShadowShake();
        stopBlurEffect();
    }
    
    /**
     * 모든 불안 효과 중지
     */
    function stopAllAnxietyEffects() {
        if (glitchInterval) {
            clearInterval(glitchInterval);
            glitchInterval = null;
        }
        stopShadowShake();
        stopBlurEffect();
    }
    
    /**
     * 섹션 진입 시 흔들림 시작
     */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !sectionEntered) {
                sectionEntered = true;
                if (!state.isCalm) {
                    section.classList.add('anxiety-shake-active');
                }
            } else if (!entry.isIntersecting && sectionEntered) {
                sectionEntered = false;
                section.classList.remove('anxiety-shake-active');
            }
        });
    }, { threshold: 0.3 });
    
    observer.observe(section);
    
    // UI 생성
    createUI();
    
    // 불안도 업데이트 루프
    state.updateInterval = setInterval(() => {
        updateAnxiety();
    }, 50); // 20fps
    
    // 이벤트 리스너
    character.addEventListener('mouseenter', handleHover);
    character.addEventListener('mouseleave', handleLeave);
    section.addEventListener('mousemove', handleMouseMove);
    section.addEventListener('mouseleave', handleMouseLeave);
    
    // 초기 게이지 업데이트
    updateGauge();
    
    console.log('불안 세포 인터랙션 초기화 완료 (마우스 속도 기반 안정화)');
}
