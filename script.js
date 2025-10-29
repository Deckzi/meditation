// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('nav');

mobileMenuBtn.addEventListener('click', () => {
    nav.classList.toggle('active');
});

// Audio elements
const meditationSound = document.getElementById('meditation-sound');
const completionSound = document.getElementById('completion-sound');

// Modal elements
const musicModal = document.getElementById('music-modal');
const musicSelectBtn = document.getElementById('music-select-btn');
const closeModal = document.querySelector('.close-modal');
const musicList = document.getElementById('music-list');
const currentTrack = document.getElementById('current-track');

// Timer functionality
const timerDisplay = document.getElementById('timer-display');
const timerBtns = document.querySelectorAll('.timer-btn');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const volumeControl = document.getElementById('volume-control');
const volumeValue = document.getElementById('volume-value');

// Music upload elements
const musicUploadBtn = document.getElementById('music-upload-btn');
const fileInput = document.getElementById('file-input');

let countdown;
let timeLeft = 300; // 5 минут в секундах
let isRunning = false;
let currentMusicIndex = 0;

// Настройки воспроизведения
let repeatMode = 'list'; // 'list' - плейлист, 'one' - повтор одного трека
let isShuffle = false;

// Music playlist - начинаем с треками
let musicPlaylist = [
    {
        title: "Crystal",
        url: "audio/crystal.mp3",
        duration: "3:52",
        isUploaded: false
    },
    {
        title: "Waterfall", 
        url: "audio/nature.mp3",
        duration: "4:11",
        isUploaded: false
    },
    {
        title: "Ocean",
        url: "audio/ocean.mp3",
        duration: "5:48",
        isUploaded: false
    },
    {
        title: "Space",
        url: "audio/space.mp3",
        duration: "3:00",
        isUploaded: false
    },
    {
        title: "Nature",
        url: "audio/waterfall.mp3",
        duration: "2:38",
        isUploaded: false
    }
];


// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateDisplay();
    updateMusicList();
    updateCurrentTrackDisplay();
    createPlaybackControls(); // Создаем кнопки управления
    
    // Устанавливаем начальную громкость
    meditationSound.volume = 0.5;
    completionSound.volume = 0.7;
    volumeValue.textContent = `${Math.round(volumeControl.value * 100)}%`;
    
    // Выбираем первый трек по умолчанию
    if (musicPlaylist.length > 0) {
        selectTrack(0);
    }
});

// Создаем кнопки управления воспроизведением
function createPlaybackControls() {
    const playbackControls = document.createElement('div');
    playbackControls.className = 'playback-controls';
    playbackControls.innerHTML = `
        <div class="playback-buttons">
            <button class="playback-btn" id="repeat-btn" title="Режим повтора: Плейлист">
                <i class="fas fa-redo"></i>
            </button>
            <button class="playback-btn" id="prev-btn" title="Предыдущий трек">
                <i class="fas fa-step-backward"></i>
            </button>
            <button class="playback-btn" id="next-btn" title="Следующий трек">
                <i class="fas fa-step-forward"></i>
            </button>
            <button class="playback-btn" id="shuffle-btn" title="Перемешать">
                <i class="fas fa-random"></i>
            </button>
        </div>
        <div class="playback-info">
            <span id="repeat-status">Плейлист</span>
        </div>
    `;
    
    // Вставляем после кнопок управления таймером
    const timerActions = document.querySelector('.timer-actions');
    timerActions.parentNode.insertBefore(playbackControls, timerActions.nextSibling);
    
    // Добавляем обработчики
    document.getElementById('repeat-btn').addEventListener('click', toggleRepeatMode);
    document.getElementById('prev-btn').addEventListener('click', playPreviousTrack);
    document.getElementById('next-btn').addEventListener('click', playNextTrack);
    document.getElementById('shuffle-btn').addEventListener('click', toggleShuffle);
}

// Volume control
volumeControl.addEventListener('input', () => {
    const volume = volumeControl.value;
    meditationSound.volume = volume;
    completionSound.volume = volume;
    volumeValue.textContent = `${Math.round(volume * 100)}%`;
});

// Modal functions
musicSelectBtn.addEventListener('click', openMusicModal);
closeModal.addEventListener('click', closeMusicModal);

function openMusicModal() {
    musicModal.style.display = 'block';
}

function closeMusicModal() {
    musicModal.style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === musicModal) {
        closeMusicModal();
    }
});

// Функции управления воспроизведением
function toggleRepeatMode() {
    const repeatBtn = document.getElementById('repeat-btn');
    const repeatStatus = document.getElementById('repeat-status');
    
    if (repeatMode === 'list') {
        repeatMode = 'one';
        repeatBtn.style.color = 'var(--success)';
        repeatBtn.title = 'Режим повтора: Один трек';
        repeatStatus.textContent = 'Повтор трека';
        repeatStatus.style.color = 'var(--success)';
    } else {
        repeatMode = 'list';
        repeatBtn.style.color = '';
        repeatBtn.title = 'Режим повтора: Плейлист';
        repeatStatus.textContent = 'Плейлист';
        repeatStatus.style.color = '';
    }
}

