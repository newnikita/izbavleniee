// ==========================================
// ИНВЕНТАРЬ И КУЗНЯ (js/ui/inventory.js)
// ==========================================

function renderInventory() {
    let equipHtml = "";
    if (typeof playerEquipped !== 'undefined' && playerEquipped) {
        for (let slot in playerEquipped) {
            let itemId = playerEquipped[slot];
            if (itemId && typeof itemsDB !== 'undefined' && itemsDB[itemId]) {
                let item = itemsDB[itemId];
                let stats = getEquipStats(itemId);
                
                let dynamicDesc = item.desc;
                if (stats.bonusDmg || stats.bonusArmor || stats.bonusHp) {
                    let dArr = [];
                    if (stats.bonusDmg) dArr.push(`+${stats.bonusDmg} Урон`);
                    if (stats.bonusArmor) dArr.push(`+${stats.bonusArmor} Броня`);
                    if (stats.bonusHp) dArr.push(`+${stats.bonusHp} ХП`);
                    dynamicDesc = dArr.join(', ') + (itemId === 'amulet_absorb' && stats.level > 1 ? `, +${Math.min(5, stats.level - 1)}% Реген. Маны` : '');
                }

                equipHtml += `<div class="inv-item" style="padding:10px;">
                    <div class="inv-item-info">
                        <span style="font-size:1.5rem; margin-right:8px;">${item.icon}</span> 
                        <b>${item.name} <span style="color:#00ffcc;">[Ур. ${stats.level}]</span></b> <br>
                        <small style="color:#88a3d6;">${dynamicDesc}</small>
                    </div>
                </div>`;
            } else {
                let slotNames = { head: "Голова", body: "Доспех", weapon: "Оружие", feet: "Обувь", ring: "Кольцо", amulet: "Амулет" };
                equipHtml += `<div class="inv-item" style="padding:10px;"><div class="inv-item-info" style="color:#555;">[Пусто] - ${slotNames[slot] || slot}</div></div>`;
            }
        }
    }
    let eList = document.getElementById('inv-equipped-list');
    if(eList) eList.innerHTML = equipHtml;

    let itemsHtml = "";
    if (typeof playerInventory !== 'undefined' && playerInventory && playerInventory.consumables) {
        for (let itemId in playerInventory.consumables) {
            let count = playerInventory.consumables[itemId];
            if (count > 0 && typeof itemsDB !== 'undefined' && itemsDB[itemId]) {
                let item = itemsDB[itemId];
                
                if (itemId === "beast_skin") {
                    itemsHtml += `
                    <div class="inv-item" style="padding:10px; display:flex; flex-direction:column; gap:10px;">
                        <div class="inv-item-info"><span style="font-size:1.5rem; margin-right:8px;">${item.icon}</span> <b>${item.name}</b> (x${count}) <br><small style="color:#88a3d6;">${item.desc}</small></div>
                        <div style="display:flex; gap:10px;">
                            <button class="use-btn" style="flex:1; background: linear-gradient(180deg, #28a745, #1b5e20); border-color:#28a745;" onclick="tradeSkin()">Отдать старосте</button>
                            <button class="use-btn" style="flex:1; background: linear-gradient(180deg, #dc3545, #8b0000); border-color:#dc3545;" onclick="sellSkin()">Продать (15 <img src="icons/gold.png" class="ui-icon">)</button>
                        </div>
                    </div>`;
                } else {
                    itemsHtml += `<div class="inv-item" style="padding:10px;">
                        <div class="inv-item-info"><span style="font-size:1.5rem; margin-right:8px;">${item.icon}</span> <b>${item.name}</b> (x${count}) <br><small style="color:#88a3d6;">${item.desc}</small></div>
                        <button class="use-btn" onclick="useConsumable('${itemId}')">Исп.</button>
                    </div>`;
                }
            }
        }
    }
    let skList = document.getElementById('inv-skill-list');
    if(skList) skList.innerHTML = itemsHtml || `<div style='padding: 20px; color:#555; text-align:center;'><img src="icons/inventory.png" class="ui-icon" style="width:3em; height:3em; display:block; margin:0 auto 10px; opacity:0.5;">Нет предметов.</div>`;

    let bagHtml = "";
    if (typeof playerInventory !== 'undefined' && playerInventory && Array.isArray(playerInventory.equip)) {
        let bagCounts = {};
        playerInventory.equip.forEach(id => {
            bagCounts[id] = (bagCounts[id] || 0) + 1;
        });

        for (let itemId in bagCounts) {
            let count = bagCounts[itemId];
            if (typeof itemsDB !== 'undefined' && itemsDB[itemId]) {
                let item = itemsDB[itemId];
                let stats = getEquipStats(itemId);
                
                let dynamicDesc = item.desc;
                if (stats.bonusDmg || stats.bonusArmor || stats.bonusHp) {
                    let dArr = [];
                    if (stats.bonusDmg) dArr.push(`+${stats.bonusDmg} Урон`);
                    if (stats.bonusArmor) dArr.push(`+${stats.bonusArmor} Броня`);
                    if (stats.bonusHp) dArr.push(`+${stats.bonusHp} ХП`);
                    dynamicDesc = dArr.join(', ') + (itemId === 'amulet_absorb' && stats.level > 1 ? `, +${Math.min(5, stats.level - 1)}% Реген. Маны` : '');
                }

                let upgBtn = "";
                if (count >= 5 && itemId !== 'ring_necromancer' && itemId !== 'amulet_elder_cross') {
                    upgBtn = `<button class="use-btn" style="background: linear-gradient(180deg, #d4af37, #8b6508); border-color:#ffd700;" onclick="upgradeEquip('${itemId}')">Улучшить (5 шт + 500 💰)</button>`;
                }

                bagHtml += `<div class="inv-item" style="padding:10px;">
                    <div class="inv-item-info">
                        <span style="font-size:1.5rem; margin-right:8px;">${item.icon}</span> 
                        <b>${item.name} <span style="color:#00ffcc;">[Ур. ${stats.level}]</span></b> (x${count}) <br>
                        <small style="color:#88a3d6;">${dynamicDesc}</small>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:5px;">
                        <button class="equip-btn" onclick="equipItemById('${itemId}')">Надеть</button>
                        ${upgBtn}
                    </div>
                </div>`;
            }
        }
    }
    let eqList = document.getElementById('inv-equip-list');
    if(eqList) eqList.innerHTML = bagHtml || `<div style='padding: 20px; color:#555; text-align:center;'><img src="icons/equipment.png" class="ui-icon" style="width:3em; height:3em; display:block; margin:0 auto 10px; opacity:0.5;">Рюкзак пуст.</div>`;
}

