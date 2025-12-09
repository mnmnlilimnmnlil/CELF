/**
 * CELF - Fashion Cell Interaction
 * Section 09: 패션 세포 인터랙션
 */

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
            isDragging = true;
            img.style.cursor = 'grabbing';
            
            const imgRect = img.getBoundingClientRect();
            
            let clientX, clientY;
            if (e.type === 'touchstart') {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            
            // 마우스 클릭 위치와 이미지 왼쪽 상단 모서리의 오프셋 계산
            offsetX = clientX - imgRect.left;
            offsetY = clientY - imgRect.top;
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
            
            // 섹션 기준으로 새로운 위치 계산 (오프셋 고려)
            let newLeft = currentX - sectionRect.left - offsetX;
            let newTop = currentY - sectionRect.top - offsetY;
            
            // 섹션 경계 내로 제한
            const minX = 0;
            const minY = 0;
            const maxX = sectionRect.width - imgRect.width;
            const maxY = sectionRect.height - imgRect.height;
            
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
    
    console.log('패션 세포 인터랙션 초기화 완료');
}

