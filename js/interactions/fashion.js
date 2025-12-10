/**
 * CELF - Fashion Cell Interaction
 * Section 09: 패션 세포 인터랙션
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
    const character = document.getElementById('fashionCharacter');
    if (!character) return;
    
    const theme = getThemeMode();
    // 화이트 모드: fashion03, 블랙 모드: fashion04
    const imageName = theme === 'dark' ? 'fashion04' : 'fashion03';
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
 * 패션 세포 인터랙션 초기화
 */
export function initFashion() {
    const character = document.getElementById('fashionCharacter');
    const section = document.getElementById('section09');
    if (!character || !section) return;
    
    const container = character.parentElement; // cell-character-container
    
    // 섹션 내 모든 이미지에 드래그 기능 추가 (캐릭터 이미지 제외)
    function makeImageDraggable(img) {
        // 이미지를 섹션 레벨로 이동 (섹션 전체에서 드래그 가능하도록)
        const interactionContainer = section.querySelector('.interaction-container');
        const needsMove = img.parentElement !== section;
        
        if (needsMove) {
            // 현재 스타일 위치 읽기 (부모 컨테이너 기준)
            const currentLeft = parseFloat(img.style.left) || 0;
            const currentTop = parseFloat(img.style.top) || 0;
            const oldParent = img.parentElement;
            
            // 부모 컨테이너의 섹션 기준 위치 계산
            const oldParentRect = oldParent.getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();
            
            // 부모 컨테이너의 섹션 기준 오프셋
            const parentOffsetX = oldParentRect.left - sectionRect.left;
            const parentOffsetY = oldParentRect.top - sectionRect.top;
            
            // 섹션 기준 절대 위치 계산
            const savedLeft = parentOffsetX + currentLeft;
            const savedTop = parentOffsetY + currentTop;
            
            // 이미지를 섹션에 직접 추가
            section.appendChild(img);
            
            // 위치 설정 (섹션 기준으로 변환된 위치)
            img.style.position = 'absolute';
            img.style.left = `${savedLeft}px`;
            img.style.top = `${savedTop}px`;
        } else {
            // 이미 섹션에 있으면 현재 위치를 섹션 기준으로 변환 (초기화 시 한 번만)
            // 다음 프레임에서 실행하여 DOM이 완전히 로드된 후 위치 보정
            requestAnimationFrame(() => {
                const imgRect = img.getBoundingClientRect();
                const sectionRect = section.getBoundingClientRect();
                const actualLeft = imgRect.left - sectionRect.left;
                const actualTop = imgRect.top - sectionRect.top;
                
                const currentLeft = parseFloat(img.style.left) || 0;
                const currentTop = parseFloat(img.style.top) || 0;
                
                // 스타일 위치와 실제 위치가 크게 다르면 실제 위치로 보정 (초기화 시에만)
                if (Math.abs(currentLeft - actualLeft) > 10 || Math.abs(currentTop - actualTop) > 10) {
                    img.style.left = `${actualLeft}px`;
                    img.style.top = `${actualTop}px`;
                }
            });
        }
        
        // 이미 absolute 위치가 아니면 설정
        if (getComputedStyle(img).position === 'static') {
            img.style.position = 'absolute';
        }
        
        // 이미지의 실제 렌더링 크기에 맞게 width/height 조정
        // object-fit: contain인 경우 실제 이미지 비율에 맞춰 크기 조정
        function adjustImageSize() {
            if (img.complete && img.naturalWidth && img.naturalHeight) {
                const computedStyle = getComputedStyle(img);
                const currentWidth = parseFloat(computedStyle.width) || img.offsetWidth;
                const currentHeight = parseFloat(computedStyle.height) || img.offsetHeight;
                
                // object-fit: contain인 경우 실제 이미지 비율 계산
                const imgAspect = img.naturalWidth / img.naturalHeight;
                const containerAspect = currentWidth / currentHeight;
                
                let actualWidth, actualHeight;
                if (imgAspect > containerAspect) {
                    // 이미지가 가로로 더 넓음 - width에 맞춤
                    actualWidth = currentWidth;
                    actualHeight = currentWidth / imgAspect;
                } else {
                    // 이미지가 세로로 더 김 - height에 맞춤
                    actualHeight = currentHeight;
                    actualWidth = currentHeight * imgAspect;
                }
                
                // 크기 배율 적용 (1.5배로 확대)
                const scale = 1;
                actualWidth *= scale;
                actualHeight *= scale;
                
                // 실제 렌더링 크기로 설정 (클릭 영역을 실제 이미지 크기로 제한)
                img.style.width = `${actualWidth}px`;
                img.style.height = `${actualHeight}px`;
            }
        }
        
        // 이미지 로드 후 크기 조정
        if (img.complete) {
            adjustImageSize();
        } else {
            img.addEventListener('load', adjustImageSize, { once: true });
        }
        
        img.style.cursor = 'move';
        img.style.userSelect = 'none';
        img.style.zIndex = '10';
        
        let isDragging = false;
        let offsetX = 0; // 마우스 클릭 위치와 이미지 왼쪽 상단의 오프셋
        let offsetY = 0;        
        
        // 마우스 이벤트
        img.addEventListener('mousedown', dragStart);
        img.addEventListener('touchstart', dragStart, { passive: false });
        
        function dragStart(e) {
            e.preventDefault();
            e.stopPropagation();
            
            let clientX, clientY;
            if (e.type === 'touchstart') {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            
            // 이미지의 실제 렌더링 영역 계산 (object-fit: contain 고려)
            const imgRect = img.getBoundingClientRect();
            const imgAspect = img.naturalWidth / img.naturalHeight;
            const containerAspect = imgRect.width / imgRect.height;
            
            let actualLeft, actualTop, actualWidth, actualHeight;
            
            if (imgAspect > containerAspect) {
                // 이미지가 가로로 더 넓음 - width에 맞춤
                actualWidth = imgRect.width;
                actualHeight = imgRect.width / imgAspect;
                actualLeft = imgRect.left;
                actualTop = imgRect.top + (imgRect.height - actualHeight) / 2;
            } else {
                // 이미지가 세로로 더 김 - height에 맞춤
                actualHeight = imgRect.height;
                actualWidth = imgRect.height * imgAspect;
                actualLeft = imgRect.left + (imgRect.width - actualWidth) / 2;
                actualTop = imgRect.top;
            }
            
            // 클릭 위치가 실제 이미지 영역 내에 있는지 확인
            if (clientX < actualLeft || clientX > actualLeft + actualWidth ||
                clientY < actualTop || clientY > actualTop + actualHeight) {
                return; // 투명 영역 클릭 시 드래그 시작하지 않음
            }
            
            isDragging = true;
            img.style.cursor = 'grabbing';
            
            // 마우스 클릭 위치와 실제 이미지 영역의 왼쪽 상단 모서리의 오프셋 계산
            offsetX = clientX - actualLeft;
            offsetY = clientY - actualTop;
        }
        
        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            e.stopPropagation();
            
            const sectionRect = section.getBoundingClientRect();
            const imgRect = img.getBoundingClientRect();
            
            let currentX, currentY;
            if (e.type === 'touchmove') {
                currentX = e.touches[0].clientX;
                currentY = e.touches[0].clientY;
            } else {
                currentX = e.clientX;
                currentY = e.clientY;
            }
            
            // 이미지의 실제 렌더링 크기 계산 (object-fit: contain 고려)
            const imgAspect = img.naturalWidth / img.naturalHeight;
            const containerAspect = imgRect.width / imgRect.height;
            
            let actualWidth, actualHeight;
            if (imgAspect > containerAspect) {
                // 이미지가 가로로 더 넓음
                actualWidth = imgRect.width;
                actualHeight = imgRect.width / imgAspect;
            } else {
                // 이미지가 세로로 더 김
                actualHeight = imgRect.height;
                actualWidth = imgRect.height * imgAspect;
            }
            
            // 섹션 기준으로 새로운 위치 계산 (오프셋 고려)
            // 실제 이미지 영역의 왼쪽 상단을 기준으로 계산
            let newLeft = currentX - sectionRect.left - offsetX;
            let newTop = currentY - sectionRect.top - offsetY;
            
            // 섹션 경계 체크 완화: 이미지의 일부만 보여도 이동 가능하도록
            // 실제 이미지 크기의 80%만 보여도 이동 가능
            const minX = -actualWidth * 0.8;
            const minY = -actualHeight * 0.8;
            const maxX = sectionRect.width - actualWidth * 0.2;
            const maxY = sectionRect.height - actualHeight * 0.2;
            
            newLeft = Math.max(minX, Math.min(maxX, newLeft));
            newTop = Math.max(minY, Math.min(maxY, newTop));
            
            img.style.left = `${newLeft}px`;
            img.style.top = `${newTop}px`;
        }
        
        function dragEnd() {
            if (isDragging) {
                isDragging = false;
                img.style.cursor = 'move';
            }
        }
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', dragEnd);
    }
    
    // 섹션 내 모든 이미지 찾기 (캐릭터 이미지 제외)
    const allImages = section.querySelectorAll('img');
    allImages.forEach(img => {
        // 캐릭터 이미지가 아니면 드래그 가능하게
        if (img.id !== 'fashionCharacter' && !img.classList.contains('cell-character')) {
            makeImageDraggable(img);
        }
    });
    
    // 초기 이미지 설정
    updateCharacterImage();
    
    // AI 활용: 테마 변경 감지 (MutationObserver)
    const html = document.documentElement;
    const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                updateCharacterImage();
            }
        });
    });
    themeObserver.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    
    console.log('패션 세포 인터랙션 초기화 완료');
}