function toggleShuffle() {
    const shuffleBtn = document.getElementById('shuffle-btn');
    isShuffle = !isShuffle;
    
    if (isShuffle) {
        shuffleBtn.style.color = 'var(--accent)';
        shuffleBtn.title = 'Перемешать: ВКЛ';
    } else {
        shuffleBtn.style.color = '';
        shuffleBtn.title = 'Перемешать: ВЫКЛ';
    }
}

function playNextTrack() {
    if (musicPlaylist.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
        // Случайный трек, но не тот же самый
        do {
            nextIndex = Math.floor(Math.random() * musicPlaylist.length);
        } while (nextIndex === currentMusicIndex && musicPlaylist.length > 1);
    } else {
        // Следующий по порядку
        nextIndex = (currentMusicIndex + 1) % musicPlaylist.length;
    }
    
    selectTrack(nextIndex);
    
    // Если таймер запущен, продолжаем воспроизведение
    if (isRunning) {
        meditationSound.play().catch(e => {
            console.log('Автовоспроизведение заблокировано');
        });
    }
}

function playPreviousTrack() {
    if (musicPlaylist.length === 0) return;
    
    let prevIndex;
    if (isShuffle) {
        // Случайный трек
        do {
            prevIndex = Math.floor(Math.random() * musicPlaylist.length);
        } while (prevIndex === currentMusicIndex && musicPlaylist.length > 1);
    } else {
        // Предыдущий по порядку
        prevIndex = (currentMusicIndex - 1 + musicPlaylist.length) % musicPlaylist.length;
    }
    
    selectTrack(prevIndex);
    
    // Если таймер запущен, продолжаем воспроизведение
    if (isRunning) {
        meditationSound.play().catch(e => {
            console.log('Автовоспроизведение заблокировано');
        });
    }
}

// Обработчик завершения трека
meditationSound.addEventListener('ended', handleTrackEnd);

function handleTrackEnd() {
    if (repeatMode === 'one') {
        // Повтор текущего трека
        meditationSound.currentTime = 0;
        meditationSound.play().catch(e => console.log('Не удалось повторить трек'));
    } else {
        // Следующий трек в плейлисте
        playNextTrack();
    }
}

// Загрузка пользовательской музыки
musicUploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', handleMusicUpload);

