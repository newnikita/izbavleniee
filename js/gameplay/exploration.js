// ==========================================
// ИССЛЕДОВАНИЕ (js/gameplay/exploration.js)
// Генерация активностей на Главном экране
// ==========================================

function getCurrentBeast() {
    if(typeof beasts === 'undefined' || !beasts || beasts.length === 0) return { id: 'unknown', name: "Зверь", icon: "", emoji: "🐺", hp: 100, dmg: 10 };
    let period = Math.floor(Date.now() / (1000 * 60 * 60 * 4)); 
    return beasts[period % beasts.length];
}

window.getRoadPeriod = function() {
    let d = new Date();
    let p = Math.floor(d.getHours() / 4);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${p}`;
};

function updateMainCards() {
    try {
        const container = document.getElementById('main-cards-section');
        if (!container) return;
        container.style.display = 'flex'; 
        let html = '';
        
        let bDefeated = typeof banditDefeated !== 'undefined' && banditDefeated;
        
        // --- ГЕНЕРАЦИЯ КАРТОЧЕК БОЯ И ДОМЕНА ---
        if (!bDefeated) {
            html += `<div class="action-card"><div class="card-icon" style="font-size: 2rem; display: flex; justify-content: center; align-items: center;"><img src="icons/mage.png" class="icon-no-frame" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><div style="display: none;">🥷</div></div><div class="card-info"><div class="card-title">Путь волшебника</div><div class="card-subtitle">Маг-бандит</div><div class="btn-action" onclick="startBattle('bandit')">Напасть</div></div><div class="arrow-right">➔</div></div><div class="action-card locked-card"><div class="locked-overlay"><div class="locked-badge">Заблокировано</div></div><div class="card-icon">⚖️</div><div class="card-info"><div class="card-title">Практика</div><div class="card-subtitle">Ангел-привратник</div></div></div>`;
        } else {
            let beast = getCurrentBeast();
            let cBossIdx = typeof currentEliteBossIndex !== 'undefined' ? currentEliteBossIndex : 0;
            let mlDone = typeof midlockIntroDone !== 'undefined' ? midlockIntroDone : false;
            let elActive = typeof elitePhaseActive !== 'undefined' ? elitePhaseActive : false;
            let tIntro = typeof townHallIntroDone !== 'undefined' ? townHallIntroDone : false;
            let mLock = typeof midlockLocked !== 'undefined' ? midlockLocked : false;
            let bHunt = typeof beastHuntingUnlocked !== 'undefined' ? beastHuntingUnlocked : false;
            
            let spiritDone = typeof midlockSpiritDefeated !== 'undefined' ? midlockSpiritDefeated : false;
            let girlDone = typeof girlEncounterDone !== 'undefined' ? girlEncounterDone : false;
            
            if (cBossIdx > 5) {
                if (!mlDone) {
                    html += `<div class="action-card"><div class="card-icon" style="font-size: 2rem;">🏛️</div><div class="card-info"><div class="card-title">Новые земли</div><div class="card-subtitle">Руины Мидлока</div><div class="btn-action" style="background: linear-gradient(180deg, #660000, #330000); border-color: #aa0000;" onclick="tryGoToMidlock()">Отправиться</div></div><div class="arrow-right">➔</div></div>`;
                } else if (!spiritDone) {
                    let spiritIcon = 'icons/spirit_weak.png';
                    html += `<div class="action-card"><div class="card-icon" style="font-size: 2rem; display: flex; justify-content: center; align-items: center;"><img src="${spiritIcon}" class="icon-no-frame" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><div style="display: none;">👻</div></div><div class="card-info"><div class="card-title">Руины Мидлока</div><div class="card-subtitle" style="color: #00ffff;">Тщедушный дух</div><div class="btn-action" style="background: linear-gradient(180deg, #005566, #002b33); border-color: #0088aa;" onclick="startBattle('spirit')">Изгнать</div></div><div class="arrow-right" style="color:#00ffff;">➔</div></div>`;
                } else if (!girlDone) {
                    html += `<div class="action-card"><div class="card-icon" style="font-size: 2rem; display: flex; justify-content: center; align-items: center;"><img src="icons/girl_knight.png" class="icon-no-frame" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><div style="display: none;">🤺</div></div><div class="card-info"><div class="card-title">Руины Мидлока</div><div class="card-subtitle" style="color: #ffcccc;">Незнакомка в доспехах</div><div class="btn-action" style="background: linear-gradient(180deg, #660000, #330000); border-color: #ff0000;" onclick="startBattle('girl')">Сразиться</div></div><div class="arrow-right" style="color:#ffcccc;">➔</div></div>`;
                } else {
                    html += `<div class="action-card locked-card"><div class="locked-overlay"><div class="locked-badge">Ожидание контента</div></div><div class="card-icon" style="font-size: 2rem;">⛺</div><div class="card-info"><div class="card-title">Привал</div><div class="card-subtitle">Беседа у костра</div></div><div class="arrow-right">➔</div></div>`;
                }
            } else {
                if (elActive && typeof eliteUndead !== 'undefined' && cBossIdx < eliteUndead.length) {
                    let boss = eliteUndead[cBossIdx];
                    html += `<div class="action-card" style="border-color: #8b0000; box-shadow: inset 0 0 20px rgba(139,0,0,0.5);"><div class="card-icon" style="font-size: 2rem; border-color:#ff4d4d; display: flex; justify-content: center; align-items: center;"><img src="${boss.icon}" class="icon-no-frame" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><div style="display: none;">${boss.emoji}</div></div><div class="card-info"><div class="card-title" style="color:#ff4d4d; font-weight:bold;">Павший Избавитель</div><div class="card-subtitle" style="color:#fff;">${boss.name}</div><div class="btn-action" style="background: linear-gradient(180deg, #660000, #330000); border-color:#ff0000;" onclick="startBattle('elite')">Сразиться</div></div><div class="arrow-right" style="color:#ff4d4d;">➔</div></div>`;
                } else if (!elActive) {
                    if (!tIntro) {
                        html += `<div class="action-card locked-card"><div class="locked-overlay"><div class="locked-badge">Посетите деревню</div></div><div class="card-icon" style="font-size: 2rem; display: flex; justify-content: center; align-items: center;"><img src="icons/enemy_undead.png" class="icon-no-frame" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><div style="display: none;">🧟</div></div><div class="card-info"><div class="card-title">Путь волшебника</div><div class="card-subtitle">Слабый мертвец</div><div class="card-title" style="color: #ff4d4d; margin-top:3px;">Поговорите со старостой</div></div><div class="arrow-right">➔</div></div>`;
                    } else {
                        html += `<div class="action-card"><div class="card-icon" style="font-size: 2rem; display: flex; justify-content: center; align-items: center;"><img src="icons/enemy_undead.png" class="icon-no-frame" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><div style="display: none;">🧟</div></div><div class="card-info"><div class="card-title">Путь волшебника</div><div class="card-subtitle">Слабый мертвец</div><div class="btn-action" onclick="startBattle('undead')">Напасть</div></div><div class="arrow-right">➔</div></div>`;
                    }
                }
                
                if (!tIntro) {
                    html += `<div class="action-card"><div class="card-icon" style="font-size: 2rem;">🏘️</div><div class="card-info"><div class="card-title">Пустошь</div><div class="card-subtitle">Разоренная деревня</div><div class="btn-action" onclick="goToVillage()">В путь</div></div><div class="arrow-right">➔</div></div>`;
                } else if (tIntro && !mLock) {
                    html += `<div class="action-card"><div class="card-icon" style="font-size: 2rem;">🏛️</div><div class="card-info"><div class="card-title">Новые земли</div><div class="card-subtitle">Руины Мидлока</div><div class="btn-action" style="background: linear-gradient(180deg, #660000, #330000); border-color: #aa0000;" onclick="tryGoToMidlock()">Исследовать</div></div><div class="arrow-right">➔</div></div>`;
                } else {
                    html += `<div class="action-card locked-card"><div class="locked-overlay"><div class="locked-badge">Нужна база</div></div><div class="card-icon" style="font-size: 2rem;">🏛️</div><div class="card-info"><div class="card-title">Новые земли</div><div class="card-subtitle">Руины Мидлока</div><div class="card-title" style="color: #ff4d4d; margin-top:3px;">Восстановите деревню</div></div><div class="arrow-right">➔</div></div>`;
                }
            }
            
            if (bHunt) {
                html += `<div class="action-card"><div class="card-icon" style="font-size: 2rem; display: flex; justify-content: center; align-items: center;"><img src="${beast.icon}" class="icon-no-frame" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><div style="display: none;">${beast.emoji}</div></div><div class="card-info"><div class="card-title">Охотничьи угодья</div><div class="card-subtitle">${beast.name}</div><div class="btn-action" onclick="startBattle('beast')">Охотиться</div></div><div class="arrow-right">➔</div></div>`;
            } else {
                html += `<div class="action-card locked-card"><div class="locked-overlay"><div class="locked-badge">Требуется обучение</div></div><div class="card-icon" style="font-size: 2rem;">🌲</div><div class="card-info"><div class="card-title">Охотничьи угодья</div><div class="card-subtitle">Неизвестно</div><div class="card-title" style="color: #ff4d4d; margin-top:3px;">Слишком опасно</div></div><div class="arrow-right">➔</div></div>`;
            }
        }
        container.innerHTML = html;

        // --- ДИНАМИЧЕСКАЯ ОТРИСОВКА СПИСКА МЕНЮ ---
        let menuListContainer = document.querySelector('#tab-main .menu-list');
        if (menuListContainer) {
            let isArenaUnlocked = typeof arenaUnlocked !== 'undefined' && arenaUnlocked;
            
            let arenaItemHtml = isArenaUnlocked 
                ? `<div class="list-item" onclick="openSubTab('tab-arena')"><div class="list-icon"><div style="font-size:1.2rem;">🛡️</div></div><div class="list-text" style="color:#00ffcc; font-weight:bold; text-shadow: 0 0 5px rgba(0, 255, 204, 0.5);">Арена Призраков</div><div class="list-status"><div class="status-dot" style="background:#00ffcc;"></div></div></div>`
                : `<div class="list-item locked-card" style="opacity:0.6;"><div class="list-icon"><div style="font-size:1.2rem;">🔒</div></div><div class="list-text" style="color:#777;">Арена (Ур. 8)</div></div>`;

            let isRoadsUnlockedByLevel = typeof playerLevel !== 'undefined' && playerLevel >= 7;
            let roadsUnlockedStatus = typeof roadsUnlocked !== 'undefined' && roadsUnlocked;
            let roadItemHtml = (isRoadsUnlockedByLevel || roadsUnlockedStatus)
                ? `<div class="list-item" onclick="openRoads()"><div class="list-icon"><div style="font-size:1.2rem;">🛣️</div></div><div class="list-text" style="color:#d4af37; font-weight:bold; text-shadow: 0 0 5px rgba(212, 175, 55, 0.5);">Дороги</div><div class="list-status"><div class="status-dot" style="background:#d4af37;"></div></div></div>`
                : `<div class="list-item locked-card" style="opacity:0.6;"><div class="list-icon"><div style="font-size:1.2rem;">🔒</div></div><div class="list-text" style="color:#777;">Дороги (Ур. 7)</div></div>`;

            let menuHtml = `
                <div class="list-item" onclick="openSubTab('tab-quests')">
                    <div class="list-icon"><img src="icons/quests.png" class="ui-icon" alt="Задания"></div>
                    <div class="list-text">Ежедневные задания</div>
                    <div class="list-status"><div class="status-dot"></div></div>
                </div>
                <div class="list-item"><div class="list-icon"><div style="font-size:1.2rem;">🎲</div></div><div class="list-text">Ва-банк</div><div class="list-status">3д 10ч</div></div>
                <div class="list-item"><div class="list-icon"><div style="font-size:1.2rem;">🛣️</div></div><div class="list-text">Дороги</div><div class="list-status"><div class="status-dot"></div></div></div>
                
                ${arenaItemHtml}
                
                <div class="list-item" onclick="openSubTab('tab-shop')">
                    <div class="list-icon">
                        <img src="icons/shop_icon.png" class="icon-no-frame" alt="Магазин" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <div style="display:none; font-size:1.2rem;">🛍️</div>
                    </div>
                    <div class="list-text" style="color:#d4af37; font-weight: bold;">Магазин</div>
                </div>
            `;
            menuListContainer.innerHTML = menuHtml;
        }

    } catch (e) { console.error("Ошибка отрисовки карт:", e); }
}

window.openRoads = function() {
    if (!roadsIntroDone) {
        if (typeof startRoadsIntroDialogue === 'function') startRoadsIntroDialogue();
    } else {
        if (typeof renderRoadsTab === 'function') renderRoadsTab();
        openSubTab('tab-roads');
    }
}

window.renderRoadsTab = function() {
    let tab = document.getElementById('tab-roads');
    if (!tab) {
        tab = document.createElement('div');
        tab.id = 'tab-roads';
        tab.className = 'tab-content';
        let scrollContent = document.querySelector('.scrollable-content');
        if(scrollContent) scrollContent.appendChild(tab);
    }

    let html = `
        <div class="shop-header" style="background: linear-gradient(180deg, #1a0033, #0a001a); border-bottom: 2px solid #6600cc;">Неизведанные Дороги</div>
        <div class="back-btn" onclick="switchTab('main', document.getElementById('nav-btn-main'))">🔙 Вернуться на Главную</div>
        <div style="padding: 15px; text-align: center;" id="roads-content-area"></div>
    `;
    tab.innerHTML = html;

    refreshRoadsIfNeeded();
    updateRoadsUI();
}

window.refreshRoadsIfNeeded = function() {
    let period = getRoadPeriod();
    if (roadsCurrentPeriod !== period) {
        roadsCurrentPeriod = period;
        activeRoadJourney = null;
        roadsAvailable = [];

        let tempRoads = [...roadsDB].sort(() => 0.5 - Math.random());
        for(let i=0; i<3; i++) {
            roadsAvailable.push({
                id: tempRoads[i].id,
                recLevel: Math.floor(Math.random() * 46) + 5 
            });
        }
        if(typeof saveGame === 'function') saveGame();
    }
}

window.updateRoadsUI = function() {
    let contentArea = document.getElementById('roads-content-area');
    if(!contentArea) return;

    let d = new Date();
    let currentHour = d.getHours();
    let nextPeriodHour = Math.floor(currentHour / 4) * 4 + 4;
    let nextDate = new Date();
    nextDate.setHours(nextPeriodHour, 0, 0, 0);
    let msLeft = nextDate.getTime() - d.getTime();
    let h = Math.floor(msLeft / 3600000);
    let m = Math.floor((msLeft % 3600000) / 60000);

    let topHtml = `<div style="color:#aaa; margin-bottom: 15px; font-size:0.95rem;">Дороги обновятся через: <b style="color:#00ffff;">${h}ч ${m}м</b></div>`;

    if (activeRoadJourney) {
        if (activeRoadJourney.completed) {
            contentArea.innerHTML = topHtml + `
                <div style="padding: 30px; background: rgba(0,0,0,0.5); border: 1px solid #5a6e9c; border-radius: 8px;">
                    <div style="font-size:3rem; margin-bottom:10px;">🏕️</div>
                    <h3 style="color:#00ffcc; margin:0 0 10px 0;">Путь пройден</h3>
                    <p style="color:#aaa; font-size:0.9rem; line-height:1.4;">Вы уже исследовали дорогу в этом цикле. Отдохните до следующего обновления путей.</p>
                </div>`;
        } else {
            let roadObj = roadsDB.find(r => r.id === activeRoadJourney.roadId);
            let msRemaining = activeRoadJourney.endTime - Date.now();
            if (msRemaining > 0) {
                let secLeft = Math.ceil(msRemaining / 1000);
                let minL = Math.floor(secLeft / 60);
                let secL = secLeft % 60;
                contentArea.innerHTML = topHtml + `
                    <div style="padding: 20px; background: ${roadObj.bg}; border: 2px solid ${roadObj.color}; border-radius: 8px; box-shadow: inset 0 0 30px rgba(0,0,0,0.8);">
                        <div style="height: 4rem; display: flex; justify-content: center; align-items: center; margin-bottom:5px;">
                            <img src="${roadObj.img}" style="max-height:100%; max-width:100%; object-fit:contain; filter: drop-shadow(0 0 10px ${roadObj.color});" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                            <div style="display:none; font-size:3rem;">${roadObj.emoji}</div>
                        </div>
                        <h3 style="color:${roadObj.color}; margin:0;">${roadObj.name}</h3>
                        <div style="color:#fff; font-size:1.2rem; margin:15px 0;">В пути: <b style="color:#00ffcc;">${minL}:${secL < 10 ? '0'+secL : secL}</b></div>
                        <button class="start-btn" style="width:100%; font-size:1rem; padding:12px; background:linear-gradient(180deg, #005566, #002b33); border-color:#00ffff;" onclick="skipRoadJourney()">
                            Ускорить (5 <img src="icons/diamond.png" class="ui-icon" style="width:1em;height:1em;">)
                        </button>
                    </div>`;
                setTimeout(() => {
                    let tab = document.getElementById('tab-roads');
                    if (tab && tab.classList.contains('active')) updateRoadsUI();
                }, 1000);
            } else {
                contentArea.innerHTML = topHtml + `
                    <div style="padding: 20px; background: ${roadObj.bg}; border: 2px solid ${roadObj.color}; border-radius: 8px; box-shadow: inset 0 0 30px rgba(255,0,0,0.3);">
                        <div style="font-size:3rem; margin-bottom:10px;">⚔️</div>
                        <h3 style="color:#ff4d4d; margin:0 0 15px 0;">Враг преграждает путь!</h3>
                        <button class="start-btn" style="width:100%; font-size:1.2rem; background:linear-gradient(180deg, #660000, #330000); border-color:#ff0000;" onclick="startRoadCombat()">Сразиться</button>
                    </div>`;
            }
        }
    } else {
        let cardsHtml = topHtml + `<div style="display:flex; flex-direction:column; gap:12px;">`;
        roadsAvailable.forEach(r => {
            let roadObj = roadsDB.find(db => db.id === r.id);
            cardsHtml += `
                <div style="background: ${roadObj.bg}; border: 1px solid ${roadObj.color}; border-radius: 8px; padding: 15px; display:flex; align-items:center; gap:15px; cursor:pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transition: 0.2s;" onclick="startRoadJourney('${r.id}', ${r.recLevel})">
                    <div style="width: 3.5rem; height: 3.5rem; display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 0 5px ${roadObj.color});">
                        <img src="${roadObj.img}" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <div style="display:none; font-size:2.5rem;">${roadObj.emoji}</div>
                    </div>
                    <div style="flex:1; text-align:left;">
                        <div style="color:${roadObj.color}; font-weight:bold; font-size:1.15rem; margin-bottom:3px; text-shadow: 1px 1px 2px #000;">${roadObj.name}</div>
                        <div style="color:#aaa; font-size:0.85rem;">Реком. уровень: <b style="color:#fff;">${r.recLevel}</b></div>
                    </div>
                    <div style="color:${roadObj.color}; font-size:1.8rem; font-weight:bold; text-shadow: 0 0 10px ${roadObj.color};">➔</div>
                </div>`;
        });
        cardsHtml += `</div>`;
        contentArea.innerHTML = cardsHtml;
    }
}

window.skipRoadJourney = function() {
    if (playerDiamonds < 5) {
        if (typeof showLootAlert === 'function') showLootAlert("Недостаточно алмазов для ускорения пути!");
        return;
    }
    playerDiamonds -= 5;
    activeRoadJourney.endTime = Date.now(); 
    if(typeof saveGame === 'function') saveGame();
    if(typeof updateResourceUI === 'function') updateResourceUI();
    updateRoadsUI();
}

window.startRoadJourney = function(roadId, recLevel) {
    activeRoadJourney = {
        roadId: roadId,
        recLevel: recLevel,
        startTime: Date.now(),
        endTime: Date.now() + (10 * 60 * 1000), 
        completed: false
    };
    if(typeof saveGame === 'function') saveGame();
    updateRoadsUI();
}

window.startRoadCombat = function() {
    if (typeof startBattle === 'function') startBattle('road');
}