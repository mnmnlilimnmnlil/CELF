/**
 * CELF - Attention Cell Interaction
 * Section 07: 관종 세포 인터랙션
 * 간단한 두더지잡기 스타일
 */

/**
 * 현재 테마 모드 가져오기
 */
function getThemeMode() {
    return document.documentElement.getAttribute('data-theme') || 'light';
}

/**
 * 캐릭터 이미지 업데이트 (테마에 따라)
 * AI 활용: MutationObserver를 사용한 테마 변경 감지, 이미지 preloading으로 깜빡임 방지
 */
function updateCharacterImage() {
    const character = document.getElementById('attentionCharacter');
    if (!character) return;
    
    const theme = getThemeMode();
    // 화이트 모드: attention03, 블랙 모드: attention04
    const imageName = theme === 'dark' ? 'attention04' : 'attention03';
    const newSrc = `./assets/character/${imageName}.png`;
    
    // 이미지가 변경되지 않으면 업데이트하지 않음 (깜빡임 방지)
    if (character.src && character.src.includes(imageName)) {
        return;
    }
    
    // AI 활용: 이미지 preloading으로 깜빡임 방지
    const img = new Image();
    img.onload = () => {
        character.src = img.src;
    };
    img.src = newSrc;
}

/**
 * 슬롯 이미지 경로 가져오기 (테마에 따라)
 */
function getSlotImagePath() {
    const theme = getThemeMode();
    // 화이트 모드: attentioncard01, 블랙 모드: attentioncard02
    const imageName = theme === 'dark' ? 'attentioncard02' : 'attentioncard01';
    return `./assets/character/${imageName}.png`;
}

const CONFIG = {
    POP_DURATION: 800,     // 팝업 애니메이션 시간 (더 느리게)
    HIDE_DURATION: 400,    // 사라지는 애니메이션 시간
    POP_DISTANCE: 30,      // 경계 밖에서 안쪽으로 튀어오는 거리(px) - 줄임
    SLOT_COUNT: 6,         // 슬롯 개수
    BOX_SIZE: 400,         // 박스 크기 (px)
    HOVER_LIFT: 15,        // 호버 시 살짝 올라오는 거리(px) - 줄임
    BUBBLE_GAP:20,        // 기본 말풍선 간격(px)
    BUBBLE_GAP_TOP:20,     // 위쪽 등장 시 간격(px)
    BUBBLE_GAP_SIDE: 20    // 좌우 등장 시 간격(px)
};

