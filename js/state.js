// ==========================================
// ПАМЯТЬ МИРА (js/core/state.js)
// Глобальные переменные и система сохранений
// ==========================================

window.ysdk = null;
window.ysdkPlayer = null;

let playerGold = 100000;
let playerDiamonds = 50000;
let playerBankDiamonds = 0; 
let selectedClass = "Защитник"; 
let playerAvatar = 'av_mage'; 

let baseStats = { hp: 500, shield: 1 };
let shieldProgress = 0; 

let playerLevel = 1;
let playerXp = 0;

let playerRighteousness = 0; 
let playerApostasy = 0;      
let firstSkinHandled = false; 
let playerPiercing = 0; 

let magicLevel = 1;
let magicXp = 0;

let spellLevels = {
    'base': 1, 'shield': 1, 'constanta': 1, 'heal': 1, 'stun_undead': 1,
    'firestorm': 1, 'anti_undead': 1, 'blind': 1, 'mind_control': 1,
    'spirit': 1, 'release': 1
};

let spellBooksRead = {
    'base': 0, 'shield': 0, 'constanta': 0, 'heal': 0, 'stun_undead': 0,
    'firestorm': 0, 'anti_undead': 0, 'blind': 0, 'mind_control': 0,
    'spirit': 0, 'release': 0
};

let equipLevels = {};
let unlockedEquip = [];

let playerWood = 0;
let playerStone = 0;
let skinsGivenToElder = 0;

let playerInventory = { equip: [], consumables: {} };
let playerEquipped = { head: null, body: null, weapon: null, ring: null, amulet: null, feet: null }; 

let alertCallback = null; 
let banditDefeated = false;
let banditKilled = false;
let townHallIntroDone = false; 
let undeadIntroLost = false; 
let playerHasLibrarySpell = false; 
let librarySpellUpgraded = false; 
let isChangingClass = false; 
let midlockLocked = false; 
let authRewardClaimed = false; 

// === ФЛАГИ АРЕНЫ ===
let arenaUnlocked = false;
let arenaGhostIntroDone = false;
let etherealFlowers = 5;
let lastFlowerRegenTime = Date.now();
let arenaPoints = 0;

// === ФЛАГИ ДОРОГ ===
let roadsUnlocked = false;
let roadsIntroDone = false;
let roadsCurrentPeriod = "";
let roadsAvailable = [];
let activeRoadJourney = null;

let elderInterruptedElite = false; 
let beastHuntingUnlocked = false;  
let townHallRebuilt = false;       

let weakUndeadKilled = 0; 
let elitePhaseActive = false; 
let currentEliteBossIndex = 0; 

let midlockIntroDone = false;
let midlockSpiritDefeated = false; // НОВЫЙ ФЛАГ (Победа над духом Мидлока)
let girlEncounterDone = false;     // НОВЫЙ ФЛАГ (Сюжет с Незнакомкой завершен)

let necromancerUnlocked = false;
let necromancerIntroDone = false;
let isEndingPhase = false;

let currentIndex = 0;
let isTransitioning = false; 

let quests = [
    { id: 'q1', type: 'kill_undead', title: "Очищение пустошей", desc: "Уничтожьте 3 слабых мертвецов.", target: 3, current: 0, rewardGold: 150, rewardXp: 50, icon: "🧟", claimed: false },
    { id: 'q2', type: 'kill_beast', title: "Сезон охоты", desc: "Одержите победу над любым диким зверем.", target: 1, current: 0, rewardGold: 200, rewardXp: 30, icon: "🐺", claimed: false },
    { id: 'q3', type: 'buy_shop', title: "Постоянный клиент", desc: "Совершите 1 покупку в магазине редкостей.", target: 1, current: 0, rewardGold: 50, rewardXp: 100, icon: "🛍️", claimed: false }
];

let combatIntervals = []; 
let battleState = {
    active: false, mana: 0, playerHp: 500, playerMaxHp: 500, enemyHp: 200, enemyMaxHp: 200,
    shieldEndTime: 0, enemyType: '', originalEnemyType: '', enemyDmg: 100, spellCooldown: 0, attackCount: 0, nextHitIsCrit: false, spellTick: 0,
    constantActive: false, constantVisible: false, enemyStunTurns: 0, enemyBlindTurns: 0,
    mindControlActive: false, spiritActive: false, spiritAbsorbed: 0, playerExhausted: false, rotStacks: 0,
    shieldArmorBonus: 0, spiritAbsorbPct: 0.30, etherealTurns: 0,
    girlDmgMult: 1.0, playerBurnTurns: 0 // НОВЫЕ БОЕВЫЕ СТАТУСЫ ДЛЯ НЕЗНАКОМКИ
};

