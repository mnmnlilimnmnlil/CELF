/**
 * CELF - Sleepy Cell Interaction
 * Section 05: 쿨쿨 세포 인터랙션
 * 눈 감기 효과와 스페이스바 연타로 깨우기
 */

// 설정 상수
const CONFIG = {
    // 눈 감기 속도
    EYE_CLOSE_SPEED_BASE: 0.2,      // 기본 눈 감는 속도
    EYE_CLOSE_SPEED_ACCEL: 0.05,    // 눈 감는 속도 가속도 (점점 빨라짐)
    EYE_OPEN_SPEED: 3,               // 눈이 뜨는 속도 (스페이스바 한 번당)
    
    // 상태 전환
    AWAKE_DURATION: 5000,            // 깨어 있는 유지 시간 (ms)
    BLINK_INTERVAL: 3000,            // 깜빡임 간격 (ms)
    BLINK_DURATION: 200,             // 깜빡임 지속 시간 (ms)
    
    // Zzz 효과
    ZZZ_SHOW_THRESHOLD: 90,          // Zzz 표시 시작 임계값 (눈 감기 %)
    ZZZ_SPAWN_INTERVAL: 1200,        // Zzz 생성 간격 (ms) - 더 천천히
    ZZZ_FADE_DURATION: 2000,         // Zzz 페이드 인 시간 (ms) - 더 부드럽게
    ZZZ_FADE_OUT_DURATION: 2500,     // Zzz 페이드 아웃 시간 (ms) - 서서히 사라짐
    ZZZ_MAX_COUNT: 30,               // 최대 Zzz 개수
    
    // 클래스 이름
    CLASS_SLEEP: 'is-sleep',
    CLASS_AWAKE: 'is-awake',
    CLASS_BLINKING: 'is-blinking'
};

/**
 * 쿨쿨 세포 인터랙션 초기화
 */
