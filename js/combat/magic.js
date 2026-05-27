// ==========================================
// КНИГА ЗАКЛИНАНИЙ (js/combat/magic.js)
// Логика работы магии, стоимость и отрисовка рун
// ==========================================

function getSpellManaCost(spellId) {
    if (spellId === 'dev_kill') return 0; 
    const epics = ['constanta', 'stun_undead', 'anti_undead', 'mind_control', 'release'];
    const rares = ['shield', 'heal', 'firestorm', 'blind', 'spirit'];
    if (epics.includes(spellId)) return 85;
    if (rares.includes(spellId)) return 45;
    return 15; 
}

function renderBattleSpells() {
    try {
        const container = document.getElementById('battle-spells-container');
        if(!container) return;
        
        let currentClass = typeof selectedClass !== 'undefined' ? selectedClass : "Защитник";
        
        let cSpells = [];
        if (typeof ClassDictionary !== 'undefined' && ClassDictionary[currentClass] && ClassDictionary[currentClass].spells) {
            cSpells = ClassDictionary[currentClass].spells;
        }
        
        if (cSpells.length === 0) return;
        
        let html = '';
        let wClass = (typeof playerHasLibrarySpell !== 'undefined' && playerHasLibrarySpell) ? '30%' : '45%';

        function buildRune(spell, borderColor) {
            if (!spell) return '';
            let cost = getSpellManaCost(spell.id);
            let imgHtml = spell.icon ? `<img src="${spell.icon}" class="icon-no-frame" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><div style="display: none;">${spell.emoji}</div>` : spell.emoji;
            let nameStr = spell.name ? spell.name.substring(2) : "Заклинание";

            return `
            <div class="battle-rune" data-spell-id="${spell.id}" onclick="castSpell('${spell.id}')" style="width: ${wClass}; transition: all 0.2s ease; cursor: pointer;">
                <div style="width: 48px; height: 48px; margin: 0 auto 8px auto; border-radius: 6px; overflow: hidden; border: 2px solid ${borderColor}; background: #000; display: flex; justify-content: center; align-items: center; font-size: 2rem;">
                    ${imgHtml}
                </div>
                <div style="color: ${borderColor === '#d4af37' ? '#d4af37' : '#e0f7fa'}; font-weight: bold; font-size: 0.8rem; line-height:1.1; text-align: center;">
                    ${nameStr}
                </div>
                <div style="color:#aaa; font-size: 0.7rem; margin-top: 5px; background: rgba(0,0,0,0.5); padding: 3px 0; border-radius: 4px; text-align: center;">
                    Мана: ${cost}%
                </div>
            </div>`;
        }

        if (cSpells[0]) html += buildRune(cSpells[0], '#5a6e9c');
        if (cSpells[1]) html += buildRune(cSpells[1], '#00ffcc');
        if (typeof playerHasLibrarySpell !== 'undefined' && playerHasLibrarySpell && cSpells[2]) {
            html += buildRune(cSpells[2], '#d4af37');
        }
        
        html += `
        <div class="battle-rune dev-kill-btn" data-spell-id="dev_kill" onclick="castSpell('dev_kill')" style="width: 100%; margin-top: 15px; border: 1px solid #ff0000; background: rgba(255,0,0,0.1); padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;">
            <div style="color: #ff4d4d; font-weight: bold; font-size: 0.9rem; text-align: center; text-transform: uppercase; letter-spacing: 1px;">☠️ Убить врага (Dev)</div>
        </div>`;

        container.innerHTML = html;
    } catch (e) {
        console.error("Ошибка рендера заклинаний:", e);
    }
}

