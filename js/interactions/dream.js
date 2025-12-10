/**
 * CELF - Dream Cell Interaction
 * Section 08: 상상 세포 인터랙션
 * Canvas 기반 그림 그리기 및 배경 변경 기능
 * (AI 활용: Canvas API, FileReader API, Undo/Redo 시스템, 이미지 처리)
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
    const character = document.getElementById('dreamCharacter');
    if (!character) return;
    
    const theme = getThemeMode();
    // 화이트 모드: dream03, 블랙 모드: dream04
    const imageName = theme === 'dark' ? 'dream04' : 'dream03';
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

export function initDream() {
    const section = document.getElementById('section08');
    if (!section) return;
    
    // 섹션을 relative로 설정
    section.style.position = 'relative';
    section.style.overflow = 'hidden';

    const CONFIG = {
        BRUSH_SIZES: [5, 10, 20, 30, 50],
        DEFAULT_BRUSH_SIZE: 20,
        COLORS: [
            '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
            '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
            '#FFC0CB', '#A52A2A', '#808080', '#008000', '#000080'
        ],
        DEFAULT_COLOR: '#000000'
    };

    // Canvas 및 컨트롤 UI 생성
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.cursor = 'crosshair';
    canvas.style.zIndex = '2'; // interaction-container 아래에 배치하되, pointer-events로 클릭 전달
    canvas.style.pointerEvents = 'auto';
    
    // 배경 레이어 (Canvas 배경용, 실제로는 사용하지 않음)
    const bgLayer = document.createElement('div');
    bgLayer.className = 'dream-bg-layer';
    bgLayer.style.position = 'absolute';
    bgLayer.style.top = '0';
    bgLayer.style.left = '0';
    bgLayer.style.width = '100%';
    bgLayer.style.height = '100%';
    bgLayer.style.zIndex = '0';
    bgLayer.style.pointerEvents = 'none';
    bgLayer.style.opacity = '0'; // 투명하게 설정 (Canvas에 직접 그림)
    
    // 컨트롤 패널 컨테이너
    const controlsWrapper = document.createElement('div');
    controlsWrapper.style.position = 'absolute';
    controlsWrapper.style.top = '0.5rem';
    controlsWrapper.style.right = '1.5rem';
    controlsWrapper.style.zIndex = '10';
    controlsWrapper.style.display = 'flex';
    controlsWrapper.style.flexDirection = 'column';
    controlsWrapper.style.alignItems = 'flex-end';
    controlsWrapper.style.gap = '0.5rem';
    
    // 토글 버튼
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '▼';
    toggleBtn.style.width = '40px';
    toggleBtn.style.height = '40px';
    toggleBtn.style.borderRadius = '6px';
    toggleBtn.style.border = '1px solid var(--border-color)';
    toggleBtn.style.background = 'rgba(255, 255, 255, 0.95)';
    toggleBtn.style.color = 'var(--text-primary)';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.fontSize = '0.9rem';
    toggleBtn.style.display = 'flex';
    toggleBtn.style.alignItems = 'center';
    toggleBtn.style.justifyContent = 'center';
    toggleBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
    toggleBtn.style.transition = 'transform 0.2s';
    toggleBtn.style.fontWeight = 'bold';
    
    toggleBtn.addEventListener('mouseenter', () => {
        toggleBtn.style.transform = 'scale(1.05)';
    });
    toggleBtn.addEventListener('mouseleave', () => {
        toggleBtn.style.transform = 'scale(1)';
    });
    
    // 컨트롤 패널
    const controls = document.createElement('div');
    controls.className = 'dream-controls';
    controls.style.display = 'flex';
    controls.style.flexDirection = 'column';
    controls.style.gap = '0.6rem';
    controls.style.padding = '0.9rem';
    controls.style.background = 'rgba(255, 255, 255, 0.95)';
    controls.style.borderRadius = '8px';
    controls.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
    controls.style.maxWidth = '220px';
    controls.style.transition = 'opacity 0.2s, transform 0.2s, max-height 0.2s';
    controls.style.opacity = '1';
    controls.style.transform = 'translateX(0)';
    
    let isControlsVisible = true;
    
    toggleBtn.addEventListener('click', () => {
        isControlsVisible = !isControlsVisible;
        if (isControlsVisible) {
            controls.style.opacity = '1';
            controls.style.transform = 'translateX(0)';
            controls.style.pointerEvents = 'auto';
            controls.style.maxHeight = '1000px';
            toggleBtn.innerHTML = '▼';
            toggleBtn.style.transform = 'rotate(0deg)';
        } else {
            controls.style.opacity = '0';
            controls.style.transform = 'translateX(10px)';
            controls.style.pointerEvents = 'none';
            controls.style.maxHeight = '0';
            toggleBtn.innerHTML = '▲';
            toggleBtn.style.transform = 'rotate(0deg)';
        }
    });

    // 상태 관리
    let isDrawing = false;
    let currentBrushSize = CONFIG.DEFAULT_BRUSH_SIZE;
    let currentColor = CONFIG.DEFAULT_COLOR;
    let lastX = 0;
    let lastY = 0;
    let backgroundImage = null;
    let history = []; // Undo 히스토리
    const MAX_HISTORY = 50; // 최대 히스토리 개수

    // Canvas 크기 설정
    function resizeCanvas() {
        const rect = section.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        // 기존 그림 다시 그리기
        redrawCanvas();
    }

    // Canvas 다시 그리기 (배경 이미지 포함)
    function redrawCanvas() {
        // Canvas 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 배경 이미지 그리기
        if (backgroundImage) {
            // 이미지 비율 유지하며 전체 캔버스 채우기
            const imgAspect = backgroundImage.width / backgroundImage.height;
            const canvasAspect = canvas.width / canvas.height;
            
            let drawWidth, drawHeight, drawX, drawY;
            
            if (imgAspect > canvasAspect) {
                // 이미지가 더 넓음 - 높이에 맞춤
                drawHeight = canvas.height;
                drawWidth = drawHeight * imgAspect;
                drawX = (canvas.width - drawWidth) / 2;
                drawY = 0;
            } else {
                // 이미지가 더 높음 - 너비에 맞춤
                drawWidth = canvas.width;
                drawHeight = drawWidth / imgAspect;
                drawX = 0;
                drawY = (canvas.height - drawHeight) / 2;
            }
            
            ctx.drawImage(backgroundImage, drawX, drawY, drawWidth, drawHeight);
        }
    }
    
    // 히스토리에 현재 상태 저장
    function saveHistory() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        history.push(imageData);
        
        // 최대 개수 초과 시 오래된 것 제거
        if (history.length > MAX_HISTORY) {
            history.shift();
        }
    }
    
    // Undo 실행
    function undo() {
        if (history.length === 0) return;
        
        // 마지막 상태 제거
        history.pop();
        
        // 이전 상태 복원
        if (history.length > 0) {
            ctx.putImageData(history[history.length - 1], 0, 0);
        } else {
            // 히스토리가 없으면 배경만 다시 그리기
            redrawCanvas();
        }
    }

    // 브러시 크기 선택 UI
    const brushSizeGroup = document.createElement('div');
    brushSizeGroup.style.display = 'flex';
    brushSizeGroup.style.gap = '0.4rem';
    brushSizeGroup.style.alignItems = 'center';
    
    const brushLabel = document.createElement('label');
    brushLabel.textContent = '브러시:';
    brushLabel.style.fontSize = '0.85rem';
    brushLabel.style.fontWeight = '600';
    brushLabel.style.color = 'var(--text-primary)';
    brushLabel.style.flexShrink = '0';
    
    const brushSelect = document.createElement('select');
    brushSelect.style.padding = '0.4rem 0.6rem';
    brushSelect.style.borderRadius = '4px';
    brushSelect.style.border = '1px solid var(--border-color)';
    brushSelect.style.background = 'var(--bg-primary)';
    brushSelect.style.color = 'var(--text-primary)';
    brushSelect.style.cursor = 'pointer';
    brushSelect.style.fontSize = '0.85rem';
    brushSelect.style.flex = '1';
    
    CONFIG.BRUSH_SIZES.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = `${size}px`;
        if (size === CONFIG.DEFAULT_BRUSH_SIZE) option.selected = true;
        brushSelect.appendChild(option);
    });
    
    brushSelect.addEventListener('change', (e) => {
        currentBrushSize = parseInt(e.target.value);
    });
    
    brushSizeGroup.appendChild(brushLabel);
    brushSizeGroup.appendChild(brushSelect);

    // 색상 선택 UI
    const colorGroup = document.createElement('div');
    colorGroup.style.display = 'flex';
    colorGroup.style.flexDirection = 'column';
    colorGroup.style.gap = '0.4rem';
    
    const colorLabel = document.createElement('label');
    colorLabel.textContent = '색상:';
    colorLabel.style.fontSize = '0.85rem';
    colorLabel.style.fontWeight = '600';
    colorLabel.style.color = 'var(--text-primary)';
    
    const colorGrid = document.createElement('div');
    colorGrid.style.display = 'grid';
    colorGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
    colorGrid.style.gap = '0.35rem';
    
    CONFIG.COLORS.forEach(color => {
        const colorBtn = document.createElement('button');
        colorBtn.style.width = '26px';
        colorBtn.style.height = '26px';
        colorBtn.style.borderRadius = '4px';
        colorBtn.style.border = color === currentColor ? '2px solid var(--text-primary)' : '1px solid var(--border-color)';
        colorBtn.style.background = color;
        colorBtn.style.cursor = 'pointer';
        colorBtn.style.transition = 'transform 0.15s';
        
        colorBtn.addEventListener('mouseenter', () => {
            colorBtn.style.transform = 'scale(1.1)';
        });
        colorBtn.addEventListener('mouseleave', () => {
            colorBtn.style.transform = 'scale(1)';
        });
        
        colorBtn.addEventListener('click', () => {
            currentColor = color;
            // 모든 버튼의 border 업데이트
            colorGrid.querySelectorAll('button').forEach(btn => {
                btn.style.border = btn === colorBtn ? '2px solid var(--text-primary)' : '1px solid var(--border-color)';
            });
        });
        
        colorGrid.appendChild(colorBtn);
    });
    
    // 커스텀 색상 입력
    const customColorInput = document.createElement('input');
    customColorInput.type = 'color';
    customColorInput.value = CONFIG.DEFAULT_COLOR;
    customColorInput.style.width = '100%';
    customColorInput.style.height = '32px';
    customColorInput.style.borderRadius = '4px';
    customColorInput.style.border = '1px solid var(--border-color)';
    customColorInput.style.cursor = 'pointer';
    
    customColorInput.addEventListener('change', (e) => {
        currentColor = e.target.value;
        // 그리드 버튼 border 초기화
        colorGrid.querySelectorAll('button').forEach(btn => {
            btn.style.border = '1px solid var(--border-color)';
        });
    });
    
    colorGroup.appendChild(colorLabel);
    colorGroup.appendChild(colorGrid);
    colorGroup.appendChild(customColorInput);

    // 배경 변경 UI
    const bgGroup = document.createElement('div');
    bgGroup.style.display = 'flex';
    bgGroup.style.flexDirection = 'column';
    bgGroup.style.gap = '0.4rem';
    
    const bgLabel = document.createElement('label');
    bgLabel.textContent = '배경:';
    bgLabel.style.fontSize = '0.85rem';
    bgLabel.style.fontWeight = '600';
    bgLabel.style.color = 'var(--text-primary)';
    
    const bgInput = document.createElement('input');
    bgInput.type = 'file';
    bgInput.accept = 'image/*';
    bgInput.style.padding = '0.4rem 0.6rem';
    bgInput.style.borderRadius = '4px';
    bgInput.style.border = '1px solid var(--border-color)';
    bgInput.style.background = 'var(--bg-primary)';
    bgInput.style.color = 'var(--text-primary)';
    bgInput.style.cursor = 'pointer';
    bgInput.style.fontSize = '0.8rem';
    
    bgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    backgroundImage = img;
                    // Canvas에 배경 이미지 그리기
                    redrawCanvas();
                    // bgLayer는 시각적 참고용으로만 사용 (선택사항)
                    bgLayer.style.backgroundImage = `url(${event.target.result})`;
                    // 히스토리 초기화 후 현재 상태 저장
                    history = [];
                    saveHistory();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    bgGroup.appendChild(bgLabel);
    bgGroup.appendChild(bgInput);

    // 지우기/초기화 버튼
    const actionGroup = document.createElement('div');
    actionGroup.style.display = 'flex';
    actionGroup.style.gap = '0.4rem';
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '초기화';
    resetBtn.style.flex = '1';
    resetBtn.style.padding = '0.5rem 0.6rem';
    resetBtn.style.borderRadius = '4px';
    resetBtn.style.border = '1px solid var(--border-color)';
    resetBtn.style.background = 'var(--bg-primary)';
    resetBtn.style.color = 'var(--text-primary)';
    resetBtn.style.cursor = 'pointer';
    resetBtn.style.fontSize = '0.8rem';
    resetBtn.style.fontWeight = '600';
    
    resetBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        backgroundImage = null;
        bgLayer.style.backgroundImage = 'none';
        bgInput.value = '';
        // 히스토리 초기화 후 현재 상태 저장
        history = [];
        saveHistory();
    });
    
    // Undo 버튼
    const undoBtn = document.createElement('button');
    undoBtn.textContent = '되돌리기 (Ctrl+Z)';
    undoBtn.style.flex = '1';
    undoBtn.style.padding = '0.5rem 0.6rem';
    undoBtn.style.borderRadius = '4px';
    undoBtn.style.border = '1px solid var(--border-color)';
    undoBtn.style.background = 'var(--bg-primary)';
    undoBtn.style.color = 'var(--text-primary)';
    undoBtn.style.cursor = 'pointer';
    undoBtn.style.fontSize = '0.8rem';
    undoBtn.style.fontWeight = '600';
    
    undoBtn.addEventListener('click', () => {
        undo();
    });
    
    actionGroup.appendChild(undoBtn);
    actionGroup.appendChild(resetBtn);

    // 컨트롤 패널 조립
    controls.appendChild(brushSizeGroup);
    controls.appendChild(colorGroup);
    controls.appendChild(bgGroup);
    controls.appendChild(actionGroup);
    
    // 컨트롤 래퍼에 토글 버튼과 패널 추가
    controlsWrapper.appendChild(toggleBtn);
    controlsWrapper.appendChild(controls);

    // AI 활용: Canvas 그리기 함수들 (Canvas API, 마우스/터치 이벤트 처리)
    function startDrawing(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        
        // 그리기 시작 전 상태 저장
        saveHistory();
    }

    // AI 활용: Canvas API를 이용한 선 그리기 (beginPath, moveTo, lineTo, stroke)
    function draw(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentBrushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        lastX = currentX;
        lastY = currentY;
    }

    function stopDrawing() {
        if (isDrawing) {
            // 그리기 종료 후 상태 저장 (다음 Undo를 위해)
            saveHistory();
        }
        isDrawing = false;
    }

    // AI 활용: 터치 이벤트 지원 (터치 좌표 계산)
    function getTouchPos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    }

    // AI 활용: 터치 시작 이벤트 처리
    function startDrawingTouch(e) {
        e.preventDefault();
        isDrawing = true;
        const pos = getTouchPos(e);
        lastX = pos.x;
        lastY = pos.y;
        
        // 그리기 시작 전 상태 저장
        saveHistory();
    }

    // AI 활용: 터치 이동 이벤트 처리 및 Canvas 그리기
    function drawTouch(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getTouchPos(e);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentBrushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        lastX = pos.x;
        lastY = pos.y;
    }

    function stopDrawingTouch() {
        if (isDrawing) {
            // 그리기 종료 후 상태 저장
            saveHistory();
        }
        isDrawing = false;
    }
    
    // 이벤트 리스너
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawingTouch);
    canvas.addEventListener('touchmove', drawTouch);
    canvas.addEventListener('touchend', stopDrawingTouch);
    canvas.addEventListener('touchcancel', stopDrawingTouch);

    // 초기화
    section.appendChild(bgLayer);
    section.appendChild(canvas);
    section.appendChild(controlsWrapper);
    
    // 기존 콘텐츠가 canvas 위에 보이도록 z-index 설정
    const interactionContainer = section.querySelector('.interaction-container');
    if (interactionContainer) {
        interactionContainer.style.position = 'relative';
        interactionContainer.style.zIndex = '3'; // 텍스트 표시용
        // Canvas에 그림을 그릴 수 있도록 pointer-events 조정
        // 텍스트는 보이지만 클릭은 Canvas로 전달되어 그림을 그릴 수 있음
        interactionContainer.style.pointerEvents = 'none';
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 초기 상태를 히스토리에 저장
    saveHistory();
    
    // 키보드 단축키 (Ctrl+Z 또는 Cmd+Z)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
    });
    
    // 다크모드 지원
    const updateTheme = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        controls.style.background = isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        toggleBtn.style.background = isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    };
    
    const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                updateTheme();
                updateCharacterImage();
            }
        });
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    updateTheme();
    
    // 초기 이미지 설정
    updateCharacterImage();
    
    console.log('상상 세포 인터랙션 초기화 완료');
}