export function initSleepy() {
    // DOM 요소 선택
    const character = document.getElementById('sleepyCharacter');
    const section = document.getElementById('section05');
    const eyeCoverTop = document.querySelector('.eye-cover-top');
    const eyeCoverBottom = document.querySelector('.eye-cover-bottom');
    const overlay = document.getElementById('sleepyOverlay');
    const zzzContainer = document.querySelector('.sleepy-zzz-container');
    const hintElement = document.querySelector('.sleepy-hint');
    const container = document.querySelector('.cell-character-container');
    
    // 필수 요소 확인
    if (!character || !section) {
        console.warn('쿨쿨 세포 필수 요소를 찾을 수 없습니다.');
        return;
    }
    
    // Zzz 컨테이너가 없으면 생성
    if (!zzzContainer && section) {
        const newContainer = document.createElement('div');
        newContainer.className = 'sleepy-zzz-container';
        section.appendChild(newContainer);
        zzzContainer = newContainer;
    }
    
    // 상태 관리
    let state = {
        isSleeping: true,
        isAwake: false,
        eyeCloseProgress: 20,    // 0~100 (0 = 눈 뜸, 100 = 완전히 감음)
        lastInputTime: 0,
        awakeTimeout: null,
        eyeCloseInterval: null,
        blinkTimeout: null,
        blinkInterval: null,
        currentCloseSpeed: CONFIG.EYE_CLOSE_SPEED_BASE,
        zzzElements: [],
        zzzSpawnInterval: null
    };
    
    /**
     * Zzz 요소 생성 (천천히 나타남)
     */
    function createZzz() {
        if (!zzzContainer) return null;
        
        const zzz = document.createElement('div');
        zzz.className = 'sleepy-zzz-drop';
        zzz.textContent = 'Zzz';
        
        // 랜덤 크기와 위치
        const size = Math.random() * 40 + 40; // 40~80px
        const sectionRect = section.getBoundingClientRect();
        const x = Math.random() * sectionRect.width;
        const y = Math.random() * sectionRect.height;
        const opacity = Math.random() * 0.4 + 0.4; // 0.4~0.8
        const rotation = (Math.random() - 0.5) * 90; // -45도 ~ 45도
        
        zzz.style.position = 'absolute';
        zzz.style.left = `${x}px`;
        zzz.style.top = `${y}px`;
        zzz.style.fontSize = `${size}px`;
        zzz.style.opacity = '0';
        zzz.style.setProperty('--rotation', `${rotation}deg`);
        zzz.style.setProperty('--base-opacity', opacity);
        zzz.style.transform = `rotate(${rotation}deg)`;
        zzz.style.pointerEvents = 'none';
        zzz.style.zIndex = '101';
        
        // 테마에 따라 색상 설정
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDarkMode) {
            zzz.style.color = 'rgba(0, 0, 0, 0.9)';
            zzz.style.textShadow = '0 0 15px rgba(0, 0, 0, 0.8)';
        } else {
            zzz.style.color = 'rgba(255, 255, 255, 0.8)';
            zzz.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
        }
        
        zzz.style.fontWeight = 'bold';
        zzz.style.transition = `opacity ${CONFIG.ZZZ_FADE_DURATION}ms ease-in-out`;
        zzz.style.animation = 'none'; // 처음에는 애니메이션 없음
        
        zzzContainer.appendChild(zzz);
        state.zzzElements.push(zzz);
        
        // 서서히 페이드 인
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                zzz.style.opacity = opacity;
                // 페이드 인이 완료된 후 애니메이션 시작
                setTimeout(() => {
                    zzz.style.animation = 'zzzFloat 3s ease-in-out infinite';
                    zzz.style.animationDelay = `${Math.random() * 2}s`;
                }, CONFIG.ZZZ_FADE_DURATION);
            });
        });
        
        // 최대 개수 제한
        if (state.zzzElements.length > CONFIG.ZZZ_MAX_COUNT) {
            const oldest = state.zzzElements.shift();
            if (oldest && oldest.parentNode) {
                // 서서히 페이드 아웃 후 제거
                requestAnimationFrame(() => {
                    oldest.style.transition = `opacity ${CONFIG.ZZZ_FADE_OUT_DURATION}ms ease-in-out`;
                    oldest.style.animation = 'none'; // 애니메이션 중지
                    requestAnimationFrame(() => {
                        oldest.style.opacity = '0';
                        setTimeout(() => {
                            if (oldest && oldest.parentNode) {
                                oldest.parentNode.removeChild(oldest);
                            }
                        }, CONFIG.ZZZ_FADE_OUT_DURATION);
                    });
                });
            }
        }
        
        // 일정 시간 후 서서히 페이드 아웃
        setTimeout(() => {
            if (zzz && zzz.parentNode) {
                requestAnimationFrame(() => {
                    zzz.style.transition = `opacity ${CONFIG.ZZZ_FADE_OUT_DURATION}ms ease-in-out`;
                    zzz.style.animation = 'none'; // 애니메이션 중지
                    requestAnimationFrame(() => {
                        zzz.style.opacity = '0';
                        setTimeout(() => {
                            if (zzz && zzz.parentNode) {
                                zzz.parentNode.removeChild(zzz);
                                const index = state.zzzElements.indexOf(zzz);
                                if (index > -1) {
                                    state.zzzElements.splice(index, 1);
                                }
                            }
                        }, CONFIG.ZZZ_FADE_OUT_DURATION);
                    });
                });
            }
        }, CONFIG.ZZZ_FADE_DURATION * 4); // 4배 시간 후 사라짐
        
        return zzz;
    }
    
    /**
     * Zzz 효과 시작
     */
    function startZzzEffect() {
        if (state.zzzSpawnInterval) {
            clearInterval(state.zzzSpawnInterval);
        }
        
        state.zzzSpawnInterval = setInterval(() => {
            if (state.eyeCloseProgress >= CONFIG.ZZZ_SHOW_THRESHOLD && !state.isAwake) {
                createZzz();
            }
        }, CONFIG.ZZZ_SPAWN_INTERVAL);
    }
    
    /**
     * Zzz 효과 중지
     */
    function stopZzzEffect() {
        if (state.zzzSpawnInterval) {
            clearInterval(state.zzzSpawnInterval);
            state.zzzSpawnInterval = null;
        }
        
        // 모든 Zzz 서서히 페이드 아웃 후 제거
        state.zzzElements.forEach((zzz, index) => {
            if (zzz && zzz.parentNode) {
                // 각각 약간의 딜레이를 주어 순차적으로 사라지게
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        zzz.style.transition = `opacity ${CONFIG.ZZZ_FADE_OUT_DURATION}ms ease-in-out`;
                        zzz.style.animation = 'none'; // 애니메이션 중지
                        requestAnimationFrame(() => {
                            zzz.style.opacity = '0';
                            setTimeout(() => {
                                if (zzz && zzz.parentNode) {
                                    zzz.parentNode.removeChild(zzz);
                                }
                            }, CONFIG.ZZZ_FADE_OUT_DURATION);
                        });
                    });
                }, index * 50); // 각각 50ms씩 딜레이
            }
        });
        state.zzzElements = [];
    }
    
    /**
     * 눈 감기 상태 업데이트
     */
    function updateEyeCover() {
        // eyeCloseProgress를 0~100 사이로 클램프
        state.eyeCloseProgress = Math.max(0, Math.min(100, state.eyeCloseProgress));
        
        // 위쪽 눈 덮개: 위에서 아래로 내려옴
        if (eyeCoverTop) {
            eyeCoverTop.style.height = `${state.eyeCloseProgress}%`;
        }
        
        // 아래쪽 눈 덮개: 아래에서 위로 올라옴
        if (eyeCoverBottom) {
            eyeCoverBottom.style.height = `${state.eyeCloseProgress}%`;
        }
        
        // 배경 어둡게 (눈이 감을수록 어두워짐)
        if (overlay) {
            const darkness = state.eyeCloseProgress / 100;
            overlay.style.background = `rgba(0, 0, 0, ${darkness * 0.6})`;
        }
        
        // 힌트 메시지 표시 (눈이 30% 이상 감기면 나타남, 깨어나면 숨김)
        if (hintElement) {
            if (state.eyeCloseProgress >= 30 && !state.isAwake) {
                const opacity = Math.min(1, (state.eyeCloseProgress - 30) / 20);
                hintElement.style.opacity = opacity;
                hintElement.style.visibility = 'visible';
            } else if (state.isAwake || state.eyeCloseProgress < 30) {
                hintElement.style.opacity = '0';
                hintElement.style.visibility = 'hidden';
            }
        }
        
        // Zzz 효과 제어
        if (state.eyeCloseProgress >= CONFIG.ZZZ_SHOW_THRESHOLD && !state.isAwake) {
            if (!state.zzzSpawnInterval) {
                startZzzEffect();
            }
        } else {
            stopZzzEffect();
        }
    }
    
    /**
     * 깜빡임 효과
     */
    function blink() {
        if (state.isAwake || state.eyeCloseProgress >= 80) return;
        
        character.classList.add(CONFIG.CLASS_BLINKING);
        
        setTimeout(() => {
            character.classList.remove(CONFIG.CLASS_BLINKING);
        }, CONFIG.BLINK_DURATION);
    }
    
    /**
     * 깜빡임 루프 시작
     */
    function startBlinkLoop() {
        if (state.blinkInterval) {
            clearInterval(state.blinkInterval);
        }
        
        state.blinkInterval = setInterval(() => {
            if (!state.isAwake && state.eyeCloseProgress < 80) {
                blink();
            }
        }, CONFIG.BLINK_INTERVAL);
    }
    
    /**
     * 눈 감기 (자동으로 점점 감김)
     */
    function closeEyes() {
        if (state.isAwake) return; // 깨어 있는 동안은 감기지 않음
        
        // 최근 입력 후 일정 시간이 지났는지 확인
        const timeSinceLastInput = Date.now() - state.lastInputTime;
        if (timeSinceLastInput < 50) {
            return; // 아직 입력이 있었으면 감기지 않음
        }
        
        // 눈이 감을수록 속도가 빨라짐
        state.currentCloseSpeed = CONFIG.EYE_CLOSE_SPEED_BASE + 
            (state.eyeCloseProgress / 100) * CONFIG.EYE_CLOSE_SPEED_ACCEL * 10;
        
        // 눈이 점점 감김
        state.eyeCloseProgress += state.currentCloseSpeed;
        updateEyeCover();
        
        // 완전히 감으면 잠듦
        if (state.eyeCloseProgress >= 100 && !state.isSleeping) {
            fallAsleep();
        }
    }
    
    /**
     * 눈 뜨기 (스페이스바 연타로)
     */
    function openEyes() {
        if (state.isAwake) return; // 이미 깨어 있으면 반응하지 않음
        
        state.eyeCloseProgress -= CONFIG.EYE_OPEN_SPEED;
        state.lastInputTime = Date.now();
        state.currentCloseSpeed = CONFIG.EYE_CLOSE_SPEED_BASE; // 속도 리셋
        updateEyeCover();
        
        // 눈이 완전히 뜨면 깨어남
        if (state.eyeCloseProgress <= 0) {
            wakeUp();
        }
    }
    
    /**
     * 깨우기
     */
    function wakeUp() {
        if (state.isAwake) return;
        
        state.isSleeping = false;
        state.isAwake = true;
        state.eyeCloseProgress = 0;
        state.currentCloseSpeed = CONFIG.EYE_CLOSE_SPEED_BASE;
        updateEyeCover();
        stopZzzEffect();
        
        // 클래스 토글
        character.classList.remove(CONFIG.CLASS_SLEEP);
        character.classList.add(CONFIG.CLASS_AWAKE);
        
        // 힌트 메시지 숨기기
        if (hintElement) {
            hintElement.style.opacity = '0';
            hintElement.style.visibility = 'hidden';
        }
        
        // 깨어 있는 유지 시간 후 다시 잠들기
        if (state.awakeTimeout) {
            clearTimeout(state.awakeTimeout);
        }
        
        state.awakeTimeout = setTimeout(() => {
            fallAsleep();
        }, CONFIG.AWAKE_DURATION);
        
        console.log('쿨쿨 세포가 깨어났습니다!');
    }
    
    /**
     * 잠들기
     */
    function fallAsleep() {
        state.isSleeping = true;
        state.isAwake = false;
        // 눈은 그대로 감겨있음 (eyeCloseProgress 유지)
        
        // 클래스 토글
        character.classList.remove(CONFIG.CLASS_AWAKE);
        character.classList.add(CONFIG.CLASS_SLEEP);
        
        console.log('쿨쿨 세포가 다시 잠들었습니다.');
    }
    
    /**
     * 스페이스바 입력 처리
     */
    function handleSpaceInput(event) {
        // 스페이스바만 처리
        if (event.key !== ' ' && event.key !== 'Space' && event.code !== 'Space') {
            return;
        }
        
        // 기본 동작 방지 (스크롤 방지)
        event.preventDefault();
        
        openEyes();
    }
    
    /**
     * 눈 감기 루프 시작
     */
    function startEyeCloseLoop() {
        if (state.eyeCloseInterval) {
            clearInterval(state.eyeCloseInterval);
        }
        
        state.eyeCloseInterval = setInterval(() => {
            closeEyes();
        }, 50);
    }
    
    /**
     * 초기화
     */
    function init() {
        // 초기 상태 설정: 자는 상태, 눈은 조금 감김
        character.classList.add(CONFIG.CLASS_SLEEP);
        character.classList.remove(CONFIG.CLASS_AWAKE);
        
        // 초기 눈 상태: 약간 감김 (20%)
        state.eyeCloseProgress = 20;
        updateEyeCover();
        
        // 이벤트 리스너 등록
        // 스페이스바만 작동
        window.addEventListener('keydown', handleSpaceInput);
        
        
        // 눈 감기 루프 시작
        startEyeCloseLoop();
        
        // 깜빡임 루프 시작
        startBlinkLoop();
        
        console.log('쿨쿨 세포 인터랙션 초기화 완료 (눈 감기 효과)');
    }
    
    // 초기화 실행
    init();
    
    // 정리 함수 반환 (필요시 사용)
    return {
        wakeUp,
        fallAsleep,
        reset: () => {
            state.eyeCloseProgress = 20;
            state.isSleeping = true;
            state.isAwake = false;
            state.currentCloseSpeed = CONFIG.EYE_CLOSE_SPEED_BASE;
            stopZzzEffect();
            updateEyeCover();
            character.classList.remove(CONFIG.CLASS_AWAKE);
            character.classList.add(CONFIG.CLASS_SLEEP);
        }
    };
}