window.equipItemById = function(itemId) {
    try {
        if(!playerInventory || !Array.isArray(playerInventory.equip)) return;
        let item = typeof itemsDB !== 'undefined' ? itemsDB[itemId] : null;
        if (!item) return;
        
        let idx = playerInventory.equip.indexOf(itemId);
        if (idx === -1) return;

        let alertMsg = `Вы надели: <b>${item.icon} ${item.name}</b>`;

        if (item.slot === 'ring' && playerEquipped && playerEquipped.ring === 'ring_necromancer') {
            alertMsg += `<br><br><span style="color:#ff4d4d;">💀 Кольцо Некроманта рассыпалось в прах при снятии!</span>`;
            playerEquipped.ring = null; 
        } else if (playerEquipped && playerEquipped[item.slot]) {
            playerInventory.equip.push(playerEquipped[item.slot]);
        }
        
        if (playerEquipped) playerEquipped[item.slot] = itemId;
        playerInventory.equip.splice(idx, 1);
        
        saveGame(); updateStatsUI(); renderInventory();
        
        if (typeof isFullSetEquipped === 'function' && isFullSetEquipped(selectedClass)) {
            alertMsg += `<br><br><span style="color:#d4af37;">✨ Активирован бонус полного сета!</span>`;
        }
        showLootAlert(alertMsg);
    } catch(e) { console.error("Ошибка экипировки:", e); }
};