function saveGame() {
    try {
        const saveData = {
            playerName: document.getElementById('profile-player-name') ? document.getElementById('profile-player-name').innerText : "Иземберт",
            playerAvatar,
            playerGold, playerDiamonds, playerBankDiamonds, selectedClass, baseStats,
            shieldProgress, playerInventory, playerEquipped, playerLevel, playerXp, quests,
            banditDefeated, banditKilled, townHallIntroDone, undeadIntroLost, playerHasLibrarySpell, librarySpellUpgraded, isChangingClass, midlockLocked, authRewardClaimed,
            
            arenaUnlocked, arenaGhostIntroDone, etherealFlowers, lastFlowerRegenTime, arenaPoints,
            roadsUnlocked, roadsIntroDone, roadsCurrentPeriod, roadsAvailable, activeRoadJourney,
            
            elderInterruptedElite, beastHuntingUnlocked, townHallRebuilt, playerWood, playerStone, skinsGivenToElder,
            magicLevel, magicXp, elitePhaseActive, currentEliteBossIndex, weakUndeadKilled, spellLevels, spellBooksRead,
            playerRighteousness, playerApostasy, firstSkinHandled, playerPiercing,
            equipLevels, unlockedEquip, 
            
            midlockIntroDone, midlockSpiritDefeated, girlEncounterDone, // СОХРАНЕНИЕ НОВЫХ СЮЖЕТНЫХ ФЛАГОВ
            necromancerUnlocked, necromancerIntroDone, isEndingPhase, 
            isSetupComplete: true 
        };
        
        localStorage.setItem('izbavlenieSave', JSON.stringify(saveData));

        if (window.ysdkPlayer) {
            window.ysdkPlayer.setData({ 'izbavlenieSave': saveData }).catch(err => {
                console.error('[ЯНДЕКС] Ошибка сохранения данных в облако:', err);
            });
        }
    } catch(e) { console.error("Ошибка сохранения:", e); }
}

