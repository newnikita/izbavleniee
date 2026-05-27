// ==========================================
// МАГАЗИН И ТОРГОВЛЯ (js/ui/shop.js)
// ==========================================

function buyItem(type) {
    if (playerGold < 100) { showLootAlert("Недостаточно золота!"); return; }
    if (!playerInventory) return;
    if (!Array.isArray(playerInventory.equip)) playerInventory.equip = [];
    if (!playerInventory.consumables) playerInventory.consumables = {};
    
    let dropText = "";
    if (type === 'equip') {
        let availableItems = [];
        
        if (typeof unlockedEquip !== 'undefined' && Array.isArray(unlockedEquip)) {
            availableItems = [...unlockedEquip];
        }
        
        let ignoreList = ['ring_necromancer', 'amulet_elder_cross'];
        if (typeof playerEquipped !== 'undefined' && playerEquipped) {
            Object.values(playerEquipped).forEach(id => {
                if (id && !ignoreList.includes(id)) availableItems.push(id);
            });
        }
        if (typeof playerInventory !== 'undefined' && playerInventory && Array.isArray(playerInventory.equip)) {
            playerInventory.equip.forEach(id => {
                if (id && !ignoreList.includes(id)) availableItems.push(id);
            });
        }
        
        let prefix = "";
        if (selectedClass === "Защитник") prefix = "weak_def";
        else if (selectedClass === "Аннигилятор") prefix = "weak_anni";
        else if (selectedClass === "Друид") prefix = "weak_druid";
        else if (selectedClass === "Целитель") prefix = "weak_heal";
        else if (selectedClass === "Искуситель") prefix = "weak_temp";
        
        let wKills = typeof weakUndeadKilled !== 'undefined' ? weakUndeadKilled : 0;
        if (wKills >= 1) { availableItems.push(prefix + "_head"); availableItems.push(prefix + "_feet"); }
        if (wKills >= 2) { availableItems.push(prefix + "_body"); }
        if (wKills >= 3) { availableItems.push(prefix + "_weapon"); }
        
        let bossIdx = typeof currentEliteBossIndex !== 'undefined' ? currentEliteBossIndex : 0;
        if (bossIdx > 0) availableItems.push("ring_ember");
        if (bossIdx > 1) availableItems.push("rusty_chest");
        if (bossIdx > 2) availableItems.push("amulet_absorb");
        if (bossIdx > 3) availableItems.push("eye_truth");

        availableItems = [...new Set(availableItems)];
        
        if (availableItems.length === 0) {
            showLootAlert("В магазине пока нет доступного снаряжения. Сражайтесь с врагами и боссами, чтобы предметы появились в продаже!");
            return;
        }
        
        let randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        playerInventory.equip.push(randomItem);
        let itemData = itemsDB[randomItem] || {icon:"", name:"Неизвестно"};
        dropText = `Вы приобрели снаряжение: <b>${itemData.icon} ${itemData.name}</b>`;
        
    } else if (type === 'skill') {
        let roll = Math.random();
        let bookId = "magic_book";
        let rarity = "Обычная";
        
        let cSpells = ClassDictionary && ClassDictionary[selectedClass] ? ClassDictionary[selectedClass].spells : null;
        
        if (roll < 0.15 && cSpells && cSpells[2]) { 
            bookId = "book_" + cSpells[2].id;
            rarity = "<span style='color:#d4af37;'>Эпическая</span>";
        } else if (roll < 0.45 && cSpells && cSpells[1]) { 
            bookId = "book_" + cSpells[1].id;
            rarity = "<span style='color:#00b3ff;'>Редкая</span>";
        } else { 
            bookId = "magic_book";
            rarity = "<span style='color:#aaa;'>Обычная</span>";
        }
        
        if(!playerInventory.consumables[bookId]) playerInventory.consumables[bookId] = 0;
        playerInventory.consumables[bookId]++;
        let itemData = itemsDB[bookId] || {icon:"", name:"Неизвестно"};
        dropText = `Вы приобрели: <b>${itemData.icon} ${itemData.name}</b><br><small>Редкость: ${rarity}</small>`;
    }
    
    playerGold -= 100;
    if (typeof updateQuestProgress === 'function') updateQuestProgress('buy_shop', 1);
    saveGame(); updateResourceUI();
    showLootAlert(`🛒 <b>Покупка успешна!</b><br><br>${dropText}`);
}