function castSpell(spellId) {
    try {
        let reqMana = getSpellManaCost(spellId);
        
        if (spellId !== 'dev_kill' && (!battleState.active || Date.now() < battleState.spellCooldown)) return; 
        if (spellId !== 'dev_kill' && battleState.mana < reqMana) return; 

        let armorStats = typeof getTotalArmor === 'function' ? getTotalArmor() : { extraDmg: 0 };
        let baseDmg = 100 + (Number(armorStats.extraDmg) || 0);
        
        let safeMagicLvl = typeof magicLevel !== 'undefined' ? (magicLevel || 1) : 1;
        let magicMultiplier = 1 + ((safeMagicLvl - 1) * 0.05); 
        let setMultiplier = (typeof isFullSetEquipped === 'function' && isFullSetEquipped(selectedClass)) ? 1.1 : 1.0;
        
        let sLvl = (typeof spellLevels !== 'undefined' && spellLevels && spellLevels[spellId]) ? spellLevels[spellId] : 1;
        let spellMultiplier = 1 + ((sLvl - 1) * 0.20); 
        
        let pieceBonus = 1.0;
        if (spellId === 'base') {
            let piecesCount = typeof getSetPiecesCount === 'function' ? getSetPiecesCount(selectedClass) : 0;
            if (typeof piecesCount === 'number') {
                pieceBonus = 1 + (piecesCount * 0.02);
            }
        }
        
        let rawMana = Number(battleState.mana) || 0;
        let damage = Math.floor(baseDmg * (rawMana / 100) * magicMultiplier * setMultiplier * spellMultiplier * pieceBonus);
        if (isNaN(damage)) damage = 0; 

        // === ПРОВЕРКА ДЕБАФФОВ ИГРОКА (От Арены) ===
        if (battleState.playerBlindTurns > 0 && spellId !== 'dev_kill' && spellId !== 'heal' && spellId !== 'shield' && spellId !== 'constanta' && spellId !== 'spirit') {
            battleState.playerBlindTurns--;
            if (typeof logBattle === 'function') logBattle(`👁️ Вы ослеплены! Магия ушла в молоко.`, '#ccc');
            battleState.mana = 0; 
            battleState.spellCooldown = Date.now() + 1000; 
            if (typeof updateBattleUI === 'function') updateBattleUI(); 
            return;
        }

        if (battleState.playerMindControlTurns > 0 && spellId !== 'dev_kill' && spellId !== 'heal' && spellId !== 'shield' && spellId !== 'constanta' && spellId !== 'spirit') {
            battleState.playerMindControlTurns--;
            let selfDmg = damage;
            if (spellId === 'firestorm') selfDmg = Math.floor(selfDmg * (2.0 + Math.min(0.65, sLvl * 0.02)));
            if (spellId === 'anti_undead') selfDmg = Math.floor(selfDmg * (4.0 + Math.min(0.65, sLvl * 0.02)));
            
            battleState.playerHp -= selfDmg;
            if (typeof logBattle === 'function') logBattle(`🎭 Ваш разум под контролем! Вы бьете себя на <b style="color:#ff4d4d;">${selfDmg}</b> урона!`, '#ff4d4d');
            battleState.mana = 0; 
            battleState.spellCooldown = Date.now() + 1000; 
            if (typeof updateBattleUI === 'function') updateBattleUI(); 
            if (typeof checkBattleEnd === 'function') checkBattleEnd();
            return;
        }

        let isEthereal = (battleState.enemyType === 'spirit' && battleState.etherealTurns > 0);
        if (isEthereal && spellId !== 'dev_kill' && ['base', 'stun_undead', 'firestorm', 'anti_undead', 'release'].includes(spellId)) {
            damage = 0;
            if (typeof logBattle === 'function') logBattle(`💨 Магия проходит сквозь бесплотного духа, не причиняя вреда!`, '#88a3d6');
        }

        // === ПРИМЕНЕНИЕ ЗАЩИТЫ БОТА АРЕНЫ ===
        let constantaTriggered = false;
        if (damage > 0 && battleState.enemyType === 'arena' && spellId !== 'dev_kill') {
            if (battleState.botConstantActive) {
                damage = 1;
                battleState.botConstantActive = false;
                constantaTriggered = true;
                if (typeof logBattle === 'function') logBattle(`🌌 Константа фантома сводит ваш урон к 1!`, '#d4af37');
            } else {
                if (battleState.botShieldTurns > 0) {
                    damage = Math.floor(damage * 0.5);
                    battleState.botShieldTurns--;
                    if (typeof logBattle === 'function') logBattle(`🛡️ Барьер фантома поглотил половину урона!`, '#00b3ff');
                }
                if (battleState.botSpiritActive) {
                    let absorbed = Math.floor(damage * 0.3);
                    battleState.botSpiritAbsorbed = (battleState.botSpiritAbsorbed || 0) + absorbed;
                    damage -= absorbed;
                    if (typeof logBattle === 'function') logBattle(`🐺 Дух фантома впитывает ${absorbed} урона!`, '#88a3d6');
                }
            }
        }

        switch(spellId) {
            case 'dev_kill':
                battleState.enemyHp = 0; 
                if (typeof logBattle === 'function') logBattle(`☠️ <b>ПЕРСТ СМЕРТИ (Dev)</b>! Тьма поглощает врага мгновенно.`, '#ff4d4d'); 
                break;

            case 'base':
                if (damage > 0 || constantaTriggered || !isEthereal) {
                    battleState.enemyHp -= damage; 
                    if (typeof logBattle === 'function') logBattle(`💥 <b>Магический удар</b>! Нанесено <b style="color:#ffcc00;">${damage}</b> урона.`, '#fff');
                }
                break;
            
            case 'shield':
                battleState.shieldArmorBonus = sLvl * 0.02; 
                let duration = (8000 * (rawMana / 100)) * magicMultiplier * setMultiplier * spellMultiplier; 
                battleState.shieldEndTime = Date.now() + duration; 
                if (typeof logBattle === 'function') logBattle(`🔮 <b>Элементарный щит</b> на ${(duration/1000).toFixed(1)} сек! Броня усилена.`, '#00ffcc'); 
                break;
            
            case 'constanta':
                let cSuccess = true;
                if (battleState.enemyType === 'elite' || battleState.enemyType === 'spirit' || battleState.enemyType === 'arena') {
                    let chance = 0.15 + ((sLvl - 1) * 0.05);
                    if (chance > 0.50) chance = 0.50;
                    if (Math.random() > chance) { cSuccess = false; }
                }
                if (cSuccess) {
                    battleState.constantActive = true; 
                    if (typeof logBattle === 'function') logBattle(`🌌 Активирована <b>Константа</b>! Урон следующей атаки сведен к 1.`, '#d4af37'); 
                } else {
                    if (typeof logBattle === 'function') logBattle(`🌌 <b>Константа</b> не выдержала мощи врага и развеялась!`, '#ff4d4d'); 
                }
                break;
            
            case 'heal':
                let healPct = 0.40 + (sLvl * 0.02);
                if (healPct > 0.65) healPct = 0.65;
                let healAmt = Math.floor(battleState.playerMaxHp * healPct * (rawMana / 100) * magicMultiplier * setMultiplier * spellMultiplier);
                if (isNaN(healAmt)) healAmt = 0;
                battleState.playerHp = Math.min(battleState.playerMaxHp, battleState.playerHp + healAmt); 
                if (typeof logBattle === 'function') logBattle(`🌿 Восстановлено <b style="color:#00ff00;">${healAmt}</b> ХП.`, '#00ff00'); 
                break;
            
            case 'stun_undead':
                if (damage > 0 || constantaTriggered || !isEthereal) {
                    if (battleState.enemyType === 'undead' || battleState.enemyType === 'elite' || battleState.enemyType === 'spirit') { 
                        battleState.enemyStunTurns = 2; 
                        battleState.attackCount = 0;
                        battleState.nextHitIsCrit = false;
                        
                        let extraDmg = Math.floor(damage * (sLvl * 0.02));
                        battleState.enemyHp -= extraDmg;
                        if (typeof logBattle === 'function') logBattle(`✨ <b>Изгнание</b>! Враг оглушен. Нанесено <b style="color:#ffff00;">${extraDmg}</b> доп. урона!`, '#ffff00'); 
                    } else { 
                        if (typeof logBattle === 'function') logBattle(`✨ Изгнание не подействовало.`, '#88a3d6'); 
                    }
                }
                break;
            
            case 'firestorm':
                if (damage > 0 || constantaTriggered || !isEthereal) {
                    let fsMult = 2.0 + Math.min(0.65, sLvl * 0.02);
                    damage = Math.floor(damage * fsMult); 
                    battleState.enemyHp -= damage; 
                    if (typeof logBattle === 'function') logBattle(`🔥 <b>Буря огня</b>! Нанесено <b style="color:#ff6600;">${damage}</b> урона.`, '#ff6600');
                }
                break;
            
            case 'anti_undead':
                if (damage > 0 || constantaTriggered || !isEthereal) {
                    if (battleState.enemyType === 'undead' || battleState.enemyType === 'elite' || battleState.enemyType === 'spirit') { 
                        let auMult = 4.0 + Math.min(0.65, sLvl * 0.02);
                        let auDmg = Math.floor(damage * auMult);
                        if (typeof logBattle === 'function') logBattle(`☄️ Свергающий огонь испепеляет врага на <b style="color:#ff0000;">${auDmg}</b>!`, '#ff0000'); 
                        battleState.enemyHp -= auDmg;
                    } else { 
                        if (typeof logBattle === 'function') logBattle(`☄️ Свергающий огонь наносит <b style="color:#ff6600;">${damage}</b>.`, '#ff6600'); 
                        battleState.enemyHp -= damage; 
                    }
                }
                break;
            
            case 'blind':
                battleState.enemyBlindTurns = 1; 
                let reduction = 5 + (sLvl * 5); 
                let oldDmg = battleState.enemyDmg;
                battleState.enemyDmg = Math.floor(battleState.enemyDmg * (1 - reduction/100));
                if (battleState.enemyDmg < 1) battleState.enemyDmg = 1; 
                if (typeof logBattle === 'function') logBattle(`👁️ <b>Ослепление</b>! Враг мажет, его мощь истощена с ${oldDmg} до <b style="color:#ffcc00;">${battleState.enemyDmg}</b>!`, '#ccc'); 
                break;
            
            case 'mind_control':
                let canControl = true;
                let reqLvl = 1;
                let lsu = typeof librarySpellUpgraded !== 'undefined' && librarySpellUpgraded;

                if (battleState.enemyType === 'elite') {
                    let cBossIdx = typeof currentEliteBossIndex !== 'undefined' ? currentEliteBossIndex : 0;
                    if (cBossIdx === 0) reqLvl = 2; 
                    else if (cBossIdx === 1) reqLvl = 3; 
                    else if (cBossIdx === 2) reqLvl = 4; 
                    else if (cBossIdx === 3) reqLvl = 5; 
                    else if (cBossIdx >= 4) reqLvl = 6;  
                    if (sLvl < reqLvl && !lsu) canControl = false;
                } else if (battleState.enemyType === 'spirit' || battleState.enemyType === 'arena') {
                    reqLvl = 3; 
                    if (sLvl < reqLvl && !lsu) canControl = false;
                }

                if (!canControl) {
                    if (typeof logBattle === 'function') logBattle(`🎭 <b>Контроль сознания</b> провалился! Воля врага слишком сильна (Требуется Ур. ${reqLvl} или Тайный трактат).`, '#ff4d4d');
                } else {
                    battleState.mindControlActive = true; 
                    if (typeof logBattle === 'function') logBattle(`🎭 <b>Контроль сознания</b>! Разум врага захвачен.`, '#d4af37'); 
                }
                break;
            
            case 'spirit':
                battleState.spiritAbsorbPct = Math.min(0.50, 0.30 + (sLvl * 0.02));
                battleState.spiritActive = true; 
                if (typeof logBattle === 'function') logBattle(`🐺 Призван защитный дух!`, '#88a3d6'); 
                break;
            
            case 'release':
                if (damage > 0 || constantaTriggered || !isEthereal) {
                    let relDmg = Number(battleState.spiritAbsorbed) || 0;
                    let relBonusMult = Math.min(0.30, sLvl * 0.02);
                    relDmg = Math.floor(relDmg * setMultiplier * spellMultiplier * (1.0 + relBonusMult));
                    
                    if (relDmg > 0) { 
                        battleState.enemyHp -= relDmg; 
                        battleState.attackCount = 0; 
                        battleState.nextHitIsCrit = false; 
                        if (typeof logBattle === 'function') logBattle(`🌪️ Дух обрушивает <b style="color:#ffcc00;">${relDmg}</b> урона, сбивая врага с ног!`, '#ffcc00'); 
                        battleState.spiritAbsorbed = 0; 
                        battleState.spiritActive = false; 
                    } else { 
                        if (typeof logBattle === 'function') logBattle(`🌪️ Дух еще не впитал урон!`, '#88a3d6'); 
                    } 
                }
                break;
        }
        
        if (spellId !== 'dev_kill') {
            battleState.mana = 0; 
            battleState.spellCooldown = Date.now() + 1000; 
        }
        
        if (typeof updateBattleUI === 'function') updateBattleUI(); 
        if (typeof checkBattleEnd === 'function') checkBattleEnd();
        
    } catch(e) { console.error("Ошибка каста:", e); }
}