window.upgradeEquip = function(itemId) {
    let count = playerInventory.equip.filter(id => id === itemId).length;
    if (count < 5) {
        showLootAlert("Недостаточно копий предмета (нужно 5 в рюкзаке).");
        return;
    }
    if (playerGold < 500) {
        showLootAlert("Недостаточно золота для ковки (нужно 500 <img src='icons/gold.png' class='ui-icon'>).");
        return;
    }
    
    let currentLvl = (typeof equipLevels !== 'undefined' && equipLevels[itemId]) ? equipLevels[itemId] : 1;
    
    if (itemId === 'ring_ember' && currentLvl >= 6) {
        showLootAlert("Кольцо Тлеющего Угля достигло максимального могущества!");
        return;
    }
    if (itemId === 'amulet_absorb' && currentLvl >= 6) {
        showLootAlert("Амулет Поглощения достиг предела впитывания магии!");
        return;
    }

    let removed = 0;
    for (let i = playerInventory.equip.length - 1; i >= 0; i--) {
        if (playerInventory.equip[i] === itemId) {
            playerInventory.equip.splice(i, 1);
            removed++;
            if (removed === 5) break;
        }
    }
    
    playerGold -= 500;
    if (typeof equipLevels === 'undefined') equipLevels = {};
    equipLevels[itemId] = currentLvl + 1;
    
    saveGame(); updateResourceUI(); updateStatsUI(); renderInventory();
    
    let item = itemsDB[itemId];
    showLootAlert(`✨ <b>Экипировка улучшена в кузне!</b><br><br><b>${item.icon} ${item.name}</b> теперь <b>Ур. ${equipLevels[itemId]}</b>!<br><small style="color:#00ffcc;">Характеристики всех предметов этого типа возросли.</small>`);
};

window.tradeSkin = function() {
    if (!playerInventory || !playerInventory.consumables["beast_skin"] || playerInventory.consumables["beast_skin"] <= 0) return;
    
    playerInventory.consumables["beast_skin"]--;
    playerWood += 10;
    playerStone += 5;
    
    let moralityText = "";
    if (typeof firstSkinHandled !== 'undefined' && !firstSkinHandled) {
        playerRighteousness += 1;
        firstSkinHandled = true;
        moralityText = `<br><br><span style="color:#00ffcc;">🕊️ <b>+1 Праведность</b> (Помощь нуждающимся)</span>`;
    }

    if(typeof skinsGivenToElder !== 'undefined') skinsGivenToElder++;
    if (typeof updateQuestProgress === 'function') updateQuestProgress('give_skins', 1);
    
    saveGame(); updateStatsUI(); renderInventory();
    showLootAlert(`Вы отдали шкуру старосте.<br>Получено:<br>🪵 <b>10 Древесины</b><br>🧱 <b>5 Камня</b>${moralityText}`);
};

window.sellSkin = function() {
    if (!playerInventory || !playerInventory.consumables["beast_skin"] || playerInventory.consumables["beast_skin"] <= 0) return;
    
    playerInventory.consumables["beast_skin"]--;
    playerGold += 15;
    
    let moralityText = "";
    if (typeof firstSkinHandled !== 'undefined' && !firstSkinHandled) {
        playerApostasy += 1;
        firstSkinHandled = true;
        moralityText = `<br><br><span style="color:#ff4d4d;">🩸 <b>+1 Отступничество</b> (Эгоизм)</span>`;
    }

    saveGame(); updateResourceUI(); updateStatsUI(); renderInventory();
    showLootAlert(`Вы продали шкуру за <b>15 <img src="icons/gold.png" class="ui-icon"></b>.<br><br><small style="color:#ff4d4d;"><i>"На золото от продажи шкур всех книг магии не купишь, Избавитель! Нам нужны стройматериалы!" — ворчит староста.</i></small>${moralityText}`);
};

function useConsumable(itemId) {
    if (!playerInventory || !playerInventory.consumables[itemId] || playerInventory.consumables[itemId] <= 0) return;
    let item = typeof itemsDB !== 'undefined' ? itemsDB[itemId] : null;
    
    if (item && item.type === "skill_book") {
        let spellId = itemId === 'magic_book' ? 'base' : itemId.replace('book_', '');
        playerInventory.consumables[itemId]--;
        if (!spellBooksRead[spellId]) spellBooksRead[spellId] = 0;
        spellBooksRead[spellId]++;
        
        saveGame(); updateStatsUI(); renderInventory();
        showLootAlert(`📖 <b>Знания усвоены!</b><br>Вы прочитали книгу: <b>${item.name}</b>.<br><small>Счетчик прогресса во вкладке Магия обновлен.</small>`);
        return;
    }
    
    if (itemId === "tome_of_mind") {
        if (typeof librarySpellUpgraded !== 'undefined' && librarySpellUpgraded) { showLootAlert("Вы уже усвоили эти знания."); return; }
        playerInventory.consumables[itemId]--;
        librarySpellUpgraded = true;
        saveGame(); updateStatsUI(); renderInventory();
        showLootAlert(`📕 <b>Тайные знания усвоены!</b><br>Теперь вы способны подчинить разум даже Павших Избавителей без прокачки.`);
    }
}