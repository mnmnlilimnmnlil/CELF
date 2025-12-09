/**
 * CELF - Card Grid
 * Section 01: 9개 세포 카드 그리드 구현 (3D tilt 효과)
 */

/**
 * 카드 데이터
 * 공감 세포는 정중앙에 배치되므로 별도 처리
 */
const cellCards = [
    { id: "hungry", title: "출출 세포", sectionId: "section02", imageLight: "hungrywhite01", imageDark: "hungry01" },
    { id: "curious", title: "호기심 세포", sectionId: "section03", imageLight: "hogiwhite01", imageDark: "hogiblack01" },
    { id: "love", title: "사랑 세포", sectionId: "section04", imageLight: "love", imageDark: "love01" },
    { id: "sleepy", title: "쿨쿨 세포", sectionId: "section05", imageLight: "sleepy", imageDark: "sleepy01" },
    { id: "prime", title: "공감 세포", sectionId: null, image: "main", isCenter: true }, // 정중앙
    { id: "anxiety", title: "불안 세포", sectionId: "section06", imageLight: "anxiety", imageDark: "anxiety01" },
    { id: "attention", title: "관종 세포", sectionId: "section07", imageLight: "attention", imageDark: "attention01" },
    { id: "dream", title: "상상 세포", sectionId: "section08", imageLight: "dream", imageDark: "dream01" },
    { id: "fashion", title: "패션 세포", sectionId: "section09", imageLight: "fashion", imageDark: "fashion01" }
];

// 각 카드별 requestAnimationFrame ID 저장
const cardRafIds = new WeakMap();

/**
 * 현재 테마 모드 가져오기
 */
function getThemeMode() {
    return document.documentElement.getAttribute('data-theme') || 'light';
}

/**
 * 3D Tilt 효과 및 오버레이 효과 적용
 */