function handleMusicUpload(event) {
    const files = event.target.files;
    
    if (files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Проверяем, что это аудиофайл
        if (!file.type.startsWith('audio/')) {
            alert('Пожалуйста, загружайте только аудиофайлы');
            continue;
        }
        
        // Создаем URL для файла
        const fileURL = URL.createObjectURL(file);
        
        // Создаем аудио элемент для получения длительности
        const audio = new Audio();
        audio.src = fileURL;
        
        audio.addEventListener('loadedmetadata', () => {
            const duration = formatDuration(audio.duration);
            
            // Добавляем трек в плейлист
            const newTrack = {
                title: file.name.replace(/\.[^/.]+$/, ""), // Убираем расширение
                url: fileURL,
                duration: duration,
                isUploaded: true,
                file: file
            };
            
            musicPlaylist.push(newTrack);
            
            // Обновляем список музыки
            updateMusicList();
            updateCurrentTrackDisplay();
        });
        
        audio.addEventListener('error', () => {
            alert(`Не удалось загрузить файл: ${file.name}`);
        });
    }
    
    // Сбрасываем input
    fileInput.value = '';
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateMusicList() {
    musicList.innerHTML = '';
    
    if (musicPlaylist.length === 0) {
        musicList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #6c757d;">
                <i class="fas fa-music" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <p>Плейлист пуст</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Загрузите свою музыку используя кнопку "Загрузить музыку"</p>
            </div>
        `;
        return;
    }
    
    musicPlaylist.forEach((track, index) => {
        const trackElement = document.createElement('div');
        trackElement.className = 'music-track';
        if (index === currentMusicIndex) {
            trackElement.classList.add('active');
        }
        
        trackElement.innerHTML = `
            <i class="fas fa-music"></i>
            <div class="track-info">
                <div class="track-title">${track.title}</div>
                <div class="track-duration">${track.duration}</div>
            </div>
            ${track.isUploaded ? 
                '<button class="remove-track" data-index="' + index + '"><i class="fas fa-times"></i></button>' : 
                '<i class="fas fa-play"></i>'
            }
        `;
        
        trackElement.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-track')) {
                selectTrack(index);
            }
        });
        
        // Добавляем обработчик для удаления трека
        const removeBtn = trackElement.querySelector('.remove-track');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeTrack(index);
            });
        }
        
        musicList.appendChild(trackElement);
    });
}

function selectTrack(index) {
    if (index < 0 || index >= musicPlaylist.length) return;
    
    currentMusicIndex = index;
    
    // Update active track in modal
    document.querySelectorAll('.music-track').forEach((track, i) => {
        if (i === index) {
            track.classList.add('active');
        } else {
            track.classList.remove('active');
        }
    });
    
    // Set the audio source
    meditationSound.src = musicPlaylist[index].url;
    
    // Если таймер запущен, начинаем воспроизведение
    if (isRunning) {
        meditationSound.play().catch(e => {
            console.log('Автовоспроизведение заблокировано');
        });
    }
    
    updateCurrentTrackDisplay();
    closeMusicModal();
}

function removeTrack(index) {
    if (index < 0 || index >= musicPlaylist.length) return;
    
    // Освобождаем URL если это загруженный файл
    if (musicPlaylist[index].isUploaded) {
        URL.revokeObjectURL(musicPlaylist[index].url);
    }
    
    // Останавливаем музыку если удаляем текущий трек
    if (index === currentMusicIndex) {
        meditationSound.pause();
        meditationSound.src = '';
    }
    
    // Удаляем трек из плейлиста
    musicPlaylist.splice(index, 1);
    
    // Обновляем текущий индекс
    if (currentMusicIndex === index) {
        // Если удалили текущий трек, выбираем предыдущий или следующий
        if (musicPlaylist.length > 0) {
            currentMusicIndex = Math.min(index, musicPlaylist.length - 1);
            if (currentMusicIndex >= 0) {
                selectTrack(currentMusicIndex);
            }
        } else {
            currentMusicIndex = -1;
        }
    } else if (currentMusicIndex > index) {
        currentMusicIndex--;
    }
    
    updateMusicList();
    updateCurrentTrackDisplay();
}

// Update current track display
function updateCurrentTrackDisplay() {
    if (currentMusicIndex >= 0 && musicPlaylist[currentMusicIndex]) {
        const track = musicPlaylist[currentMusicIndex];
        currentTrack.innerHTML = `
            <i class="fas fa-play"></i>
            <span>Сейчас играет: ${track.title}</span>
        `;
        currentTrack.style.display = 'flex';
    } else {
        currentTrack.innerHTML = `
            <i class="fas fa-music"></i>
            <span>Трек не выбран</span>
        `;
        currentTrack.style.display = 'flex';
    }
}

// Timer functions
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (isRunning) return;
    
    // Проверяем, выбран ли трек
    if (currentMusicIndex < 0 || !musicPlaylist[currentMusicIndex]) {
        alert('Пожалуйста, сначала выберите или загрузите музыку для медитации');
        openMusicModal();
        return;
    }
    
    isRunning = true;
    startBtn.textContent = 'Пауза';
    startBtn.style.backgroundColor = '#dc3545';
    
    // Set and start meditation music
    meditationSound.play().catch(e => {
        console.log('Автовоспроизведение заблокировано. Нажмите "Начать" еще раз.');
        // Если autoplay is blocked, show a message to user
        alert('Пожалуйста, разрешите автовоспроизведение звука для этого сайта в настройках браузера.');
        isRunning = false;
        startBtn.textContent = 'Начать';
        startBtn.style.backgroundColor = '';
        return;
    });
    
    countdown = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            isRunning = false;
            startBtn.textContent = 'Начать';
            startBtn.style.backgroundColor = '';
            
            // Stop meditation music and play completion sound
            meditationSound.pause();
            meditationSound.currentTime = 0;
            completionSound.play();
            
            alert('Время медитации завершено! Надеемся, вы чувствуете себя отдохнувшим и спокойным.');
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(countdown);
    isRunning = false;
    startBtn.textContent = 'Продолжить';
    startBtn.style.backgroundColor = '';
    
    // Pause meditation music
    meditationSound.pause();
}

function resetTimer() {
    clearInterval(countdown);
    isRunning = false;
    startBtn.textContent = 'Начать';
    startBtn.style.backgroundColor = '';
    
    // Stop meditation music
    meditationSound.pause();
    meditationSound.currentTime = 0;
    
    // Reset to the active timer button's time
    const activeTimerBtn = document.querySelector('.timer-btn.active');
    if (activeTimerBtn) {
        timeLeft = parseInt(activeTimerBtn.dataset.time);
    } else {
        timeLeft = 300; // 5 minutes default
    }
    updateDisplay();
}

// Timer buttons event listeners
timerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        timerBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        timeLeft = parseInt(btn.dataset.time);
        updateDisplay();
        
        // If timer is running, restart with new time
        if (isRunning) {
            clearInterval(countdown);
            meditationSound.currentTime = 0;
            startTimer();
        }
    });
});

// Start/Pause button
startBtn.addEventListener('click', () => {
    if (!isRunning) {
        startTimer();
    } else {
        pauseTimer();
    }
});

// Reset button
resetBtn.addEventListener('click', resetTimer);

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
            }
        }
    });
});

// Auto-pause music when page is not visible
document.addEventListener('visibilitychange', function() {
    if (document.hidden && isRunning) {
        meditationSound.pause();
    } else if (!document.hidden && isRunning) {
        meditationSound.play().catch(e => console.log('Не удалось возобновить музыку'));
    }
});

// Предотвращаем закрытие страницы во время медитации
window.addEventListener('beforeunload', function(e) {
    if (isRunning) {
        e.preventDefault();
        e.returnValue = 'Идет медитация. Вы уверены, что хотите покинуть страницу?';
    }
});