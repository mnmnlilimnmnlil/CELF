/**
 * CELF - Main Application Entry Point
 * 전체 애플리케이션 초기화 및 모듈 통합
 */

import { initMainCanvas } from './mainCanvas.js';
import { initCardGrid } from './cardGrid.js';
import { initPrime } from './interactions/prime.js';
import { initHungry } from './interactions/hungry.js';
import { initCurious } from './interactions/curious.js';
import { initLove } from './interactions/love.js';
import { initSleepy } from './interactions/sleepy.js';
import { initAnxiety } from './interactions/anxiety.js';
import { initAttention } from './interactions/attention.js';
import { initDream } from './interactions/dream.js';
import { initFashion } from './interactions/fashion.js';

/**
 * 테마 토글 기능
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // 저장된 테마 불러오기
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

/**
 * 스크롤 기반 섹션 애니메이션
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // 섹션 타이틀 애니메이션
    document.querySelectorAll('.section-title').forEach(title => {
        observer.observe(title);
    });
    
    // 메인 섹션 parallax 효과
    const mainSection = document.getElementById('mainSection');
    const primeCell = document.getElementById('primeCell');
    const primeContainer = document.querySelector('.prime-cell-container');
    const section01 = document.getElementById('section01');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const maxScroll = window.innerHeight;
        const scrollRatio = Math.min(scrolled / maxScroll, 1);
        
        // section01의 시작 위치 확인
        let section01Start = window.innerHeight; // 기본값: 첫 섹션 높이
        if (section01) {
            const section01Rect = section01.getBoundingClientRect();
            section01Start = window.innerHeight + section01Rect.top;
        }
        
        // section01이 보이기 시작하면 main-section 숨기기
        if (scrolled >= section01Start - window.innerHeight * 0.5) {
            mainSection.style.opacity = '0';
            mainSection.style.pointerEvents = 'none';
        } else {
            mainSection.style.opacity = '1';
            mainSection.style.pointerEvents = 'auto';
            
            // 스케일: 1.1 → 0.8
            const scale = 1.1 - (scrollRatio * 0.3);
            const target = primeContainer || primeCell;
            if (target) {
                target.style.setProperty('--prime-scale', scale.toFixed(3));
            }
        }
        
        if (scrolled > 100) {
            mainSection.classList.add('scrolled');
        } else {
            mainSection.classList.remove('scrolled');
        }
    });
}

/**
 * 부드러운 스크롤 이동
 */
function smoothScrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

/**
 * 애플리케이션 초기화
 */
function init() {
    console.log('CELF 애플리케이션 초기화 중...');
    
    // 테마 토글 초기화
    initThemeToggle();
    
    // 메인 Canvas 초기화
    initMainCanvas();
    
    // 카드 그리드 초기화
    initCardGrid(smoothScrollToSection);
    
    // 스크롤 애니메이션 초기화
    initScrollAnimations();
    
    // 각 세포 인터랙션 초기화 (공감 세포는 메인에 있으므로 제외)
    initHungry();
    initCurious();
    initLove();
    initSleepy();
    initAnxiety();
    initAttention();
    initDream();
    initFashion();
    
    console.log('CELF 애플리케이션 초기화 완료!');
}

// DOM 로드 완료 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 전역으로 스크롤 함수 노출 (카드 클릭 시 사용)
window.smoothScrollToSection = smoothScrollToSection;

