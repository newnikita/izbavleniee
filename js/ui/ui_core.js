// ==========================================
// ОСНОВНОЙ ИНТЕРФЕЙС (js/ui/ui_core.js)
// Навигация, обновление характеристик и модальные окна
// ==========================================

function getCurrentAvatarFile() {
    if (typeof playerAvatars === 'undefined') return 'icons/av_mage.png';
    let av = playerAvatars.find(a => a.id === playerAvatar);
    return av ? av.file : 'icons/av_mage.png';
}

function applyClassStats() {
    if (!selectedClass || !ClassDictionary[selectedClass]) {
        selectedClass = "Защитник"; 
    }
    let cData = ClassDictionary[selectedClass];
    let levelBonus = ((playerLevel || 1) - 1) * 50;
    
    // Постоянный бонус за Некроманта
    let necroBonus = (typeof currentEliteBossIndex !== 'undefined' && currentEliteBossIndex > 5) ? 250 : 0;
    
    baseStats.hp = (cData.baseStats.hp || 500) + levelBonus + necroBonus;
    baseStats.shield = cData.baseStats.shield || 0;
    
    let avIcon = document.getElementById('char-avatar-icon');
    if(avIcon) {
        avIcon.innerHTML = `<img src="${getCurrentAvatarFile()}" class="icon-no-frame" style="width:100%; height:100%; border-radius:50%; object-fit:cover; cursor:pointer;" onclick="openAvatarSelector()">`;
    }
    let btIcon = document.getElementById('battle-player-icon');
    if(btIcon) {
        btIcon.innerHTML = `<img src="${getCurrentAvatarFile()}" class="icon-no-frame" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    }
    
    let shieldCont = document.getElementById('shield-skill-container');
    if(shieldCont) {
        if (selectedClass === 'Защитник') { shieldCont.style.display = "block"; } 
        else { shieldCont.style.display = "none"; }
    }
}

function showChangeClassMenu() {
    isChangingClass = true;
    document.getElementById('game-hub').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('game-hub').style.display = 'none';
        let cTitle = document.getElementById('class-screen-title'); if(cTitle) cTitle.innerText = "Сменить путь";
        document.getElementById('class-screen').style.display = 'flex';
        setTimeout(() => { document.getElementById('class-screen').style.opacity = '1'; }, 50);
    }, 500);
}

function switchTab(tabName, navElement) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if(navElement) navElement.classList.add('active');
    openSubTab('tab-' + tabName);
}

function openSubTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    
    // === ИСПРАВЛЕНИЕ: Вызываем рендер динамических вкладок перед открытием ===
    if (tabId === 'tab-arena' && typeof renderArenaTab === 'function') {
        renderArenaTab();
    }
    if (tabId === 'tab-roads' && typeof renderRoadsTab === 'function') {
        renderRoadsTab();
    }

    let tEl = document.getElementById(tabId); if(tEl) tEl.classList.add('active');
    let sEl = document.querySelector('.scrollable-content'); if(sEl) sEl.scrollTop = 0;
    
    if (typeof renderInventory === "function" && tabId === 'tab-inventory') renderInventory();
    if (typeof renderMagic === "function" && tabId === 'tab-magic') renderMagic();
    
    if (tabId === 'tab-main' && typeof updateMainCards === 'function') updateMainCards(); 
    if (tabId === 'tab-quests' && typeof renderQuests === 'function') renderQuests();
    if (tabId === 'tab-bank' && typeof updateBankUI === 'function') updateBankUI();

    if (tabId === 'tab-domain') {
        if (typeof banditDefeated !== 'undefined' && banditDefeated) {
            let dl = document.getElementById('domain-locked'); if(dl) dl.style.display = 'none';
            let du = document.getElementById('domain-unlocked'); if(du) du.style.display = 'block';
            if (typeof renderDomain === 'function') renderDomain(); 
        } else {
            let dl = document.getElementById('domain-locked'); if(dl) dl.style.display = 'block';
            let du = document.getElementById('domain-unlocked'); if(du) du.style.display = 'none';
        }
    }
}

function formatCompactNumber(number) {
    if (number >= 1000000) {
        return (number / 1000000).toFixed(2).replace(/\.00$/, '') + 'm';
    }
    if (number >= 1000) {
        return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return number.toString();
}

function updateResourceUI() {
    let safeGold = (typeof playerGold !== 'undefined' && !isNaN(playerGold)) ? playerGold : 0;
    let safeDiamonds = (typeof playerDiamonds !== 'undefined' && !isNaN(playerDiamonds)) ? playerDiamonds : 0;
    let uiG = document.getElementById('ui-gold');
    if(uiG) uiG.innerHTML = `<img src="icons/gold.png" class="ui-icon" alt="Золото"> <span>${formatCompactNumber(safeGold)}</span>`;
    let uiD = document.getElementById('ui-crystal');
    if(uiD) uiD.innerHTML = `<img src="icons/diamond.png" class="ui-icon" alt="Алмазы"> <span>${formatCompactNumber(safeDiamonds)}</span>`;
}

function getSetPiecesCount(className) {
    if (!playerEquipped) return 0;
    let count = 0;
    let prefix = "";
    if (className === "Защитник") prefix = "weak_def";
    else if (className === "Аннигилятор") prefix = "weak_anni";
    else if (className === "Друид") prefix = "weak_druid";
    else if (className === "Целитель") prefix = "weak_heal";
    else if (className === "Искуситель") prefix = "weak_temp";

    if (playerEquipped.head && playerEquipped.head.includes(prefix)) count++;
    if (playerEquipped.body && playerEquipped.body.includes(prefix)) count++;
    if (playerEquipped.weapon && playerEquipped.weapon.includes(prefix)) count++;
    if (playerEquipped.feet && playerEquipped.feet.includes(prefix)) count++;
    return count;
}

function isFullSetEquipped(className) {
    return getSetPiecesCount(className) === 4;
}

function getEquipStats(itemId) {
    let item = typeof itemsDB !== 'undefined' ? itemsDB[itemId] : null;
    if (!item) return { bonusDmg: 0, bonusArmor: 0, bonusHp: 0, level: 1 };
    
    let lvl = (typeof equipLevels !== 'undefined' && equipLevels[itemId]) ? equipLevels[itemId] : 1;
    let d = item.bonusDmg || 0;
    let a = item.bonusArmor || 0;
    let h = item.bonusHp || 0;
    
    if (itemId === 'amulet_elder_cross') {
        let pLvl = typeof playerLevel !== 'undefined' ? (playerLevel || 1) : 1;
        h += 250 + (pLvl - 1) * 50; 
        lvl = pLvl; 
    } else if (lvl > 1) {
        if (itemId === 'ring_ember') {
            d += (lvl - 1) * 2; 
            if (d > 26) d = 26; 
        } else if (itemId === 'eye_truth') {
            d += (lvl - 1) * 2;
            a += (lvl - 1) * 1;
        } else if (itemId === 'rusty_chest') {
            a += (lvl - 1) * 1;
            h += (lvl - 1) * 50;
        } else if (itemId === 'amulet_absorb') {
            d += (lvl - 1) * 1;
        } else if (itemId.includes('weak_')) {
            d += (lvl - 1) * 1;
            a += Math.floor((lvl - 1) * 0.5);
        }
    }
    return { bonusDmg: d, bonusArmor: a, bonusHp: h, level: lvl };
}

function getTotalArmor() {
    let equipShield = 0; let equipHp = 0; let equipDmg = 0;
    
    if (typeof itemsDB !== 'undefined' && typeof playerEquipped !== 'undefined' && playerEquipped) {
        let slots = ['head', 'body', 'weapon', 'feet', 'amulet', 'ring'];
        slots.forEach(slot => {
            let itemId = playerEquipped[slot];
            if (itemId && itemsDB[itemId]) {
                let s = getEquipStats(itemId);
                equipShield += s.bonusArmor || 0;
                equipDmg += s.bonusDmg || 0;
                equipHp += s.bonusHp || 0;
            }
        });
    }
    
    if (typeof isFullSetEquipped === 'function' && isFullSetEquipped(selectedClass)) { equipShield += 8; }
    
    let baseAndEquip = (baseStats && baseStats.shield ? baseStats.shield : 0) + equipShield;
    let sProg = typeof shieldProgress !== 'undefined' ? (shieldProgress || 0) : 0;
    let skillBonusValue = Math.floor(baseAndEquip * (sProg / 100));
    if (sProg > 0 && skillBonusValue === 0) skillBonusValue = 1; 
    
    return { total: baseAndEquip + skillBonusValue, equip: equipShield, bonus: skillBonusValue, extraHp: equipHp, extraDmg: equipDmg };
}

function updateStatsUI() {
    let armor = getTotalArmor();
    let safeBaseHp = (baseStats && baseStats.hp) ? baseStats.hp : 500;
    let finalHp = safeBaseHp + (armor.extraHp || 0);
    
    let hpTop = document.getElementById('stat-hp-top');
    if(hpTop) hpTop.innerHTML = `<img src="icons/health.png" class="ui-icon" alt="Здоровье"> ${finalHp}`;
    
    let fireTop = document.getElementById('stat-fire-top'); if(fireTop) fireTop.style.display = 'none';
    let waterTop = document.getElementById('stat-water-top'); if(waterTop) waterTop.style.display = 'none';
    let airTop = document.getElementById('stat-air-top'); if(airTop) airTop.style.display = 'none';
    
    let shieldTop = document.getElementById('stat-shield-top');
    if(shieldTop) shieldTop.innerHTML = `<img src="icons/armor.png" class="ui-icon" alt="Броня"> ${armor.total}`;
    
    let sVal = document.getElementById('char-stat-shield');
    if(sVal) {
        let setBonusText = (typeof isFullSetEquipped === 'function' && isFullSetEquipped(selectedClass)) ? ` | <span style="color:#d4af37;">Бонус сета: +8</span>` : ``;
        sVal.innerHTML = `Щит: <span class="char-stat-val">${armor.total}</span> <span style="color:#aaa; font-size: 0.8rem;">(Экипировка: ${armor.equip}${setBonusText} | Бафф: +${armor.bonus})</span>`;
        
        let paramsEl = document.getElementById('player-parameters-container');
        if (!paramsEl) {
            paramsEl = document.createElement('div');
            paramsEl.id = 'player-parameters-container';
            paramsEl.style.marginTop = '15px';
            paramsEl.style.paddingTop = '10px';
            paramsEl.style.borderTop = '1px dashed #5a6e9c';
            sVal.parentNode.insertBefore(paramsEl, sVal.nextSibling);
        }
        
        let oldMorality = document.getElementById('morality-stats-container');
        if (oldMorality) oldMorality.remove();

        let piercing = typeof playerPiercing !== 'undefined' ? playerPiercing : 0;
        let right = typeof playerRighteousness !== 'undefined' ? playerRighteousness : 0;
        let apost = typeof playerApostasy !== 'undefined' ? playerApostasy : 0;

        paramsEl.innerHTML = `
            <div style="font-size: 1.1rem; color: #00b3ff; margin-bottom: 8px; text-align: center; font-weight: bold;">Параметры</div>
            <div style="background: rgba(0,0,0,0.4); padding: 10px; border-radius: 6px; font-size: 0.95rem; line-height: 1.6;">
                <div><img src="icons/health.png" class="ui-icon" style="width: 1.2em; height: 1.2em; vertical-align: middle;"> Макс. здоровье: <b style="color:#00ff00;">${finalHp}</b></div>
                <div><img src="icons/armor.png" class="ui-icon" style="width: 1.2em; height: 1.2em; vertical-align: middle;"> Текущая броня: <b style="color:#aaa;">${armor.total}</b></div>
                <div><img src="icons/piercing.png" class="ui-icon" style="width: 1.2em; height: 1.2em; vertical-align: middle;"> Пронзание: <b style="color:#ffcc00;">${piercing}%</b></div>
            </div>
            
            <div style="font-size: 0.9rem; color: #fff; margin-top: 15px; margin-bottom: 5px;">Мировоззрение:</div>
            <div style="display: flex; justify-content: space-between; font-size: 0.95rem; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 6px;">
                <span style="color: #00ffcc;" title="Праведность">🕊️ Праведность: <b>${right}</b></span>
                <span style="color: #ff4d4d;" title="Отступничество">🩸 Отступничество: <b>${apost}</b></span>
            </div>
        `;
    }
    
    let sText = document.getElementById('shield-skill-text');
    if(sText) {
        let sProg = typeof shieldProgress !== 'undefined' ? (shieldProgress || 0) : 0;
        sText.innerHTML = `Усиление защиты: <b style="color:#00ffcc;">+${sProg.toFixed(2)}%</b>`;
    }
    
    let totalItems = 0;
    if (typeof playerInventory !== 'undefined' && playerInventory) {
        let eLen = Array.isArray(playerInventory.equip) ? playerInventory.equip.length : 0;
        let cLen = playerInventory.consumables ? Object.keys(playerInventory.consumables).length : 0;
        totalItems = eLen + cLen;
    }
    let invBadge = document.getElementById('inv-count-badge');
    if(invBadge) invBadge.innerText = `(${totalItems})`;
    
    let safeBank = (typeof playerBankDiamonds !== 'undefined' && !isNaN(playerBankDiamonds)) ? playerBankDiamonds : 0;
    let badgeBank = document.getElementById('bank-count-badge');
    if (badgeBank) badgeBank.innerHTML = `<img src="icons/diamond.png" class="ui-icon"> ${formatCompactNumber(safeBank)}`;

    let lvlVal = document.getElementById('char-lvl-val');
    if(lvlVal) lvlVal.innerText = typeof playerLevel !== 'undefined' ? (playerLevel || 1) : 1;
    
    if (typeof getXpForNextLevel === "function") {
        let nextXp = getXpForNextLevel();
        let pXp = typeof playerXp !== 'undefined' ? (playerXp || 0) : 0;
        let pct = Math.floor((pXp / nextXp) * 100);
        
        let xpVal = document.getElementById('char-xp-val');
        if(xpVal) xpVal.innerText = `${Math.floor(pXp)} / ${nextXp}`;
        let xpPct = document.getElementById('char-xp-pct');
        if(xpPct) xpPct.innerText = pct;
        let xpBar = document.getElementById('char-xp-bar');
        if(xpBar) xpBar.style.width = pct + '%';
    }
}

// === ВСПЛЫВАЮЩИЕ УВЕДОМЛЕНИЯ (АЛЕРТЫ) ===
function showLootAlert(text, callback = null, extraBtns = '') {
    let altTxt = document.getElementById('loot-alert-text');
    if(!altTxt) return;
    altTxt.innerHTML = text; alertCallback = callback;
    let alertBox = document.getElementById('loot-alert'); 
    let btnsContainer = document.getElementById('loot-alert-btns');
    if(!btnsContainer) {
        const oldBtn = alertBox.querySelector('button'); btnsContainer = document.createElement('div');
        btnsContainer.id = 'loot-alert-btns'; btnsContainer.style.display = 'flex'; btnsContainer.style.justifyContent = 'center';
        btnsContainer.style.gap = '10px'; btnsContainer.style.flexWrap = 'wrap'; alertBox.insertBefore(btnsContainer, oldBtn);
        if(oldBtn) { oldBtn.remove(); }
    }
    let defaultBtnText = extraBtns ? "Отступить" : "Отлично";
    btnsContainer.innerHTML = extraBtns + `<button onclick="closeLootAlert()">${defaultBtnText}</button>`;
    alertBox.style.display = 'flex'; setTimeout(() => { alertBox.style.opacity = '1'; }, 50);
}

function closeLootAlert() {
    let alertBox = document.getElementById('loot-alert'); 
    if(!alertBox) return;
    alertBox.style.opacity = '0';
    setTimeout(() => { 
        alertBox.style.display = 'none'; 
        if (alertCallback) { let cb = alertCallback; alertCallback = null; cb(); } 
    }, 300);
}

// === ОКНО ВЫБОРА АВАТАРОВ ===
window.openAvatarSelector = function() {
    let selector = document.getElementById('avatar-selector-modal');
    if (!selector) {
        selector = document.createElement('div');
        selector.id = 'avatar-selector-modal';
        selector.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(10, 14, 28, 0.95); border: 2px solid #00b3ff; border-radius:8px; padding:20px; z-index:2000; width: 90%; max-width: 400px; box-shadow: 0 0 20px #00b3ff;';
        
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; color:#00b3ff; font-weight:bold; font-size:1.1rem; margin-bottom:15px;">
                <span>Выберите личный аватар</span>
                <span style="cursor:pointer; color:#ff4d4d; font-size:1.4rem;" onclick="closeAvatarSelector()">×</span>
            </div>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px;" id="avatar-grid-content">
            </div>
        `;
        selector.innerHTML = html;
        document.body.appendChild(selector);
    }
    
    let grid = document.getElementById('avatar-grid-content');
    let gridHtml = '';
    if (typeof playerAvatars !== 'undefined') {
        playerAvatars.forEach(av => {
            let isSelected = (typeof playerAvatar !== 'undefined' && av.id === playerAvatar);
            gridHtml += `
                <div class="avatar-select-option" onclick="selectAvatar('${av.id}')" style="background:#050814; border: 2px solid ${isSelected ? '#ffd700' : '#29385c'}; border-radius:8px; padding:8px; text-align:center; cursor:pointer; transition:all 0.2s;">
                    <img src="${av.file}" class="icon-no-frame" style="width:100%; height:auto; display:block; margin: 0 auto; filter: ${isSelected ? 'none' : 'grayscale(100%)'}; border-radius:4px;">
                    <div style="color:${isSelected ? '#ffd700' : '#aaa'}; font-size:0.8rem; margin-top:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${av.name}</div>
                </div>`;
        });
    }
    grid.innerHTML = gridHtml;
    selector.style.display = 'block';
};

window.closeAvatarSelector = function() {
    let selector = document.getElementById('avatar-selector-modal');
    if(selector) selector.style.display = 'none';
};

window.selectAvatar = function(id) {
    playerAvatar = id;
    if (typeof saveGame === 'function') saveGame();
    if (typeof applyClassStats === 'function') applyClassStats();
    closeAvatarSelector();
    if (typeof showLootAlert === 'function') {
        showLootAlert('🎭 <b>Аватар обновлен!</b><br><br>Ваша личная печать Избавителя теперь отображается в бою и диалогах.');
    }
};