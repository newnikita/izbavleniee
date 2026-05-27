// ==========================================
// СЕРДЦЕ ИГРЫ (js/core/main.js)
// Инициализация, загрузка и базовые механики (Опыт)
// ==========================================

function getXpForNextLevel() { 
    return Math.floor(100 * Math.pow(1.08, playerLevel - 1)); 
}

function gainXp(amount) {
    playerXp += amount;
    let leveledUp = false;
    
    while (playerXp >= getXpForNextLevel()) {
        playerXp -= getXpForNextLevel();
        playerLevel++;
        playerDiamonds += 10; 
        leveledUp = true;
    }
    
    if (typeof applyClassStats === 'function') applyClassStats(); 
    if (typeof updateStatsUI === 'function') updateStatsUI();   
    
    if (leveledUp) {
        showLootAlert(`🎉 <b>НОВЫЙ УРОВЕНЬ!</b><br>Теперь вы <b style="color:#ffd700;">${playerLevel} уровня</b>!<br><small>Базовое здоровье увеличено.</small>`, () => {
            // === ИНТЕГРАЦИЯ: ПРОВЕРКА 7 УРОВНЯ ДЛЯ ДОРОГ ===
            if (playerLevel >= 7 && typeof roadsIntroDone !== 'undefined' && !roadsIntroDone) {
                setTimeout(() => {
                    if (typeof startRoadsIntroDialogue === 'function') startRoadsIntroDialogue();
                }, 500);
            }
            // === ИНТЕГРАЦИЯ: ПРОВЕРКА 8 УРОВНЯ ДЛЯ АРЕНЫ ===
            else if (playerLevel >= 8 && typeof arenaGhostIntroDone !== 'undefined' && !arenaGhostIntroDone) {
                setTimeout(() => {
                    if (typeof startArenaIntroDialogue === 'function') startArenaIntroDialogue();
                }, 500);
            }
        });
    }
}

window.onload = async () => {
    if (typeof storyData !== 'undefined') {
        storyData.forEach(slide => { 
            const img = new Image(); 
            img.src = slide.img; 
        });
    }

    if (typeof YaGames !== 'undefined') {
        try {
            window.ysdk = await YaGames.init();
            window.ysdkPlayer = await window.ysdk.getPlayer();
            console.log("[Яндекс] SDK и объект Player успешно инициализированы.");
        } catch (err) {
            console.warn("[Яндекс] Ошибка инициализации SDK:", err);
        }
    }

    let saved = await loadGame();

    if (!saved) {
        let menuC = document.getElementById('menu-container');
        if (menuC) {
            menuC.style.display = 'flex';
            setTimeout(() => { menuC.style.opacity = '1'; }, 50);
        }
        if (typeof updateResourceUI === 'function') updateResourceUI(); 
        if (typeof updateStatsUI === 'function') updateStatsUI();
        if (typeof updateMainCards === 'function') updateMainCards(); 
    }
    
    // Запускаем фоновый таймер для регенерации Бесплотных цветков (раз в 60 сек проверка)
    setInterval(() => {
        if (typeof etherealFlowers !== 'undefined' && etherealFlowers < 5) {
            let now = Date.now();
            let hoursPassed = Math.floor((now - lastFlowerRegenTime) / (1000 * 60 * 60 * 3));
            if (hoursPassed > 0) {
                etherealFlowers = Math.min(5, etherealFlowers + hoursPassed);
                lastFlowerRegenTime += hoursPassed * (1000 * 60 * 60 * 3);
                if (etherealFlowers >= 5) lastFlowerRegenTime = Date.now();
                if (typeof updateArenaUI === 'function') updateArenaUI(); // Обновляем экран арены, если он открыт
                saveGame();
            }
        }
    }, 60000);
};