async function loadGame() {
    let data = null;

    if (window.ysdkPlayer) {
        try {
            let cloudData = await window.ysdkPlayer.getData(['izbavlenieSave']);
            if (cloudData && cloudData.izbavlenieSave) {
                data = cloudData.izbavlenieSave;
                console.log("[ЯНДЕКС] Сохранение успешно загружено из облака.");
            }
        } catch (e) {
            console.warn("[ЯНДЕКС] Не удалось получить данные из облака:", e);
        }
    }

    if (!data) {
        const saved = localStorage.getItem('izbavlenieSave');
        if (saved) {
            try { 
                data = JSON.parse(saved); 
                console.log("[ЛОКАЛЬНО] Сохранение загружено из localStorage.");
            } catch(e) {}
        }
    }

    if (data && data.isSetupComplete) {
        try {
            let pName = document.getElementById('profile-player-name');
            if(pName) pName.innerText = data.playerName || "Иземберт";
            
            playerAvatar = data.playerAvatar || 'av_mage';
            
            playerGold = Number(data.playerGold) || 0;
            playerDiamonds = Number(data.playerDiamonds) || 0;
            playerBankDiamonds = Number(data.playerBankDiamonds) || 0; 
            
            selectedClass = data.selectedClass || "Защитник";
            if (typeof ClassDictionary !== 'undefined' && !ClassDictionary[selectedClass]) selectedClass = "Защитник";

            baseStats = { ...baseStats, ...(data.baseStats || {}) };
            shieldProgress = Number(data.shieldProgress) || 0;
            
            playerInventory = data.playerInventory || { equip: [], consumables: {} };
            if (!playerInventory.consumables) playerInventory.consumables = {};
            if (!playerInventory.equip || !Array.isArray(playerInventory.equip)) playerInventory.equip = [];
            
            playerEquipped = data.playerEquipped || { head: null, body: null, weapon: null, ring: null, amulet: null, feet: null };
            if (playerEquipped.feet === undefined) playerEquipped.feet = null;
            
            playerLevel = Number(data.playerLevel) || 1;
            playerXp = Number(data.playerXp) || 0;

            arenaUnlocked = data.arenaUnlocked || false;
            arenaGhostIntroDone = data.arenaGhostIntroDone || false;
            etherealFlowers = typeof data.etherealFlowers !== 'undefined' ? Number(data.etherealFlowers) : 5;
            arenaPoints = Number(data.arenaPoints) || 0;
            
            lastFlowerRegenTime = data.lastFlowerRegenTime || Date.now();
            let now = Date.now();
            let hoursPassed = Math.floor((now - lastFlowerRegenTime) / (1000 * 60 * 60 * 3));
            if (hoursPassed > 0 && etherealFlowers < 5) {
                etherealFlowers = Math.min(5, etherealFlowers + hoursPassed);
                lastFlowerRegenTime += hoursPassed * (1000 * 60 * 60 * 3);
            }
            if (etherealFlowers >= 5) lastFlowerRegenTime = Date.now();
            
            roadsUnlocked = data.roadsUnlocked || false;
            roadsIntroDone = data.roadsIntroDone || false;
            roadsCurrentPeriod = data.roadsCurrentPeriod || "";
            roadsAvailable = data.roadsAvailable || [];
            activeRoadJourney = data.activeRoadJourney || null;
            
            playerWood = Number(data.playerWood) || 0;
            playerStone = Number(data.playerStone) || 0;
            skinsGivenToElder = Number(data.skinsGivenToElder) || 0;

            magicLevel = Number(data.magicLevel) || 1;
            magicXp = Number(data.magicXp) || 0;
            
            playerRighteousness = Number(data.playerRighteousness) || 0;
            playerApostasy = Number(data.playerApostasy) || 0;
            firstSkinHandled = data.firstSkinHandled || false;
            playerPiercing = Number(data.playerPiercing) || 0;

            spellLevels = data.spellLevels || {
                'base': 1, 'shield': 1, 'constanta': 1, 'heal': 1, 'stun_undead': 1,
                'firestorm': 1, 'anti_undead': 1, 'blind': 1, 'mind_control': 1,
                'spirit': 1, 'release': 1
            };

            spellBooksRead = data.spellBooksRead || {
                'base': 0, 'shield': 0, 'constanta': 0, 'heal': 0, 'stun_undead': 0,
                'firestorm': 0, 'anti_undead': 0, 'blind': 0, 'mind_control': 0,
                'spirit': 0, 'release': 0
            };

            equipLevels = data.equipLevels || {};
            unlockedEquip = data.unlockedEquip || [];

            elitePhaseActive = data.elitePhaseActive || false;
            currentEliteBossIndex = Number(data.currentEliteBossIndex) || 0;
            weakUndeadKilled = Number(data.weakUndeadKilled) || 0;

            if (data.quests) quests = data.quests; 

            banditDefeated = data.banditDefeated || false;
            banditKilled = data.banditKilled || false;
            townHallIntroDone = data.townHallIntroDone || false;
            undeadIntroLost = data.undeadIntroLost || false;
            playerHasLibrarySpell = data.playerHasLibrarySpell || false;
            librarySpellUpgraded = data.librarySpellUpgraded || false;
            isChangingClass = data.isChangingClass || false;
            midlockLocked = data.midlockLocked || false;
            authRewardClaimed = data.authRewardClaimed || false;
            
            elderInterruptedElite = data.elderInterruptedElite || false;
            beastHuntingUnlocked = data.beastHuntingUnlocked || false;
            townHallRebuilt = data.townHallRebuilt || false;

            midlockIntroDone = data.midlockIntroDone || false;
            midlockSpiritDefeated = data.midlockSpiritDefeated || false; // ЗАГРУЗКА НОВОГО ФЛАГА
            girlEncounterDone = data.girlEncounterDone || false;         // ЗАГРУЗКА НОВОГО ФЛАГА

            necromancerUnlocked = data.necromancerUnlocked || false;
            necromancerIntroDone = data.necromancerIntroDone || false;
            isEndingPhase = data.isEndingPhase || false;

            let pClass = document.getElementById('profile-player-class');
            if(pClass) pClass.innerText = selectedClass;
            
            if (typeof applyClassStats === 'function') applyClassStats(); 

            if (banditDefeated) {
                let dLock = document.getElementById('domain-locked'); if(dLock) dLock.style.display = 'none';
                let dUnl = document.getElementById('domain-unlocked'); if(dUnl) dUnl.style.display = 'block';
            } else {
                let dLock = document.getElementById('domain-locked'); if(dLock) dLock.style.display = 'block';
                let dUnl = document.getElementById('domain-unlocked'); if(dUnl) dUnl.style.display = 'none';
            }

            if (typeof updateResourceUI === 'function') updateResourceUI();
            if (typeof updateStatsUI === 'function') updateStatsUI();
            if (typeof updateMainCards === 'function') updateMainCards(); 
            
            let screens = ['menu-container', 'story-container', 'final-screen', 'name-screen', 'class-screen'];
            screens.forEach(id => { let el = document.getElementById(id); if(el) el.style.display = 'none'; });
            
            let hub = document.getElementById('game-hub');
            if(hub) { hub.style.display = 'flex'; hub.style.opacity = '1'; }
            
            if (typeof switchTab === 'function') switchTab('main', document.getElementById('nav-btn-main'));
            return true;
        } catch (e) {
            console.error("Ошибка при разборе сохранения:", e);
            return false;
        }
    }
    return false;
}

function resetProgress() {
    if (confirm("Вы уверены, что хотите сбросить весь прогресс? Это действие необратимо!")) {
        localStorage.removeItem('izbavlenieSave');
        if (window.ysdkPlayer) {
            window.ysdkPlayer.setData({ 'izbavlenieSave': null }).then(() => { location.reload(); });
        } else { location.reload(); }
    }
}