export function initAttention() {
    const character = document.getElementById('attentionCharacter');
    const messageElement = document.getElementById('attentionMessage');
    const section = document.getElementById('section07');
    if (!character || !messageElement || !section) return;
    
    const messages = [
        '여기 봐!!',
        '나 어때??',
        '나 좀 봐라!',
        '쨔쟈쟈쟌',
        '나한테 집중해!',
        '안녕?',
        '나야나!',
        '나 좀 봐줄래?'
    ];
    
    // 방향 정의
    const directions = [
        { name: 'top', angle: -180 },
        { name: 'bottom', angle: 0 },
        { name: 'left', angle: 90 },
        { name: 'right', angle: -90 },
        { name: 'topleft', angle: 115 },
        { name: 'topright', angle: -115 },
        { name: 'bottomleft', angle: 60 },
        { name: 'bottomright', angle: -60 }
    ];
    
    const slots = [];
    let currentSlotIndex = -1;
    let isTransitioning = false; // 전환 중 플래그
    
    // 메시지 랜덤 선택
    function getRandomMessage() {
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    // 방향별 위치 계산
    function getPosition(dir, rect, w, h) {
        const d = CONFIG.POP_DISTANCE;
        // 중앙 범위로 제한 (25%~75%) - 극단적인 위치 방지, 이미지 가려짐 방지
        const randXCentered = () => {
            const minX = rect.width * 0.25;
            const maxX = rect.width * 0.75 - w;
            return minX + Math.random() * (maxX - minX);
        };
        const randYCentered = () => {
            const minY = rect.height * 0.25;
            const maxY = rect.height * 0.75 - h;
            return minY + Math.random() * (maxY - minY);
        };
        // 대각선용 랜덤 (더 넓은 범위)
        const randX = () => Math.random() * (rect.width - w * 0.6) + w * 0.3;
        const randY = () => Math.random() * (rect.height - h * 0.6) + h * 0.3;
        
        // 초기 위치는 섹션 밖, tx/ty는 안쪽으로 이동하는 거리
        const moveDist = h * 0.8 + d; // 전체 높이의 70% + 거리만큼 나오도록
        switch (dir.name) {
            case 'top':
                // 위쪽 밖에서 시작, 아래로 올라옴 (X는 중앙 범위로 제한)
                return { x: randXCentered(), y: -h, tx: 0, ty: moveDist, angle: dir.angle };
            case 'bottom':
                // 아래쪽 밖에서 시작, 위로 올라옴 (X는 중앙 범위로 제한)
                return { x: randXCentered(), y: rect.height, tx: 0, ty: -moveDist, angle: dir.angle };
            case 'left':
                // 왼쪽 밖에서 시작, 오른쪽으로 올라옴 (Y는 중앙 범위로 제한)
                return { x: -w, y: randYCentered(), tx: moveDist, ty: 0, angle: dir.angle };
            case 'right':
                // 오른쪽 밖에서 시작, 왼쪽으로 올라옴 (Y는 중앙 범위로 제한)
                return { x: rect.width, y: randYCentered(), tx: -moveDist, ty: 0, angle: dir.angle };
            case 'topleft':
                // 왼쪽 위 밖에서 시작, 오른쪽 아래로 올라옴
                return { x: -w, y: -h, tx: moveDist * 0.9, ty: moveDist * 0.93, angle: dir.angle };
            case 'topright':
                // 오른쪽 위 밖에서 시작, 왼쪽 아래로 올라옴
                return { x: rect.width, y: -h, tx: -moveDist * 0.9, ty: moveDist * 0.93, angle: dir.angle };
            case 'bottomleft':
                // 왼쪽 아래 밖에서 시작, 오른쪽 위로 올라옴
                return { x: -w, y: rect.height, tx: moveDist * 0.9, ty: -moveDist * 0.93, angle: dir.angle };
            case 'bottomright':
                // 오른쪽 아래 밖에서 시작, 왼쪽 위로 올라옴
                return { x: rect.width, y: rect.height, tx: -moveDist * 0.9, ty: -moveDist * 0.93, angle: dir.angle };
            default:
                return { x: 0, y: 0, tx: 0, ty: 0, angle: 0 };
        }
    }

    // 말풍선을 캐릭터 회전 각도에 맞춰 '머리 위쪽' 방향으로 배치
    function positionBubble(dir, w, h, bubble, tail) {
        const angleDeg = dir.angle;
        const angleRad = (angleDeg * Math.PI) / 180;
        // 로컬에서 머리 위 방향은 (0, -1); 회전각을 적용해 월드 방향으로 변환
        const base = h * 0.35 + CONFIG.BUBBLE_GAP_TOP;
        const offsetX = Math.sin(angleRad) * base;
        const offsetY = -Math.cos(angleRad) * base;

        bubble.style.left = '50%';
        bubble.style.top = '50%';
        bubble.style.right = 'auto';
        bubble.style.bottom = 'auto';
        bubble.style.transform = `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px) rotate(${angleDeg}deg)`;

        if (tail) {
            const tailBase = h * 0.18; // 꼬리는 더 짧게
            const tailX = Math.sin(angleRad) * tailBase;
            const tailY = -Math.cos(angleRad) * tailBase;
            tail.style.left = '50%';
            tail.style.top = '50%';
            tail.style.right = 'auto';
            tail.style.bottom = 'auto';
            tail.style.transform = `translate(-50%, -50%) translate(${tailX}px, ${tailY}px) rotate(${45 + angleDeg}deg)`;
        }
    }
    
    // 슬롯 생성
    function createSlot(index) {
        const slot = document.createElement('div');
        slot.style.position = 'absolute';
        slot.style.opacity = '0';
        slot.style.pointerEvents = 'auto'; // 자식 클릭 허용
        slot.style.display = 'none';
        slot.style.zIndex = '3'; // 캐릭터/말풍선이 위에 보이도록
        
        // 이미지 박스
        const imageBox = document.createElement('div');
        imageBox.style.position = 'absolute';
        imageBox.style.left = '0';
        imageBox.style.top = '0';
        imageBox.style.width = `${CONFIG.BOX_SIZE}px`;
        imageBox.style.height = `${CONFIG.BOX_SIZE}px`;
        imageBox.style.overflow = 'visible';
        imageBox.style.borderRadius = '14px';
        imageBox.style.transformOrigin = 'center center';
        
        // 슬롯 이미지는 카드 이미지 사용
        const img = document.createElement('img');
        img.src = getSlotImagePath();
        img.alt = '관종 세포';
        img.style.position = 'absolute';
        img.style.left = '50%';
        img.style.top = '50%';
        img.style.transform = 'translate(-50%, -50%)';
        img.style.width = '160%';
        img.style.height = '160%';
        img.style.objectFit = 'contain';
        img.style.pointerEvents = 'auto';
        img.style.cursor = 'pointer';
        imageBox.appendChild(img);
        
        // 텍스트 박스 (말풍선)
        const textBox = document.createElement('div');
        textBox.style.position = 'absolute';
        textBox.style.left = '0';
        textBox.style.top = '0';
        textBox.style.width = '100%';
        textBox.style.height = '100%';
        textBox.style.pointerEvents = 'none'; // 말풍선은 클릭 없음

        const bubble = messageElement.cloneNode(true);
        bubble.id = '';
        bubble.style.position = 'absolute';
        bubble.style.left = '50%';
        bubble.style.top = 'auto';
        bubble.style.bottom = `${CONFIG.BOX_SIZE + CONFIG.BUBBLE_GAP}px`; // 기본: 이미지 위
        bubble.style.transform = 'translateX(-50%)';
        bubble.style.opacity = '0';
        bubble.style.padding = '10px 14px';
        bubble.style.borderRadius = '14px';
        bubble.style.boxShadow = '0 6px 16px rgba(0,0,0,0.18)';
        bubble.style.fontWeight = '700';
        bubble.style.fontSize = '1rem';
        bubble.style.whiteSpace = 'nowrap';
        bubble.style.zIndex = '2';
        bubble.style.pointerEvents = 'none';
        bubble.classList.remove('visible');

        // 말풍선 꼬리
        const tail = document.createElement('div');
        tail.style.position = 'absolute';
        tail.style.width = '12px';
        tail.style.height = '12px';
        tail.style.left = '50%';
        tail.style.bottom = '-6px';
        tail.style.transform = 'translateX(-50%) rotate(45deg)';
        tail.style.borderRadius = '2px';
        bubble.appendChild(tail);

        textBox.appendChild(bubble);
        slot.appendChild(imageBox);
        slot.appendChild(textBox);
        section.appendChild(slot);
        
        // 슬롯 인덱스를 데이터 속성으로 저장
        slot.dataset.slotIndex = index;
        img.dataset.slotIndex = index;
        
        // 클릭 이벤트 (버블 겹침 방지 위해 캡처 단계에서)
        slot.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isTransitioning) return;
            const clickedSlotIndex = parseInt(slot.dataset.slotIndex || '-1');
            if (clickedSlotIndex !== currentSlotIndex) return;
            
            isTransitioning = true;
            const slotToHide = currentSlotIndex;
            hideSlot(slotToHide, () => {
                isTransitioning = false;
                showRandomSlot();
            });
        }, true);

        // 호버 시 살짝 띄우기 (등장 방향으로 더 나가게)
        slot.addEventListener('mouseenter', () => {
            if (isTransitioning) return;
            if (currentSlotIndex !== index) return;
            const tx = parseFloat(slot.dataset.tx || '0');
            const ty = parseFloat(slot.dataset.ty || '0');
            const dist = Math.sqrt(tx * tx + ty * ty) || 1;
            const scale = CONFIG.HOVER_LIFT / dist;
            const hx = tx * (1 + scale); // 현재 위치에서 등장 방향으로 더 나가게
            const hy = ty * (1 + scale);
            slot.style.transition = `transform 200ms ease-out`;
            slot.style.transform = `translate(${hx}px, ${hy}px)`;
        });
        slot.addEventListener('mouseleave', () => {
            if (isTransitioning) return;
            if (currentSlotIndex !== index) return;
            const tx = parseFloat(slot.dataset.tx || '0');
            const ty = parseFloat(slot.dataset.ty || '0');
            slot.style.transition = `transform 200ms ease-out`;
            slot.style.transform = `translate(${tx}px, ${ty}px)`; // 원래 등장 위치로
        });
        
        return { slot, imageBox, img, bubble, tail, textBox };
    }
    
    // 슬롯들 생성
    function initSlots() {
        for (let i = 0; i < CONFIG.SLOT_COUNT; i++) {
            slots.push(createSlot(i));
        }
    }
    
    // 슬롯 보이기
    function showSlot(index) {
        if (index < 0 || index >= slots.length) return;
        if (isTransitioning) return; // 전환 중이면 무시
        
        // 이전 슬롯이 있으면 먼저 숨기기
        if (currentSlotIndex >= 0 && currentSlotIndex !== index) {
            hideSlot(currentSlotIndex, null, false); // 콜백 없이, currentSlotIndex는 변경하지 않음
        }
        
        isTransitioning = true;
        const { slot, imageBox, bubble, tail } = slots[index];
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const rect = section.getBoundingClientRect();
        const w = CONFIG.BOX_SIZE;
        const h = CONFIG.BOX_SIZE;
        const { x, y, tx, ty, angle } = getPosition(dir, rect, w, h);
        
        // 초기 위치 (섹션 밖 - overflow hidden 밖에서 시작)
        slot.style.display = 'block';
        slot.style.width = `${w}px`;
        slot.style.height = `${h}px`;
        slot.style.left = `${x}px`;
        slot.style.top = `${y}px`;
        slot.style.transition = 'none';
        // 초기에는 섹션 밖에 있음 (transform 없음 = 원래 위치)
        slot.style.transform = `translate(0, 0)`;
        slot.style.opacity = '0'; // 처음엔 투명
        slot.style.pointerEvents = 'auto'; // 초기에도 클릭 가능하게 유지
        imageBox.style.transform = `rotate(${angle}deg)`;
        
        // 데이터 저장
        slot.dataset.tx = tx;
        slot.dataset.ty = ty;
        slot.dataset.angle = angle;
        
        bubble.textContent = getRandomMessage();
        bubble.style.transition = 'none';
        bubble.style.opacity = '0';
        bubble.classList.remove('visible');
        // 테마별 말풍선 색상
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#fff' : '#111';
        const bgColor = isDark ? 'rgba(0, 0, 0, 0.82)' : 'rgba(255, 255, 255, 0.94)';
        const borderColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)';
        bubble.style.color = textColor;
        bubble.style.background = bgColor;
        bubble.style.border = `1px solid ${borderColor}`;
        if (tail) {
            tail.style.background = bgColor;
            tail.style.border = `1px solid ${borderColor}`;
            tail.style.borderTop = 'none';
            tail.style.borderLeft = 'none';
        }
        positionBubble(dir, w, h, bubble, tail);
        
        // 현재 슬롯 저장을 먼저 설정하여 초기 클릭 누락 방지
        currentSlotIndex = index;

        // 팝업 애니메이션 (슬며시 올라오는 효과 - overflow hidden 밖에서 안쪽으로)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // 더 부드러운 easing 함수 사용
                slot.style.transition = `opacity ${CONFIG.POP_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform ${CONFIG.POP_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                // 말풍선도 부드럽게 페이드 인
                bubble.style.transition = `opacity ${CONFIG.POP_DURATION * 0.8}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                slot.style.opacity = '1';
                slot.style.pointerEvents = 'auto'; // 애니메이션 시작 시 클릭 가능
                // 섹션 안쪽으로 이동 (tx, ty만큼 안쪽으로)
                slot.style.transform = `translate(${tx}px, ${ty}px)`;
                // 말풍선은 약간 늦게 나타나도록
                setTimeout(() => {
                    bubble.style.opacity = '1';
                    bubble.classList.add('visible');
                }, CONFIG.POP_DURATION * 0.2);
            });
        });
        // 애니메이션 완료 후 전환 플래그 해제 (타이머 + transitionend 보강)
        const clearTransition = () => {
            if (!isTransitioning) return;
            isTransitioning = false;
        };
        slot.addEventListener('transitionend', clearTransition, { once: true });
        setTimeout(clearTransition, CONFIG.POP_DURATION + 80);
        
    }
    
    // 슬롯 숨기기
    function hideSlot(index, callback = null, updateCurrentIndex = true) {
        if (index < 0 || index >= slots.length) {
            if (callback) callback();
            return;
        }
        
        const { slot, imageBox, bubble, tail } = slots[index];
        const tx = parseFloat(slot.dataset.tx || '0');
        const ty = parseFloat(slot.dataset.ty || '0');
        const angle = parseFloat(slot.dataset.angle || '0');
        
        // 등장했던 방향의 반대로 이동하며 숨김 (페이드 없이)
        slot.style.transition = `transform ${CONFIG.HIDE_DURATION}ms ease-out`;
        slot.style.transform = `translate(0, 0)`; // 반대 방향으로 (원래 위치로)
        slot.style.opacity = '1';
        slot.style.pointerEvents = 'none';
        imageBox.style.transform = `rotate(${angle}deg)`;
        
        // 말풍선은 위치/회전 고정, 투명도만 관리
        bubble.style.transition = `opacity ${CONFIG.HIDE_DURATION}ms ease-out`;
        bubble.style.opacity = '0';
        bubble.classList.remove('visible');
        
        setTimeout(() => {
            slot.style.display = 'none';
            if (updateCurrentIndex && currentSlotIndex === index) {
                currentSlotIndex = -1;
            }
            if (callback) callback();
        }, CONFIG.HIDE_DURATION);
    }
    
    // 랜덤 슬롯 보이기
    function showRandomSlot() {
        if (slots.length === 0) return;
        
        // 현재 보이는 슬롯 제외하고 랜덤 선택
        const availableIndices = slots
            .map((_, i) => i)
            .filter(i => i !== currentSlotIndex);
        
        if (availableIndices.length === 0) {
            // 모든 슬롯이 사용되었으면 다시 랜덤
            const nextIndex = Math.floor(Math.random() * slots.length);
            showSlot(nextIndex);
        } else {
            const nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            showSlot(nextIndex);
        }
    }
    
    // 바로 초기화
    initSlots();
    setTimeout(() => {
        showRandomSlot();
    }, 100);
    
    // 슬롯 이미지 업데이트 함수
    function updateSlotImages() {
        const newImagePath = getSlotImagePath();
        slots.forEach(slot => {
            if (slot.img) {
                // 이미지가 변경되지 않으면 업데이트하지 않음 (깜빡임 방지)
                if (slot.img.src && slot.img.src.includes(newImagePath.split('/').pop())) {
                    return;
                }
                // AI 활용: 이미지 preloading으로 깜빡임 방지
                const img = new Image();
                img.onload = () => {
                    slot.img.src = img.src;
                };
                img.src = newImagePath;
            }
        });
    }
    
    // 초기 이미지 설정
    updateCharacterImage();
    
    // AI 활용: 테마 변경 감지 (MutationObserver)
    const html = document.documentElement;
    const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                updateCharacterImage();
                updateSlotImages();
            }
        });
    });
    themeObserver.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    
    console.log('관종 세포 인터랙션 초기화 완료');
}
