/**
 * CELF - Curious Cell Interaction
 * Section 04: 호기심 세포 인터랙션
 */

/**
 * 호기심 세포 이미지 업데이트 (테마에 따라)
 */
function updateCuriousCharacterImage() {
    const character = document.getElementById('curiousCharacter');
    if (!character) return;
    
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    
    if (currentTheme === 'dark') {
        character.src = './assets/character/hogiwhite02.png';
    } else {
        character.src = './assets/character/hogiblack02.png';
    }
}

/**
 * 호기심 세포 인터랙션 초기화
 */
export function initCurious() {
    const character = document.getElementById('curiousCharacter');
    const particleContainer = document.getElementById('curiousParticles');
    const container = character?.parentElement;
    
    if (!character || !particleContainer || !container) return;
    
    // 초기 이미지 설정
    updateCuriousCharacterImage();
    
    // 테마 변경 감지
    const html = document.documentElement;
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                updateCuriousCharacterImage();
            }
        });
    });
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    
    let clickCount = 0;
    let lastClickTime = 0;
    let lastReactionTime = 0;
    const REACTION_COOLDOWN = 800; // 0.8초 쿨다운
    
    /**
     * 반응 텍스트 표시 함수
     */
    function showReactionText(text) {
        const now = Date.now();
        // 쿨다운 체크
        if (now - lastReactionTime < REACTION_COOLDOWN) {
            return; // 쿨다운 중이면 표시하지 않음
        }
        lastReactionTime = now;
        
        const textElement = document.createElement('div');
        textElement.className = 'curious-reaction-text';
        textElement.textContent = text;
        
        const characterRect = character.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const centerX = characterRect.left + characterRect.width / 2 - containerRect.left;
        const centerY = characterRect.top + characterRect.height / 2 - containerRect.top;
        
        // 위쪽 여러 방향에서 랜덤 위치 (캐릭터 위쪽 반원)
        const angle = (Math.random() - 0.5) * Math.PI; // -90도 ~ 90도 (위쪽 반원)
        const distance = 80 + Math.random() * 60; // 80~140px
        const offsetX = Math.sin(angle) * distance;
        const offsetY = -Math.abs(Math.cos(angle)) * distance; // 위쪽으로만
        
        // 랜덤 각도 (-20도 ~ 20도)
        const rotation = (Math.random() - 0.5) * 40;
        
        textElement.style.left = `${centerX + offsetX}px`;
        textElement.style.top = `${centerY + offsetY}px`;
        textElement.style.setProperty('--rotation', `${rotation}deg`);
        
        particleContainer.appendChild(textElement);
        
        // 제거
        setTimeout(() => {
            if (textElement.parentNode) {
                textElement.parentNode.removeChild(textElement);
            }
        }, 2500);
    }
    
    /**
     * 스크롤 감지
     */
    let lastScrollY = window.scrollY;
    let scrollTimeout = null;
    
    function handleScroll() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const currentScrollY = window.scrollY;
            const section = container.closest('.section');
            if (!section) return;
            
            const sectionRect = section.getBoundingClientRect();
            // 섹션이 화면에 보일 때만 반응
            if (sectionRect.top < window.innerHeight && sectionRect.bottom > 0) {
                const scrollDelta = currentScrollY - lastScrollY;
                if (Math.abs(scrollDelta) > 50) {
                    // 스크롤 방향에 따라 다른 텍스트
                    if (scrollDelta > 0) {
                        // 아래로 스크롤
                        const downReactions = ['내려가는거야?', '어디가?', '다음은 무슨세포지?', '나는 무슨세포지?'];
                        const randomReaction = downReactions[Math.floor(Math.random() * downReactions.length)];
                        showReactionText(randomReaction);
                    } else {
                        // 위로 스크롤
                        const upReactions = ['올라가는거야?', '출출이 보러가?'];
                        const randomReaction = upReactions[Math.floor(Math.random() * upReactions.length)];
                        showReactionText(randomReaction);
                    }
                }
            }
            lastScrollY = currentScrollY;
        }, 100);
    }
    
    /**
     * 초기화 실행
     */
    character.addEventListener('mouseenter', () => {
        // 호버 반응 텍스트 (3개 중 랜덤)
        const hoverReactions = ['호버한거야?', '호버가 뭔지알아?', '호버란 뭘까?'];
        const randomReaction = hoverReactions[Math.floor(Math.random() * hoverReactions.length)];
        showReactionText(randomReaction);
    });
    
    character.addEventListener('click', (event) => {
        const now = Date.now();
        
        // 1초 이내 클릭이면 카운트 증가, 아니면 리셋
        if (now - lastClickTime < 1000) {
            clickCount++;
        } else {
            clickCount = 1;
        }
        lastClickTime = now;
        
        // 5번 클릭했을 때
        if (clickCount >= 5) {
            showReactionText('왜 클릭을 많이해?');
            clickCount = 0; // 리셋
        } else {
            // 일반 클릭 반응 텍스트 (2개 중 랜덤)
            const clickReactions = ['클릭 했구나?', '클릭 한거맞지?'];
            const randomReaction = clickReactions[Math.floor(Math.random() * clickReactions.length)];
            showReactionText(randomReaction);
        }
    });
    
    /**
     * 키보드 입력 감지
     */
    function handleKeyPress(event) {
        const section = container.closest('.section');
        if (!section) return;
        
        const sectionRect = section.getBoundingClientRect();
        // 섹션이 화면에 보일 때만 반응
        if (sectionRect.top < window.innerHeight && sectionRect.bottom > 0) {
            // 키 이름 가져오기
            let keyName = event.key;
            
            // 특수 키 처리
            if (keyName === ' ') {
                keyName = '스페이스';
            } else if (keyName === 'Enter') {
                keyName = '엔터';
            } else if (keyName === 'ArrowUp') {
                keyName = '위 화살표';
            } else if (keyName === 'ArrowDown') {
                keyName = '아래 화살표';
            } else if (keyName === 'ArrowLeft') {
                keyName = '왼쪽 화살표';
            } else if (keyName === 'ArrowRight') {
                keyName = '오른쪽 화살표';
            } else if (keyName === 'Escape') {
                keyName = 'ESC';
            } else if (keyName === 'Tab') {
                keyName = '탭';
            } else if (keyName === 'Backspace') {
                keyName = '백스페이스';
            } else if (keyName === 'Delete') {
                keyName = '딜리트';
            } else if (keyName.length === 1 && /[a-zA-Z]/.test(keyName)) {
                // 영문자는 그대로 표시
                keyName = keyName.toUpperCase();
            }
            
            // 반응 텍스트 표시
            showReactionText(`${keyName} 눌렀어?`);
        }
    }
    
    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 키보드 이벤트 리스너
    window.addEventListener('keydown', handleKeyPress);
    
    console.log('호기심 세포 인터랙션 초기화 완료');
}