function applyTiltEffect(card, overlay, event) {
    // 이전 요청 취소
    const prevRafId = cardRafIds.get(card);
    if (prevRafId !== undefined) {
        cancelAnimationFrame(prevRafId);
    }
    
    // requestAnimationFrame으로 부드러운 업데이트
    const rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = event.offsetX !== undefined ? event.offsetX : (event.clientX - rect.left);
        const y = event.offsetY !== undefined ? event.offsetY : (event.clientY - rect.top);
        
        // 예제 기준 크기 (220x310)에 맞춰 정규화
        // 현재 카드 크기: 380x530
        const scaleX = 220 / rect.width;  // 220/380 ≈ 0.579
        const scaleY = 310 / rect.height; // 310/530 ≈ 0.585
        
        // 정규화된 좌표로 회전 계산 (반응 강도 줄임)
        const normalizedX = x * scaleX;
        const normalizedY = y * scaleY;
        
        // 회전 각도를 절반으로 줄임 (빛 효과는 그대로 유지)
        const rotateY = -1/10 * normalizedX + 10;
        const rotateX = 2/30 * normalizedY - 10;
        
        // 오버레이 효과 - 마우스 위치에 따라 빛 이동 (반사 효과)
        // 카드가 기울어지는 방향과 반대로 빛이 이동하도록
        // 마우스가 오른쪽에 있으면 카드는 왼쪽으로 기울어지고, 빛은 왼쪽에서 반사됨
        const reverseX = rect.width - x;
        const reverseY = rect.height - y;
        
        // 빛의 위치를 더 자연스럽게 계산
        // 카드 중심을 기준으로 마우스 위치에 따라 빛이 이동
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = (reverseX - centerX) / centerX; // -1 ~ 1
        const offsetY = (reverseY - centerY) / centerY; // -1 ~ 1
        
        // 빛의 위치를 퍼센트로 계산 (중앙 50% 기준으로 이동)
        const lightX = 50 + offsetX * 30; // 20% ~ 80%
        const lightY = 50 + offsetY * 30; // 20% ~ 80%
        
        // 테마에 따라 오버레이 효과 조정
        const theme = getThemeMode();
        // 마우스 위치에 따라 opacity 계산 (중앙에서 멀수록 더 밝게)
        const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
        const opacity = Math.min(0.85, 0.3 + (distanceFromCenter / maxDistance) * 0.55);
        
        // 인라인 스타일로 background-position 직접 설정
        // 다크모드/화이트모드 모두에서 작동하도록 강제 설정
        overlay.style.backgroundPosition = `${lightX}% ${lightY}%`;
        
        // 디버깅용 콘솔 로그 (확인 후 제거 가능)
        // console.log('Background position:', overlay.style.backgroundPosition, 'Theme:', theme);
        
        // 둘 다 흰색 빛 사용, 다크모드에서는 약간 덜 밝게
        if (theme === 'dark') {
            overlay.style.filter = `opacity(${opacity}) brightness(0.95)`;
        } else {
            overlay.style.filter = `opacity(${opacity}) brightness(1.2)`;
        }
        
        // 3D Tilt 효과
        card.style.transform = `perspective(350px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        cardRafIds.delete(card);
    });
    
    cardRafIds.set(card, rafId);
}

/**
 * 카드 리셋
 */
function resetCard(card, overlay) {
    // 진행 중인 requestAnimationFrame 취소
    const rafId = cardRafIds.get(card);
    if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
        cardRafIds.delete(card);
    }
    
    // 테마에 관계없이 opacity만 0으로 설정
    overlay.style.filter = 'opacity(0)';
    overlay.style.backgroundPosition = '50% 50%';
    card.style.transform = 'perspective(350px) rotateY(0deg) rotateX(0deg)';
}

/**
 * 테마 변경 시 모든 카드 이미지 업데이트
 */
function updateAllCardImages() {
    const cards = document.querySelectorAll('.cell-card');
    cards.forEach(card => {
        const cardDataStr = card.dataset.cardData;
        if (cardDataStr) {
            const cardData = JSON.parse(cardDataStr);
            updateCardImage(card, cardData);
        }
    });
}

/**
 * 카드 그리드 초기화
 */
export function initCardGrid(scrollCallback) {
    const cardGrid = document.getElementById('cardGrid');
    if (!cardGrid) return;
    
    // 공감 세포를 제외한 카드들 먼저 생성
    const otherCards = cellCards.filter(card => !card.isCenter);
    const centerCard = cellCards.find(card => card.isCenter);
    
    // 정중앙이 아닌 카드들 생성 (8개)
    otherCards.forEach((cardData, index) => {
        const card = createCard(cardData, scrollCallback);
        cardGrid.appendChild(card);
    });
    
    // 공감 세포를 정중앙(5번째 위치)에 삽입
    if (centerCard) {
        const centerCardElement = createCard(centerCard, scrollCallback);
        // 4번째 카드 다음에 삽입 (0,1,2,3 다음 = 5번째 위치)
        const cards = cardGrid.querySelectorAll('.cell-card');
        if (cards.length >= 4) {
            cardGrid.insertBefore(centerCardElement, cards[4]);
        } else {
            cardGrid.appendChild(centerCardElement);
        }
    }
    
    // 테마 변경 감지
    const html = document.documentElement;
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                updateAllCardImages();
            }
        });
    });
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    
    console.log('카드 그리드 초기화 완료');
}

/**
 * 현재 테마에 맞는 이미지 경로 가져오기
 */
function getImagePath(cardData) {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    
    // 공감 세포는 항상 main.png
    if (cardData.isCenter && cardData.image) {
        return `./assets/character/${cardData.image}.png`;
    }
    
    // 다른 세포들은 테마에 따라 다른 이미지
    if (currentTheme === 'dark' && cardData.imageDark) {
        return `./assets/character/${cardData.imageDark}.png`;
    } else if (cardData.imageLight) {
        return `./assets/character/${cardData.imageLight}.png`;
    }
    
    // 기본값
    return './assets/character/main.png';
}

/**
 * 카드 이미지 업데이트
 */
function updateCardImage(card, cardData) {
    const image = card.querySelector('.cell-card-image');
    if (image) {
        image.src = getImagePath(cardData);
    }
}

/**
 * 카드 요소 생성 함수
 */
function createCard(cardData, scrollCallback) {
    const card = document.createElement('div');
    card.className = 'cell-card';
    card.dataset.cellId = cardData.id;
    
    // 오버레이 생성
    const overlay = document.createElement('div');
    overlay.className = 'cell-card-overlay';
    
    const content = document.createElement('div');
    content.className = 'cell-card-content';
    
    const image = document.createElement('img');
    image.className = 'cell-card-image';
    // 테마에 맞는 이미지 사용
    image.src = getImagePath(cardData);
    image.alt = cardData.title;
    image.onerror = function() {
        // 이미지가 없을 경우 플레이스홀더
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.style.width = '100%';
        placeholder.style.height = '100%';
        placeholder.style.background = 'var(--bg-secondary)';
        content.appendChild(placeholder);
    };
    
    content.appendChild(image);
    card.appendChild(content);
    card.appendChild(overlay);
    
    // 3D Tilt 및 오버레이 효과
    card.addEventListener('mousemove', (e) => {
        applyTiltEffect(card, overlay, e);
    });
    
    card.addEventListener('mouseleave', () => {
        resetCard(card, overlay);
    });
    
    // 클릭 이벤트 - 해당 섹션으로 스크롤 (sectionId가 있는 경우만)
    card.addEventListener('click', () => {
        if (cardData.sectionId && scrollCallback) {
            scrollCallback(cardData.sectionId);
        }
    });
    
    // 카드 데이터를 저장 (테마 변경 시 사용)
    card.dataset.cardData = JSON.stringify(cardData);
    
    return card;
}

