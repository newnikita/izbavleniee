// ==========================================
// АРЕНА И ЛИДЕРБОРДЫ (js/ui/arena.js)
// Интерфейс PvP, Лиги и Валюта
// ==========================================

function getCurrentLeague() {
    if (typeof arenaLeagues === 'undefined') return { name: "Лига Ландыша", icon: "" };
    let currentLg = arenaLeagues[0];
    for (let i = 0; i < arenaLeagues.length; i++) {
        if (arenaPoints >= arenaLeagues[i].reqPoints) {
            currentLg = arenaLeagues[i];
        }
    }
    return currentLg;
}

function renderArenaTab() {
    let arenaTab = document.getElementById('tab-arena');
    if (!arenaTab) {
        arenaTab = document.createElement('div');
        arenaTab.id = 'tab-arena';
        arenaTab.className = 'tab-content';
        let scrollContent = document.querySelector('.scrollable-content');
        if (scrollContent) scrollContent.appendChild(arenaTab);
    }

    let league = getCurrentLeague();
    let safeFlowers = typeof etherealFlowers !== 'undefined' ? etherealFlowers : 0;
    
    // Рассчитываем время до следующего цветка
    let nextRegenText = "";
    if (safeFlowers < 5 && typeof lastFlowerRegenTime !== 'undefined') {
        let msPassed = Date.now() - lastFlowerRegenTime;
        let msTotal = 3 * 60 * 60 * 1000; // 3 часа
        let msLeft = msTotal - msPassed;
        if (msLeft > 0) {
            let h = Math.floor(msLeft / (1000 * 60 * 60));
            let m = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
            nextRegenText = `<span style="font-size:0.75rem; color:#aaa;">След. цветок: ${h}ч ${m}м</span>`;
        }
    } else if (safeFlowers >= 5) {
        nextRegenText = `<span style="font-size:0.75rem; color:#00ff00;">Максимум достигнут</span>`;
    }

    let flowerIcon = (typeof arenaIcons !== 'undefined' && arenaIcons['flower']) ? arenaIcons['flower'] : 'icons/ethereal_flower.png';
    let dailyIcon = (typeof arenaIcons !== 'undefined' && arenaIcons['lb_daily']) ? arenaIcons['lb_daily'] : 'icons/lb_daily.png';
    let monthlyIcon = (typeof arenaIcons !== 'undefined' && arenaIcons['lb_monthly']) ? arenaIcons['lb_monthly'] : 'icons/lb_monthly.png';

    let html = `
        <div class="shop-header" style="background: linear-gradient(180deg, #1c2a5e, #0a0e1c); border-bottom: 2px solid #4a6fa5;">Арена Призраков</div>
        <div class="back-btn" onclick="switchTab('main', document.getElementById('nav-btn-main'))">🔙 Вернуться на Главную</div>
        
        <div style="padding: 15px; text-align: center;">
            
            <div style="background: rgba(0,0,0,0.6); border: 1px solid #d4af37; border-radius: 8px; padding: 20px; margin-bottom: 15px; box-shadow: inset 0 0 20px rgba(212, 175, 55, 0.2);">
                <img src="${league.icon}" alt="${league.name}" style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 10px; filter: drop-shadow(0 0 10px rgba(212,175,55,0.5));" onerror="this.style.display='none'">
                <h2 style="color: #d4af37; margin: 0 0 5px 0;">${league.name}</h2>
                <div style="color: #e0f7fa; font-size: 1.1rem;">Рейтинг: <b>${arenaPoints}</b> очков</div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; background: #050814; border: 1px solid #00ffff; border-radius: 8px; padding: 10px; margin-bottom: 15px;">
                <div style="text-align: left;">
                    <div style="color: #00ffff; font-weight:bold; font-size:1.1rem;"><img src="${flowerIcon}" class="ui-icon" onerror="this.src=''"> ${safeFlowers} / 5</div>
                    ${nextRegenText}
                </div>
                <button class="btn-quest active" style="background: linear-gradient(180deg, #005566, #002b33); border-color: #0088aa; padding: 8px 15px; font-size: 0.9rem;" onclick="buyArenaFlowers()">
                    +3 <img src="${flowerIcon}" class="ui-icon" style="width:1em;height:1em;"> (5 <img src="icons/diamond.png" class="ui-icon" style="width:1em;height:1em;">)
                </button>
            </div>

            <div style="display:flex; gap:10px; margin-bottom: 20px;">
                <div style="flex:1; background: rgba(0,0,0,0.5); border: 1px dashed #5a6e9c; border-radius: 8px; padding: 10px; cursor:pointer;" onclick="showLeaderboard('daily')">
                    <img src="${dailyIcon}" style="width:40px; height:40px; margin-bottom:5px;" onerror="this.style.display='none'">
                    <div style="color:#00b3ff; font-size:0.85rem; font-weight:bold;">Топ Дня</div>
                </div>
                <div style="flex:1; background: rgba(0,0,0,0.5); border: 1px dashed #5a6e9c; border-radius: 8px; padding: 10px; cursor:pointer;" onclick="showLeaderboard('monthly')">
                    <img src="${monthlyIcon}" style="width:40px; height:40px; margin-bottom:5px;" onerror="this.style.display='none'">
                    <div style="color:#00b3ff; font-size:0.85rem; font-weight:bold;">Топ Месяца</div>
                </div>
            </div>

            <button class="start-btn" style="width: 100%; font-size: 1.2rem; padding: 15px;" onclick="searchArenaMatch()">
                ИСКАТЬ ПРОТИВНИКА<br>
                <span style="font-size: 0.9rem; color: #aaa;">(Стоимость: 1 <img src="${flowerIcon}" class="ui-icon" style="width:1em;height:1em;">)</span>
            </button>

        </div>
    `;
    
    arenaTab.innerHTML = html;
}

window.buyArenaFlowers = function() {
    if (playerDiamonds < 5) {
        if (typeof showLootAlert === 'function') showLootAlert("Недостаточно алмазов для покупки Бесплотных цветков!");
        return;
    }
    playerDiamonds -= 5;
    etherealFlowers += 3;
    if (typeof saveGame === 'function') saveGame();
    if (typeof updateResourceUI === 'function') updateResourceUI();
    renderArenaTab();
    if (typeof showLootAlert === 'function') showLootAlert(`🌺 <b>Цветки приобретены!</b><br>Получено 3 Бесплотных цветка. Вы можете сражаться дальше!`);
};

window.searchArenaMatch = function() {
    if (etherealFlowers < 1) {
        if (typeof showLootAlert === 'function') showLootAlert("Недостаточно Бесплотных цветков для поиска противника!");
        return;
    }
    etherealFlowers--;
    if (typeof saveGame === 'function') saveGame();
    if (typeof startBattle === 'function') startBattle('arena');
};

window.showLeaderboard = function(type) {
    if (window.ysdk) {
        // Подготовка к будущей интеграции Яндекса
        if (typeof showLootAlert === 'function') showLootAlert(`📊 <b>Доска Лидеров</b><br><br>Связь с Книгой Судеб Яндекса устанавливается... Эта функция будет доступна в следующем крупном обновлении.`);
    } else {
        if (typeof showLootAlert === 'function') showLootAlert("Магия Яндекса сейчас недоступна. Таблица лидеров скрыта в тумане.");
    }
};