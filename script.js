// Основной класс приложения
class CyberSpace {
    constructor() {
        this.init();
        this.startTime = new Date();
        this.achievements = new Set();
        this.stats = {
            reaction: 0,
            memory: 0,
            mazes: 0,
            typing: 0,
            timeSpent: 0
        };
        this.loadStats();
    }

    init() {
        this.initParticles();
        this.initGames();
        this.initEventListeners();
        this.startTimeTracker();
        this.createCyberEffects();
    }

    // Система частиц
    initParticles() {
        const canvas = document.getElementById('particles');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 2;
                this.size = Math.random() * 3 + 1;
                this.alpha = Math.random() * 0.5 + 0.2;
                this.color = `hsl(${Math.random() * 120 + 120}, 100%, 50%)`;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                this.alpha -= 0.002;
                if (this.alpha <= 0) {
                    this.reset();
                }
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        const particles = Array.from({ length: 150 }, () => new Particle());

        function animate() {
            ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            requestAnimationFrame(animate);
        }

        animate();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // Инициализация игр
    initGames() {
        this.initReactionGame();
        this.initMemoryGame();
        this.initEventListeners();
    }

    // Тест реакции
    initReactionGame() {
        this.reactionGame = {
            active: false,
            startTime: 0,
            bestTime: parseInt(localStorage.getItem('bestReactionTime')) || 0
        };
        document.getElementById('best-time').textContent = this.reactionGame.bestTime;
    }

    startReactionTest() {
        const target = document.getElementById('reaction-target');
        const area = document.getElementById('reaction-area');
        const timeDisplay = document.getElementById('current-time');

        this.reactionGame.active = true;
        timeDisplay.textContent = '0';
        target.style.display = 'none';

        setTimeout(() => {
            if (!this.reactionGame.active) return;
            
            const x = Math.random() * (area.offsetWidth - 60);
            const y = Math.random() * (area.offsetHeight - 60);
            
            target.style.left = x + 'px';
            target.style.top = y + 'px';
            target.style.display = 'block';
            this.reactionGame.startTime = Date.now();

            target.onclick = () => {
                if (!this.reactionGame.active) return;
                
                const reactionTime = Date.now() - this.reactionGame.startTime;
                timeDisplay.textContent = reactionTime;
                this.reactionGame.active = false;
                target.style.display = 'none';

                if (reactionTime < this.reactionGame.bestTime || this.reactionGame.bestTime === 0) {
                    this.reactionGame.bestTime = reactionTime;
                    document.getElementById('best-time').textContent = reactionTime;
                    localStorage.setItem('bestReactionTime', reactionTime);
                    this.unlockAchievement('Скорость света!');
                }

                this.playSound('success');
            };
        }, Math.random() * 2000 + 1000);
    }

    // Игра на память
    initMemoryGame() {
        this.memoryGame = {
            cards: [],
            flippedCards: [],
            matchedPairs: 0,
            attempts: 0,
            bestScore: parseInt(localStorage.getItem('memoryBestScore')) || 0
        };
        document.getElementById('memory-score').textContent = this.memoryGame.bestScore;
    }

    startMemoryGame() {
        const symbols = ['🚀', '⭐', '🔮', '🎯', '💎', '🔑', '👁️', '⚡'];
        this.memoryGame.cards = [...symbols, ...symbols]
            .sort(() => Math.random() - 0.5);
        
        this.memoryGame.flippedCards = [];
        this.memoryGame.matchedPairs = 0;
        this.memoryGame.attempts = 0;

        this.renderMemoryGrid();
        this.updateMemoryStats();
    }

    renderMemoryGrid() {
        const grid = document.getElementById('memory-grid');
        grid.innerHTML = '';

        this.memoryGame.cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.innerHTML = '?';
            card.dataset.index = index;
            card.dataset.symbol = symbol;

            card.addEventListener('click', () => this.flipMemoryCard(card));
            grid.appendChild(card);
        });
    }

    flipMemoryCard(card) {
        if (this.memoryGame.flippedCards.length >= 2 || card.classList.contains('flipped')) {
            return;
        }

        card.classList.add('flipped');
        card.textContent = card.dataset.symbol;
        this.memoryGame.flippedCards.push(card);

        if (this.memoryGame.flippedCards.length === 2) {
            this.memoryGame.attempts++;
            this.checkMemoryMatch();
        }

        this.updateMemoryStats();
        this.playSound('click');
    }

    checkMemoryMatch() {
        const [card1, card2] = this.memoryGame.flippedCards;
        
        if (card1.dataset.symbol === card2.dataset.symbol) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.memoryGame.matchedPairs++;
            
            if (this.memoryGame.matchedPairs === 8) {
                this.onMemoryGameWin();
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                card1.textContent = '?';
                card2.textContent = '?';
            }, 1000);
        }

        setTimeout(() => {
            this.memoryGame.flippedCards = [];
        }, 1000);
    }

    onMemoryGameWin() {
        if (this.memoryGame.attempts < this.memoryGame.bestScore || this.memoryGame.bestScore === 0) {
            this.memoryGame.bestScore = this.memoryGame.attempts;
            document.getElementById('memory-score').textContent = this.memoryGame.attempts;
            localStorage.setItem('memoryBestScore', this.memoryGame.attempts);
            this.unlockAchievement('Феноменальная память!');
        }
        this.playSound('success');
    }

    updateMemoryStats() {
        document.getElementById('attempts').textContent = this.memoryGame.attempts;
        document.getElementById('pairs-found').textContent = this.memoryGame.matchedPairs;
    }

    // Система достижений
    unlockAchievement(name) {
        if (this.achievements.has(name)) return;
        
        this.achievements.add(name);
        this.showAchievementPopup(name);
        
        const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        achievements.push({ name, date: new Date().toISOString() });
        localStorage.setItem('achievements', JSON.stringify(achievements));
        
        this.updateAchievementsDisplay();
    }

    showAchievementPopup(name) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <h4>🎉 Достижение разблокировано!</h4>
            <p>${name}</p>
        `;
        
        document.body.appendChild(popup);
        
        setTimeout(() => popup.classList.add('show'), 100);
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 500);
        }, 3000);
    }

    updateAchievementsDisplay() {
        document.getElementById('achievements').textContent = 
            `${this.achievements.size}/10`;
        
        this.updateActivityLevel();
    }

    updateActivityLevel() {
        const level = document.getElementById('activity-level');
        const count = this.achievements.size;
        
        if (count >= 8) level.textContent = 'LEGEND';
        else if (count >= 5) level.textContent = 'PRO';
        else if (count >= 3) level.textContent = 'Опытный';
        else level.textContent = 'Новичок';
    }

    // Трекер времени
    startTimeTracker() {
        setInterval(() => {
            const now = new Date();
            const diff = Math.floor((now - this.startTime) / 1000);
            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;
            
            document.getElementById('time-spent').textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            this.stats.timeSpent = diff;
            this.saveStats();
        }, 1000);
    }

    // Система секретных кодов
    checkSecretCode() {
        const input = document.getElementById('secret-code');
        const code = input.value.trim().toLowerCase();
        
        const secrets = {
            'cyberpunk': () => this.activateCyberpunkMode(),
            'matrix': () => this.activateMatrixMode(),
            'neon': () => this.boostNeonEffects(),
            'godmode': () => this.unlockAllAchievements(),
            'reset': () => this.resetAllData()
        };

        if (secrets[code]) {
            secrets[code]();
            input.value = '';
            this.playSound('success');
        } else {
            input.style.borderColor = '#ff0000';
            setTimeout(() => input.style.borderColor = '#ff00ff', 1000);
        }
    }

    activateCyberpunkMode() {
        document.body.style.filter = 'hue-rotate(90deg)';
        setTimeout(() => document.body.style.filter = '', 5000);
        this.unlockAchievement('Киберпространство!');
    }

    activateMatrixMode() {
        document.querySelectorAll('.neon-text').forEach(text => {
            text.style.animation = 'none';
            setTimeout(() => text.style.animation = '', 100);
        });
        this.createMatrixRain();
        this.unlockAchievement('Избранный!');
    }

    boostNeonEffects() {
        document.body.classList.add('glitch');
        setTimeout(() => document.body.classList.remove('glitch'), 2000);
        this.unlockAchievement('Неоновый король!');
    }

    unlockAllAchievements() {
        const allAchievements = [
            'Скорость света!', 'Феноменальная память!', 'Киберпространство!',
            'Избранный!', 'Неоновый король!', 'Мастер лабиринтов!',
            'Гуру печати!', 'Ветеран сайта!', 'Искатель секретов!', 'LEGEND'
        ];
        
        allAchievements.forEach(achievement => this.unlockAchievement(achievement));
    }

    resetAllData() {
        localStorage.clear();
        location.reload();
    }

    // Спецэффекты
    createCyberEffects() {
        setInterval(() => {
            this.createCyberLine();
        }, 2000);

        setInterval(() => {
            this.createFloatingParticle();
        }, 1000);
    }

    createCyberLine() {
        const line = document.createElement('div');
        line.className = 'cyber-line';
        line.style.left = Math.random() * 100 + '%';
        line.style.width = Math.random() * 100 + 50 + 'px';
        document.body.appendChild(line);
        
        setTimeout(() => line.remove(), 3000);
    }

    createFloatingParticle() {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: #00ff00;
            border-radius: 50%;
            pointer-events: none;
            z-index: 999;
            left: ${Math.random() * 100}%;
            top: -10px;
            animation: floatDown 5s linear forwards;
            box-shadow: 0 0 10px #00ff00;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 5000);
    }

    createMatrixRain() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => this.createMatrixChar(), i * 100);
        }
    }

    createMatrixChar() {
        const char = document.createElement('div');
        char.textContent = String.fromCharCode(0x30A0 + Math.random() * 96);
        char.style.cssText = `
            position: fixed;
            color: #00ff00;
            font-size: ${Math.random() * 20 + 10}px;
            left: ${Math.random() * 100}%;
            top: -50px;
            animation: matrixRain 3s linear forwards;
            pointer-events: none;
            z-index: 1000;
            text-shadow: 0 0 10px #00ff00;
        `;
        
        document.body.appendChild(char);
        
        setTimeout(() => char.remove(), 3000);
    }

    // Управление звуком
    playSound(type) {
        const audio = document.getElementById(`${type}-sound`);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }

    // Сохранение статистики
    saveStats() {
        localStorage.setItem('cyberspaceStats', JSON.stringify(this.stats));
    }

    loadStats() {
        const saved = localStorage.getItem('cyberspaceStats');
        if (saved) {
            this.stats = { ...this.stats, ...JSON.parse(saved) };
        }

        const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        achievements.forEach(ach => this.achievements.add(ach.name));
        this.updateAchievementsDisplay();
    }

    // Обработчики событий
    initEventListeners() {
        // Открытие модальных окон игр
        document.getElementById('reaction-game').addEventListener('click', () => {
            document.getElementById('reaction-modal').style.display = 'block';
        });

        document.getElementById('memory-game').addEventListener('click', () => {
            document.getElementById('memory-modal').style.display = 'block';
            this.startMemoryGame();
        });

        // Закрытие модальных окон
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Закрытие по клику вне окна
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Enter для секретных кодов
        document.getElementById('secret-code').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkSecretCode();
            }
        });

        // Анимации при загрузке
        window.addEventListener('load', () => {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 1s ease';
            
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        });
    }
}

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes floatDown {
        to { top: 100vh; }
    }
    
    @keyframes matrixRain {
        to { 
            top: 100vh;
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Запуск приложения
const cyberSpace = new CyberSpace();

// Глобальные функции для кнопок
function startReactionTest() {
    cyberSpace.startReactionTest();
}

function startMemoryGame() {
    cyberSpace.startMemoryGame();
}

function checkSecretCode() {
    cyberSpace.checkSecretCode();
}
