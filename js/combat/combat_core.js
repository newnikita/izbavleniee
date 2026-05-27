// ==========================================
// ДВИЖОК АРЕНЫ И БОЯ (js/combat/combat_core.js)
// Запуск боя, таймеры, обновление UI и финал
// ==========================================

window.logBattle = function(text, color = '#b0b0b0') {
    const log = document.getElementById('battle-log');
    if (!log) return;
    const entry = document.createElement('div');
    entry.style.color = color;
    entry.style.padding = '8px 0';
    entry.style.borderBottom = '1px dashed rgba(63, 59, 99, 0.4)';
    entry.style.lineHeight = '1.4';
    entry.innerHTML = text;
    log.prepend(entry);
};

function stopCombatIntervals() {
    try {
        if (typeof combatIntervals !== 'undefined' && Array.isArray(combatIntervals)) {
            combatIntervals.forEach(clearInterval);
            combatIntervals.length = 0; 
        }
    } catch (e) {
        console.error("Ошибка при остановке таймеров:", e);
    }
}

function startBattle(enemyType) {
    try {
        stopCombatIntervals();
    } catch(e) {}

    try {
        if (enemyType === 'bandit' && typeof banditDefeated !== 'undefined' && banditDefeated) { 
            if (typeof showLootAlert === 'function') showLootAlert("Вы уже победили этого врага. Путь свободен."); 
            return; 
        }

        if (enemyType === 'undead' && typeof townHallIntroDone !== 'undefined' && !townHallIntroDone) { 
            if (typeof showLootAlert === 'function') showLootAlert("Сначала посетите Разоренную деревню и поговорите со старостой."); 
            return; 
        }

        if (enemyType === 'elite' && typeof elderInterruptedElite !== 'undefined' && !elderInterruptedElite) {
            elderInterruptedElite = true;
            if (typeof saveGame === 'function') saveGame();
            if (typeof startElderInterruptDialogue === 'function') startElderInterruptDialogue();
            return;
        }

        try {
            if (typeof applyClassStats === 'function') applyClassStats(); 
        } catch(e) { console.warn("Ошибка в applyClassStats:", e); }

        let armorStats = typeof getTotalArmor === 'function' ? getTotalArmor() : { extraHp: 0, extraDmg: 0 };

        battleState.active = true;
        battleState.mana = 0;
        
        let safeHp = (typeof baseStats !== 'undefined' && baseStats.hp) ? Number(baseStats.hp) : 500;
        let safeExtraHp = Number(armorStats.extraHp) || 0;
        battleState.playerMaxHp = safeHp + safeExtraHp;
        battleState.playerHp = battleState.playerMaxHp;
        
        battleState.shieldEndTime = 0; 
        battleState.spellCooldown = 0; 
        battleState.attackCount = 0;
        battleState.nextHitIsCrit = false; 
        battleState.constantActive = false;
        battleState.enemyStunTurns = 0; 
        battleState.enemyBlindTurns = 0;
        battleState.mindControlActive = false; 
        battleState.spiritActive = false; 
        battleState.spiritAbsorbed = 0;
        battleState.playerExhausted = false; 
        battleState.enemyType = enemyType;
        battleState.etherealTurns = 0; 
        battleState.shieldArmorBonus = 0;
        battleState.spiritAbsorbPct = 0.30;

        battleState.playerBlindTurns = 0;
        battleState.playerMindControlTurns = 0;
        battleState.roadEnemyAbility = "none";
        
        // СБРОС НОВЫХ ФЛАГОВ ДЛЯ ДЕВУШКИ
        battleState.girlDmgMult = 1.0;
        battleState.playerBurnTurns = 0;

        let eName = "Враг", eHp = 100, eDmg = 10, eIcon = "", eFallback = "👹";

        if (enemyType === 'girl') {
            eName = 'Незнакомка в доспехах'; eHp = 15000; eDmg = 150; 
            eIcon = 'icons/girl_knight.png'; eFallback = '🤺';
        } else if (enemyType === 'road') {
            let rId = (typeof activeRoadJourney !== 'undefined' && activeRoadJourney) ? activeRoadJourney.roadId : 'darkness';
            let rLvl = (typeof activeRoadJourney !== 'undefined' && activeRoadJourney) ? activeRoadJourney.recLevel : 5;
            let enList = (typeof roadEnemiesDB !== 'undefined') ? roadEnemiesDB : [{name: "Тень", hp: 1000, dmg: 50, icon: "", emoji: "👻", ability: "none"}];
            let enObj = enList[Math.floor(Math.random() * enList.length)];
            
            eName = enObj.name + " (" + rLvl + " ур.)"; 
            eHp = enObj.hp + (rLvl * 80); 
            eDmg = enObj.dmg + (rLvl * 12); 
            eIcon = enObj.icon; 
            eFallback = enObj.emoji;
            battleState.roadEnemyAbility = enObj.ability;
            if (enObj.ability === 'exhaustion') battleState.playerExhausted = true;
            
        } else if (enemyType === 'arena') {
            let lIdx = 0;
            if (typeof arenaLeagues !== 'undefined' && typeof arenaPoints !== 'undefined') {
                for (let i = 0; i < arenaLeagues.length; i++) {
                    if (arenaPoints >= arenaLeagues[i].reqPoints) lIdx = i;
                }
            }
            
            let randomClass = "Защитник";
            let cData = { icon: "🛡️", spells: [] };
            if (typeof ClassDictionary !== 'undefined') {
                const classNames = Object.keys(ClassDictionary);
                randomClass = classNames[Math.floor(Math.random() * classNames.length)];
                cData = ClassDictionary[randomClass];
            }
            
            let bot = (typeof pvpBots !== 'undefined' && pvpBots[lIdx]) ? pvpBots[lIdx] : { name: "Фантом", hp: 1200, dmg: 100, pierce: 0, spellChance: 0.1, rewardPoints: 10, rewardGold: 50 };
            
            eName = bot.name + " (" + randomClass + ")"; 
            eHp = bot.hp; 
            eDmg = bot.dmg; 
            eIcon = 'icons/av_paladin.png'; 
            eFallback = cData.icon || '👤';
            
            battleState.botClass = randomClass;
            battleState.botPierce = bot.pierce;
            battleState.botSpellChance = bot.spellChance + (lIdx * 0.05); 
            battleState.botRewardPoints = bot.rewardPoints;
            battleState.botRewardGold = bot.rewardGold;
            
            let numSpells = 1;
            if (lIdx === 1) numSpells = 2;
            if (lIdx >= 2) numSpells = 3;
            
            let botSpells = [];
            for (let i = 0; i < numSpells; i++) {
                if (cData.spells && cData.spells[i]) botSpells.push(cData.spells[i].id);
            }
            battleState.botSpells = botSpells;

            battleState.botShieldTurns = 0;
            battleState.botConstantActive = false;
            battleState.botSpiritActive = false;
            battleState.botSpiritAbsorbed = 0;
            
        } else if (enemyType === 'bandit') {
            eName = 'Маг-бандит'; eHp = 200; eDmg = 100; eIcon = 'icons/mage.png'; eFallback = '🥷';
        } else if (enemyType === 'undead') {
            eName = 'Слабый мертвец'; eHp = 1000; eDmg = 80; eIcon = 'icons/enemy_undead.png'; eFallback = '🧟';
        } else if (enemyType === 'spirit') {
            eName = 'Тщедушный дух'; eHp = 2500; eDmg = 120; 
            eIcon = 'icons/spirit_weak.png'; 
            eFallback = '👻';
        } else if (enemyType === 'beast') {
            let b = typeof getCurrentBeast === 'function' ? getCurrentBeast() : { name: "Зверь", hp: 100, dmg: 10, icon: "", emoji: "🐺" };
            eName = b.name; eHp = b.hp; eDmg = b.dmg; eIcon = b.icon; eFallback = b.emoji;
        } else if (enemyType === 'elite') {
            let idx = typeof currentEliteBossIndex !== 'undefined' ? currentEliteBossIndex : 0;
            if(typeof eliteUndead !== 'undefined' && eliteUndead[idx]) {
                let boss = eliteUndead[idx];
                eName = boss.name; eHp = boss.hp; eDmg = boss.dmg; eIcon = boss.icon; eFallback = boss.emoji;
                if (boss.id !== 'boss_healer' && boss.id !== 'boss_necromancer') battleState.playerExhausted = true;
            }
        }

        let pLvl = typeof playerLevel !== 'undefined' ? (playerLevel || 1) : 1;
        if (enemyType === 'beast') {
            eHp = Math.floor(eHp * (1 + (pLvl - 1) * 0.40));
            eDmg = Math.floor(eDmg * (1 + (pLvl - 1) * 0.15));
        }

        battleState.enemyHp = Number(eHp) || 1000; 
        battleState.enemyMaxHp = battleState.enemyHp;
        battleState.enemyDmg = Number(eDmg) || 10;

        let pNameEl = document.getElementById('profile-player-name');
        let bPlayerName = document.getElementById('battle-player-name');
        if(bPlayerName) bPlayerName.innerText = pNameEl ? pNameEl.innerText : "Герой";
        
        let bEnemyName = document.getElementById('battle-enemy-name');
        if(bEnemyName) bEnemyName.innerText = eName;
        
        let iconContainer = document.getElementById('battle-enemy-icon-container');
        if(iconContainer) {
            iconContainer.innerHTML = `<img src="${eIcon}" class="icon-no-frame" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><div style="display: none;">${eFallback}</div>`;
            if (enemyType === 'arena') iconContainer.style.borderColor = '#00ffcc'; 
            else if (enemyType === 'road') iconContainer.style.borderColor = '#d4af37';
            else if (enemyType === 'girl') iconContainer.style.borderColor = '#ffcccc';
            else iconContainer.style.borderColor = '#ff4d4d';
        }

        let pIconEl = document.getElementById('battle-player-icon');
        if(pIconEl) { 
            let avFile = (typeof getCurrentAvatarFile === 'function') ? getCurrentAvatarFile() : 'icons/av_mage.png';
            pIconEl.innerHTML = `<img src="${avFile}" class="icon-no-frame" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`; 
            pIconEl.style.borderColor = '#00b3ff'; 
        }

        let logElement = document.getElementById('battle-log');
        if(logElement) {
            let logMsg = '';
            let st = 'padding: 8px 0; border-bottom: 1px dashed rgba(63, 59, 99, 0.4); line-height: 1.4;';
            if (battleState.playerExhausted) {
                logMsg += '<div style="color: #cc00cc; font-weight:bold; ' + st + '">⚠️ Враг наложил ИСТОЩЕНИЕ! Приток маны замедлен.</div>';
            }
            if (enemyType === 'arena') logMsg += '<div style="color: #00ffcc; font-weight:bold; ' + st + '">⚔️ БОЙ НА АРЕНЕ! Противник иллюзорен, но его мощь реальна.</div>';
            else if (enemyType === 'road') logMsg += '<div style="color: #d4af37; font-weight:bold; ' + st + '">⚔️ БОЙ НА ДОРОГЕ! Впереди неизведанная угроза.</div>';
            else if (enemyType === 'girl') logMsg += '<div style="color: #ff0000; font-weight:bold; ' + st + '">🔥 АУРА СЖИГАНИЯ МАНЫ! Ваш магический резерв постоянно тает!</div>';
            else logMsg += '<div style="color: #e0f7fa; ' + st + '">⚔️ Бой начался! Мана накапливается.</div>';
            logElement.innerHTML = logMsg;
        }
        
        let shieldTimerEl = document.getElementById('battle-shield-timer');
        if(shieldTimerEl) shieldTimerEl.style.display = 'none';

        try {
            if (typeof renderBattleSpells === 'function') renderBattleSpells(); 
            updateBattleUI();
        } catch(e) { console.error("Ошибка при первичном обновлении UI:", e); }

        let bNav = document.querySelector('.bottom-nav');
        if(bNav) bNav.style.display = 'none';
        if (typeof openSubTab === 'function') openSubTab('tab-battle');

        let manaTimer = setInterval(() => {
            try {
                if (!battleState.active) return;
                
                let manaRegen = battleState.playerExhausted ? 1.5 : 3.33;
                
                // === СЖИГАНИЕ МАНЫ (БОСС: ДЕВУШКА) ===
                if (battleState.enemyType === 'girl') {
                    manaRegen -= 4.5; // Мощный дебафф, уводящий регенерацию в минус
                }
                
                if (typeof playerEquipped !== 'undefined' && playerEquipped && playerEquipped.amulet === 'amulet_absorb') {
                    let aLvl = (typeof equipLevels !== 'undefined' && equipLevels['amulet_absorb']) ? equipLevels['amulet_absorb'] : 1;
                    let bonusPct = Math.min(5, (aLvl - 1) * 1); 
                    manaRegen = manaRegen * (1 + (bonusPct / 100)); 
                }

                if (battleState.mana < 100) { 
                    battleState.mana = Math.max(0, Math.min(100, battleState.mana + manaRegen)); 
                }
                
                let timeLeft = (battleState.shieldEndTime - Date.now()) / 1000;
                let sTimer = document.getElementById('battle-shield-timer');
                if(sTimer) {
                    if (timeLeft > 0) {
                        sTimer.style.display = 'inline-block';
                        sTimer.innerText = `🛡️ ${timeLeft.toFixed(1)}с`;
                    } else { 
                        sTimer.style.display = 'none'; 
                    }
                }

                let isCooldown = Date.now() < battleState.spellCooldown;
                document.querySelectorAll('.battle-rune').forEach(rune => {
                    if (isCooldown && rune.getAttribute('data-spell-id') !== 'dev_kill') {
                        rune.classList.add('cooldown'); 
                    } else { 
                        rune.classList.remove('cooldown'); 
                    }
                });
                
                updateBattleUI();
            } catch(e) { console.error("ManaTimer Error:", e); }
        }, 100);

        let enemyAttackTimer = setInterval(() => {
            try {
                if (!battleState.active) return;
                
                if (battleState.enemyStunTurns > 0) { 
                    battleState.enemyStunTurns--; 
                    if (typeof logBattle === 'function') logBattle(`✨ Враг оглушен и пропускает ход!`, '#ffff00'); 
                    return; 
                }

                let baseDamage = Number(battleState.enemyDmg) || 0;

                // === ЛОГИКА ДЕВУШКИ (СКАЛИРОВАНИЕ И ОЖОГ) ===
                if (battleState.enemyType === 'girl') {
                    battleState.girlDmgMult += 0.05;
                    baseDamage = Math.floor(baseDamage * battleState.girlDmgMult);
                    battleState.playerBurnTurns = 2; 
                    if (typeof logBattle === 'function') logBattle(`🔥 Меч Незнакомки оставляет <b>ожоги</b>! Ее атаки становятся все сильнее!`, '#ff6600');
                }

                if (battleState.enemyType === 'arena' && battleState.botSpells && battleState.botSpells.length > 0) {
                    if (Math.random() < battleState.botSpellChance) {
                        let bSpell = battleState.botSpells[Math.floor(Math.random() * battleState.botSpells.length)];
                        
                        let spellName = bSpell;
                        if (typeof ClassDictionary !== 'undefined' && ClassDictionary[battleState.botClass]) {
                            let sp = ClassDictionary[battleState.botClass].spells.find(s => s.id === bSpell);
                            if (sp) spellName = sp.name;
                        }

                        if (typeof logBattle === 'function') logBattle(`🎇 Фантом кастует <b>${spellName}</b>!`, '#ff6600');

                        if (bSpell === 'heal' && battleState.enemyHp < battleState.enemyMaxHp) {
                            let hAmt = Math.floor(battleState.enemyMaxHp * 0.15);
                            battleState.enemyHp = Math.min(battleState.enemyMaxHp, battleState.enemyHp + hAmt);
                            if (typeof logBattle === 'function') logBattle(`🌿 Фантом восстанавливает <b style="color:#00ff00;">${hAmt}</b> ХП.`, '#00ff00');
                            baseDamage = 0; 
                        } else if (bSpell === 'firestorm' || bSpell === 'anti_undead') {
                            baseDamage = Math.floor(baseDamage * 2.5);
                        } else if (bSpell === 'base' || bSpell === 'stun_undead') {
                            baseDamage = Math.floor(baseDamage * 1.5);
                            if (bSpell === 'stun_undead') {
                                battleState.mana = Math.max(0, battleState.mana - 20);
                                if (typeof logBattle === 'function') logBattle(`✨ Ваша мана выжжена на 20%!`, '#cc00cc');
                            }
                        } else if (bSpell === 'shield') {
                            battleState.botShieldTurns = 2;
                            if (typeof logBattle === 'function') logBattle(`🛡️ Фантом закрывается магическим барьером!`, '#00ffcc');
                            baseDamage = 0;
                        } else if (bSpell === 'constanta') {
                            battleState.botConstantActive = true;
                            if (typeof logBattle === 'function') logBattle(`🌌 Фантом активировал Константу!`, '#d4af37');
                            baseDamage = 0;
                        } else if (bSpell === 'blind') {
                            battleState.playerBlindTurns = 1;
                            if (typeof logBattle === 'function') logBattle(`👁️ Вы ослеплены! Следующая ваша магия промахнется.`, '#ccc');
                            baseDamage = Math.floor(baseDamage * 0.5); 
                        } else if (bSpell === 'mind_control') {
                            battleState.playerMindControlTurns = 1;
                            if (typeof logBattle === 'function') logBattle(`🎭 Ваш разум помутнен! Вы ударите сами себя.`, '#ff4d4d');
                            baseDamage = 0;
                        } else if (bSpell === 'spirit') {
                            battleState.botSpiritActive = true;
                            if (typeof logBattle === 'function') logBattle(`🐺 Фантом призывает духа-защитника!`, '#88a3d6');
                            baseDamage = 0;
                        } else if (bSpell === 'release') {
                            let relDmg = battleState.botSpiritAbsorbed || 0;
                            baseDamage = relDmg > 0 ? relDmg * 2 : baseDamage;
                            battleState.botSpiritAbsorbed = 0;
                            battleState.botSpiritActive = false;
                            if (typeof logBattle === 'function') logBattle(`🌪️ Высвобождение духа наносит колоссальный урон!`, '#ffcc00');
                        }
                    }
                }

                let isGhostly = (battleState.enemyType === 'spirit' || (battleState.enemyType === 'road' && battleState.roadEnemyAbility === 'ethereal'));
                if (isGhostly) {
                    battleState.nextHitIsCrit = false;

                    if (battleState.etherealTurns > 0) {
                        battleState.etherealTurns--;
                        let hpCut = Math.floor(battleState.playerMaxHp * 0.15);
                        
                        if (battleState.playerHp - hpCut <= 0 && typeof playerEquipped !== 'undefined' && playerEquipped && playerEquipped.ring === 'ring_necromancer') {
                            if (typeof logBattle === 'function') logBattle(`💀 <b>Кольцо Некроманта</b> вспыхивает черным светом! Оно спасает вас от разрыва души, здоровье сохранено!`, '#ff4d4d');
                            hpCut = 0;
                        }

                        battleState.playerHp -= hpCut;
                        
                        if (hpCut > 0) {
                            if (typeof logBattle === 'function') logBattle(`🥶 <b>Бесплотные когти</b> проходят сквозь броню! Ваша жизненная сила иссякает на <b style="color:#ff0000;">${hpCut}</b> ХП.`, '#00ffff');
                        }
                        
                        if (battleState.etherealTurns === 0) {
                            if (typeof logBattle === 'function') logBattle(`👻 Дух снова обретает материальную форму.`, '#aaa');
                        }
                        
                        updateBattleUI(); 
                        checkBattleEnd(); 
                        return;
                    } else {
                        if (Math.random() < 0.25) {
                            battleState.etherealTurns = 2;
                            if (typeof logBattle === 'function') logBattle(`👻 <b>Дух становится бесплотным!</b> Он неуязвим к магии, а его атаки игнорируют броню!`, '#00ffff');
                            updateBattleUI(); 
                            checkBattleEnd(); 
                            return;
                        }
                    }
                }

                if (battleState.enemyType === 'elite' && typeof currentEliteBossIndex !== 'undefined' && typeof eliteUndead !== 'undefined' && currentEliteBossIndex < eliteUndead.length) {
                    let boss = eliteUndead[currentEliteBossIndex];
                    
                    if (boss.id === 'boss_healer' && battleState.enemyHp < battleState.enemyMaxHp) {
                        let healAmount = Math.floor(battleState.enemyMaxHp * 0.05);
                        battleState.enemyHp = Math.min(battleState.enemyMaxHp, battleState.enemyHp + healAmount);
                        if (typeof logBattle === 'function') logBattle(`🩸 Искаженная магия жизни сращивает разорванные ткани! Мертвец-Целитель восстанавливает <b style="color:#00aa00;">${healAmount}</b> здоровья.`, '#00ff00');
                    }
                    
                    if (boss.id === 'boss_necromancer') {
                        let necroAction = Math.floor(Math.random() * 5);
                        if (necroAction === 0 && battleState.enemyHp < battleState.enemyMaxHp) {
                            let healAmount = Math.floor(battleState.enemyMaxHp * 0.05);
                            battleState.enemyHp = Math.min(battleState.enemyMaxHp, battleState.enemyHp + healAmount);
                            if (typeof logBattle === 'function') logBattle(`🩸 <b>Ритуал Крови:</b> Некромант поглощает жизненную силу земли, восстанавливая <b style="color:#00aa00;">${healAmount}</b> ХП!`, '#00ff00');
                        } else if (necroAction === 1) {
                            baseDamage = Math.floor(baseDamage * 1.5);
                            if (typeof logBattle === 'function') logBattle(`🔥 <b>Пламя Аннигиляции:</b> Некромант обрушивает на вас нечестивый огонь!`, '#ff6600');
                        } else if (necroAction === 2) {
                            battleState.mana = Math.max(0, battleState.mana - 30);
                            if (typeof logBattle === 'function') logBattle(`👁️ <b>Иссушение:</b> Темная магия выжигает вашу волю! Вы теряете 30% маны.`, '#cc00cc');
                        } else if (necroAction === 3) {
                            battleState.shieldArmorBonus = 0; 
                            if (typeof logBattle === 'function') logBattle(`🛡️ <b>Гниение металла:</b> Некромант растворяет ваш магический барьер!`, '#a6a6a6');
                        } else {
                            if (typeof logBattle === 'function') logBattle(`💀 Некромант плетет темное заклятье!`);
                        }
                    }
                }

                if (battleState.nextHitIsCrit) baseDamage = 9999;
                
                if (battleState.mindControlActive) {
                    if (typeof logBattle === 'function') logBattle(`🎭 Враг в замешательстве бьет сам себя на <b style="color:#ff4d4d;">${baseDamage}</b>!`, '#ff4d4d');
                    battleState.enemyHp -= baseDamage; 
                    battleState.mindControlActive = false;
                    updateBattleUI(); 
                    checkBattleEnd(); 
                    return;
                }

                if (battleState.enemyBlindTurns > 0) { 
                    battleState.enemyBlindTurns--; 
                    if (typeof logBattle === 'function') logBattle(`👁️ Враг ослеплен и промахивается!`, '#ccc'); 
                    return; 
                }

                let finalDamage = baseDamage;
                
                if (battleState.constantActive) {
                    finalDamage = 1; 
                    battleState.constantActive = false;
                    if (typeof logBattle === 'function') logBattle(`🌌 Константа поглотила удар! Получено <b style="color:#ff4d4d;">1</b> урона.`, '#d4af37');
                } else {
                    if (Date.now() < battleState.shieldEndTime) { 
                        finalDamage = Math.floor(finalDamage * 0.5); 
                        if (typeof logBattle === 'function') logBattle(`🪄 Барьер поглотил 50% урона!`, '#00b3ff'); 
                    }
                    if (battleState.spiritActive && !battleState.nextHitIsCrit) {
                         let absorbed = Math.floor(finalDamage * battleState.spiritAbsorbPct); 
                         battleState.spiritAbsorbed += absorbed; 
                         finalDamage -= absorbed;
                         if (typeof logBattle === 'function') logBattle(`🐺 Дух берет на себя ${absorbed} урона!`, '#88a3d6');
                    }

                    let armorData = typeof getTotalArmor === 'function' ? getTotalArmor() : { total: 0 };
                    let ar = Number(armorData.total) || 0;
                    
                    if (Date.now() < battleState.shieldEndTime) {
                        let sBonus = battleState.shieldArmorBonus || 0;
                        if (sBonus > 0) {
                            let extraAr = Math.floor(ar * sBonus);
                            ar += extraAr;
                        }
                    }

                    if (battleState.enemyType === 'arena' && battleState.botPierce > 0) {
                        let pierceDeduction = Math.floor(ar * (battleState.botPierce / 100));
                        ar -= pierceDeduction;
                        if (ar < 0) ar = 0;
                    }
                    
                    finalDamage = Math.max(0, finalDamage - ar);
                    
                    if (battleState.playerHp - finalDamage <= 0) {
                        if (typeof playerEquipped !== 'undefined' && playerEquipped && playerEquipped.ring === 'ring_necromancer') {
                            if (typeof logBattle === 'function') logBattle(`💀 <b>Кольцо Некроманта</b> вспыхивает черным светом! Смертельный удар проигнорирован, здоровье сохранено!`, '#ff4d4d');
                            finalDamage = 0;
                        }
                    }
                    
                    if (battleState.nextHitIsCrit && finalDamage > 0) { 
                        if (typeof logBattle === 'function') logBattle(`💀 <b>КРИТ!</b> Враг наносит <b style="color:#ff0000;">${finalDamage}</b> урона!`, '#ff0000'); 
                    } else if (ar > 0 && finalDamage > 0) { 
                        if (typeof logBattle === 'function') logBattle(`🔥 Броня заблокировала ${ar}. Получено <b style="color:#ff4d4d;">${finalDamage}</b> урона.`); 
                    } else if (finalDamage === 0 && !battleState.nextHitIsCrit) { 
                        if (typeof logBattle === 'function') logBattle(`🛡️ Защита полностью блокирует удар!`, '#00ffcc'); 
                    } else if (finalDamage > 0) { 
                        if (typeof logBattle === 'function') logBattle(`🔥 Враг наносит <b style="color:#ff4d4d;">${finalDamage}</b> урона.`); 
                    }
                }

                battleState.playerHp -= finalDamage; 
                battleState.attackCount++;

                // === НАНЕСЕНИЕ УРОНА ОТ ОЖОГА ===
                if (battleState.playerBurnTurns > 0 && battleState.playerHp > 0) {
                    battleState.playerBurnTurns--;
                    let burnDmg = 30 + Math.floor(battleState.playerMaxHp * 0.02);
                    battleState.playerHp -= burnDmg;
                    if (typeof logBattle === 'function') logBattle(`🔥 Ожог наносит <b style="color:#ff0000;">${burnDmg}</b> урона!`, '#ff6600');
                    if (battleState.playerHp <= 0) {
                        updateBattleUI(); checkBattleEnd(); return;
                    }
                }

                let cBossIdx = typeof currentEliteBossIndex !== 'undefined' ? currentEliteBossIndex : 0;
                let eIE = typeof elderInterruptedElite !== 'undefined' ? elderInterruptedElite : true;
                if (battleState.enemyType === 'elite' && cBossIdx === 0 && battleState.attackCount === 1 && !eIE) {
                    battleState.active = false; stopCombatIntervals(); elderInterruptedElite = true;
                    if (typeof saveGame === 'function') saveGame();
                    
                    if (typeof logBattle === 'function') logBattle(`<div style="background: rgba(255,0,0,0.2); padding: 5px; border-radius: 5px; border-left: 3px solid #ff0000;">👴 <b>Староста:</b> Избавитель, назад! Тебе не выстоять!</div>`);
                    updateBattleUI();

                    setTimeout(() => {
                        let timerEl = document.getElementById('battle-shield-timer'); if(timerEl) timerEl.style.display = 'none'; 
                        let warnEl = document.getElementById('crit-warning'); if(warnEl) warnEl.style.display = 'none';
                        let logEl = document.getElementById('battle-log'); if(logEl) logEl.innerHTML = ''; 
                        
                        let nav = document.querySelector('.bottom-nav'); if(nav) nav.style.display = 'flex'; 
                        if (typeof switchTab === 'function') switchTab('main', document.getElementById('nav-btn-main'));
                        if (typeof startElderInterruptDialogue === 'function') startElderInterruptDialogue();
                    }, 2500);
                    return; 
                }

                if ((battleState.enemyType === 'undead' || battleState.enemyType === 'elite' || battleState.enemyType === 'road') && battleState.attackCount % 3 === 2) {
                    battleState.nextHitIsCrit = true;
                } else { battleState.nextHitIsCrit = false; }
                
                updateBattleUI(); 
                checkBattleEnd();
            } catch(e) { console.error("AttackTimer Error:", e); }
        }, 5000);
        
        if(typeof combatIntervals !== 'undefined') combatIntervals.push(manaTimer, enemyAttackTimer);
        
    } catch (e) { console.error("Ошибка запуска боя:", e); }
}

function updateBattleUI() {
    try {
        let isCooldown = Date.now() < battleState.spellCooldown;
        
        let runes = document.querySelectorAll('.battle-rune');
        if (runes) {
            runes.forEach(rune => {
                let sid = rune.getAttribute('data-spell-id');
                if (sid) {
                    let cost = typeof getSpellManaCost === 'function' ? getSpellManaCost(sid) : 15;
                    if (sid !== 'dev_kill' && (isCooldown || battleState.mana < cost)) {
                        rune.style.opacity = '0.4';
                        rune.style.filter = 'grayscale(100%)';
                    } else {
                        rune.style.opacity = '1';
                        rune.style.filter = 'none';
                    }
                }
            });
        }

        let safeMana = Number(battleState.mana) || 0;
        let manaBar = document.getElementById('mana-bar');
        if(manaBar) manaBar.style.width = safeMana + '%';

        let manaText = document.getElementById('mana-text');
        if (manaText) {
            if (battleState.enemyType === 'girl') {
                manaText.innerHTML = Math.floor(safeMana) + '% <span style="color:#ff0000; font-size:0.7rem; display:block;">(Сжигание)</span>';
                if(manaBar) manaBar.style.background = "linear-gradient(90deg, #cc0000, #ff4d4d)";
            } else if (battleState.playerExhausted) {
                manaText.innerHTML = Math.floor(safeMana) + '% <span style="color:#cc00cc; font-size:0.7rem; display:block;">(Истощение)</span>';
                if(manaBar) manaBar.style.background = "linear-gradient(90deg, #800080, #cc00cc)";
            } else {
                manaText.innerText = Math.floor(safeMana) + '%';
                if(manaBar) manaBar.style.background = "linear-gradient(90deg, #0055ff, #00ffff)";
            }
        }
        
        let safePlayerHp = isNaN(battleState.playerHp) ? 0 : battleState.playerHp;
        let safeEnemyHp = isNaN(battleState.enemyHp) ? 0 : battleState.enemyHp;
        let maxP = Number(battleState.playerMaxHp) || 1;
        let maxE = Number(battleState.enemyMaxHp) || 1;
        
        let pPercent = Math.max(0, (safePlayerHp / maxP) * 100);
        let ePercent = Math.max(0, (safeEnemyHp / maxE) * 100);
        
        let pBar = document.getElementById('player-hp-bar'); 
        if(pBar) pBar.style.width = pPercent + '%';
        
        let pText = document.getElementById('player-hp-text'); 
        if(pText) pText.innerHTML = `<img src="icons/health.png" style="width: 1em; height: 1em; vertical-align: middle;"> ${Math.max(0, Math.floor(safePlayerHp))}`;
        
        let eBar = document.getElementById('enemy-hp-bar'); 
        if(eBar) eBar.style.width = ePercent + '%';
        
        let eText = document.getElementById('enemy-hp-text'); 
        if(eText) eText.innerHTML = `<img src="icons/health.png" style="width: 1em; height: 1em; vertical-align: middle;"> ${Math.max(0, Math.floor(safeEnemyHp))}`;

        let critW = document.getElementById('crit-warning');
        if (critW) { critW.style.display = battleState.nextHitIsCrit ? 'block' : 'none'; }
        
    } catch(e) { console.error("Ошибка обновления UI боя:", e); }
}

function checkBattleEnd() {
    try {
        let safeEnemyHp = Number(battleState.enemyHp);
        let safePlayerHp = Number(battleState.playerHp);

        if (safeEnemyHp <= 0) {
            battleState.active = false; stopCombatIntervals();
            let timerEl = document.getElementById('battle-shield-timer'); if(timerEl) timerEl.style.display = 'none'; 
            let warnEl = document.getElementById('crit-warning'); if(warnEl) warnEl.style.display = 'none';
            
            setTimeout(() => {
                if (battleState.enemyType === 'bandit') {
                    if (typeof playerGold !== 'undefined') playerGold += 150; 
                    if (typeof playerDiamonds !== 'undefined') playerDiamonds += 10; 
                    if (typeof updateResourceUI === 'function') updateResourceUI(); 
                    if (typeof saveGame === 'function') saveGame();
                    if (typeof showLootAlert === 'function') {
                        showLootAlert(`🏆 <b>ВЫ ПОБЕДИЛИ!</b><br>Награда:<br>150 <img src="icons/gold.png" style="width: 1.2em; height: 1.2em; vertical-align: middle;"><br>10 <img src="icons/diamond.png" style="width: 1.2em; height: 1.2em; vertical-align: middle;">`, () => { 
                            let bLog = document.getElementById('battle-log'); if(bLog) bLog.innerHTML = ''; 
                            if (typeof openSubTab === 'function') openSubTab('tab-main'); 
                            if (typeof startDialogue === 'function') startDialogue(); 
                        });
                    }
                } 
                else if (battleState.enemyType === 'girl') {
                    // ПЕРЕХВАТ: Если игрок чудом убил девушку
                    girlEncounterDone = true;
                    if (typeof saveGame === 'function') saveGame(); 
                    if (typeof showLootAlert === 'function') {
                        showLootAlert(`🏆 <b>ПОРАЗИТЕЛЬНАЯ СИЛА!</b><br><br>Вы одолели Незнакомку, но она всё ещё крепко стоит на ногах.`, () => {
                            endBattleView();
                            if (typeof startGirlPostBattleDialogue === 'function') startGirlPostBattleDialogue();
                        });
                    }
                }
                else if (battleState.enemyType === 'road') {
                    let rLvl = (typeof activeRoadJourney !== 'undefined' && activeRoadJourney) ? activeRoadJourney.recLevel : 5;
                    let rGold = rLvl * 50;
                    let rXp = rLvl * 25;
                    if (typeof playerGold !== 'undefined') playerGold += rGold; 
                    if(typeof gainXp === 'function') gainXp(rXp); 
                    
                    if (typeof activeRoadJourney !== 'undefined' && activeRoadJourney) {
                        activeRoadJourney.completed = true;
                    }

                    if (typeof saveGame === 'function') saveGame(); 
                    if (typeof updateResourceUI === 'function') updateResourceUI();
                    
                    if (typeof showLootAlert === 'function') {
                        showLootAlert(`🏆 <b style="color:#d4af37;">ПУТЬ ПРОЙДЕН!</b><br>Враг повержен, дорога свободна.<br><br>Награда:<br>${rGold} <img src="icons/gold.png" style="width: 1.2em; height: 1.2em; vertical-align: middle;"><br>${rXp} XP`, () => {
                            endBattleView();
                            if (typeof openSubTab === 'function') openSubTab('tab-roads');
                            if (typeof updateRoadsUI === 'function') updateRoadsUI();
                        });
                    }
                }
                else if (battleState.enemyType === 'arena') {
                    if (typeof arenaPoints !== 'undefined') arenaPoints += battleState.botRewardPoints || 10;
                    if (typeof playerGold !== 'undefined') playerGold += battleState.botRewardGold || 100;
                    if (typeof saveGame === 'function') saveGame();
                    if (typeof updateResourceUI === 'function') updateResourceUI();
                    
                    if (typeof renderArenaTab === 'function') { setTimeout(() => renderArenaTab(), 100); }
                    
                    if (typeof showLootAlert === 'function') {
                        showLootAlert(`🏆 <b>СЛАВНАЯ ПОБЕДА!</b><br>Фантом повержен.<br><br>Награда:<br><span style="color:#00ffcc;">+${battleState.botRewardPoints} Очков Рейтинга</span><br>${battleState.botRewardGold} <img src="icons/gold.png" style="width: 1.2em; height: 1.2em; vertical-align: middle;">`, () => {
                            endBattleView();
                            if (typeof switchTab === 'function') switchTab('main', document.getElementById('nav-btn-main'));
                            if (typeof openSubTab === 'function') openSubTab('tab-arena'); 
                        });
                    }
                }
                else if (battleState.enemyType === 'undead') {
                    if (typeof playerGold !== 'undefined') playerGold += 50; 
                    if(typeof gainXp === 'function') gainXp(25); 
                    if (typeof weakUndeadKilled !== 'undefined') weakUndeadKilled = (Number(weakUndeadKilled) || 0) + 1;
                    
                    let dropText = ""; let prefix = "";
                    if (typeof selectedClass !== 'undefined') {
                        if (selectedClass === "Защитник") prefix = "weak_def";
                        else if (selectedClass === "Аннигилятор") prefix = "weak_anni";
                        else if (selectedClass === "Друид") prefix = "weak_druid";
                        else if (selectedClass === "Целитель") prefix = "weak_heal";
                        else if (selectedClass === "Искуситель") prefix = "weak_temp";
                    }

                    if (typeof weakUndeadKilled !== 'undefined' && typeof playerInventory !== 'undefined' && playerInventory && Array.isArray(playerInventory.equip)) {
                        if (weakUndeadKilled === 1) {
                            playerInventory.equip.push(prefix + "_head"); playerInventory.equip.push(prefix + "_feet");
                            if (typeof unlockedEquip !== 'undefined') {
                                if(!unlockedEquip.includes(prefix + "_head")) unlockedEquip.push(prefix + "_head");
                                if(!unlockedEquip.includes(prefix + "_feet")) unlockedEquip.push(prefix + "_feet");
                            }
                            dropText += `<br><br><img src="icons/chest.png" style="width: 1.2em; height: 1.2em; vertical-align: middle;"> Вы получили часть сета:<br><b>Шляпа и Сапоги</b>!`;
                        } else if (weakUndeadKilled === 2) {
                            playerInventory.equip.push(prefix + "_body");
                            if (typeof unlockedEquip !== 'undefined' && !unlockedEquip.includes(prefix + "_body")) unlockedEquip.push(prefix + "_body");
                            dropText += `<br><br><img src="icons/chest.png" style="width: 1.2em; height: 1.2em; vertical-align: middle;"> Вы получили часть сета:<br><b>Мантия</b>!`;
                        } else if (weakUndeadKilled === 3) {
                            playerInventory.equip.push(prefix + "_weapon");
                            if (typeof unlockedEquip !== 'undefined' && !unlockedEquip.includes(prefix + "_weapon")) unlockedEquip.push(prefix + "_weapon");
                            dropText += `<br><br><img src="icons/chest.png" style="width: 1.2em; height: 1.2em; vertical-align: middle;"> Вы получили часть сета:<br><b>Оружие</b>!`;
                        }
                    }

                    if (Math.random() < 0.35 && typeof playerInventory !== 'undefined' && playerInventory && playerInventory.consumables) { 
                        if(!playerInventory.consumables["magic_book"]) playerInventory.consumables["magic_book"] = 0;
                        playerInventory.consumables["magic_book"]++;
                        dropText += "<br>🎁 Выпала <b>📖 Книга магии</b>";
                    }

                    if(typeof updateQuestProgress === 'function') updateQuestProgress('kill_undead', 1); 
                    if (typeof weakUndeadKilled !== 'undefined' && weakUndeadKilled >= 3 && typeof elitePhaseActive !== 'undefined' && !elitePhaseActive && typeof currentEliteBossIndex !== 'undefined' && currentEliteBossIndex === 0) {
                        elitePhaseActive = true;
                        dropText += "<br><br><b style='color:#ff00ff; text-shadow: 0 0 5px #ff00ff;'>⚠️ Из тумана выходят новые, зловещие фигуры...</b>";
                    }

                    if (typeof saveGame === 'function') saveGame(); 
                    if (typeof updateResourceUI === 'function') updateResourceUI();
                    
                    if (typeof weakUndeadKilled !== 'undefined' && weakUndeadKilled === 1 && typeof authRewardClaimed !== 'undefined' && !authRewardClaimed) {
                        if (typeof showLootAlert === 'function') {
                            showLootAlert(`🏆 <b>МЕРТВЕЦ ПОВЕРЖЕН!</b><br>Награда: 50 <img src="icons/gold.png" style="width: 1.2em; height: 1.2em; vertical-align: middle;">, 25 Опыта${dropText}`, () => {
                                endBattleView();
                                if (typeof startGhostAuthDialogue === 'function') startGhostAuthDialogue();
                            });
                        }
                    } else {
                        if (typeof showLootAlert === 'function') showLootAlert(`🏆 <b>МЕРТВЕЦ ПОВЕРЖЕН!</b><br>Награда: 50 <img src="icons/gold.png" style="width: 1.2em; height: 1.2em; vertical-align: middle;">, 25 Опыта${dropText}`, endBattleView);
                    }
                } 
                else if (battleState.enemyType === 'spirit') {
                    if (typeof playerGold !== 'undefined') playerGold += 100; 
                    if(typeof gainXp === 'function') gainXp(45); 
                    midlockSpiritDefeated = true; // ОТМЕТКА О СМЕРТИ ДУХА
                    if (typeof saveGame === 'function') saveGame(); 
                    if (typeof updateResourceUI === 'function') updateResourceUI();
                    if (typeof showLootAlert === 'function') {
                        showLootAlert(`🏆 <b>ДУХ РАЗВОПЛОЩЕН!</b><br>Награда: 100 <img src="icons/gold.png" style="width: 1.2em; height: 1.2em; vertical-align: middle;">, 45 Опыта`, () => {
                            endBattleView();
                            if (typeof startPostSpiritDialogue === 'function') startPostSpiritDialogue(); // ПЕРЕХОД К ДИАЛОГУ С ДЕВУШКОЙ
                        });
                    }
                }
                else if (battleState.enemyType === 'elite') {
                    let idx = typeof currentEliteBossIndex !== 'undefined' ? currentEliteBossIndex : 0;
                    let boss = (typeof eliteUndead !== 'undefined' && eliteUndead[idx]) ? eliteUndead[idx] : null;
                    if (boss) {
                        if (typeof playerGold !== 'undefined') playerGold += (boss.rewardGold || 0); 
                        if(typeof gainXp === 'function') gainXp(boss.rewardXp || 0);
                        
                        let item = (typeof itemsDB !== 'undefined' && itemsDB[boss.drop]) ? itemsDB[boss.drop] : null;
                        if (item && typeof playerInventory !== 'undefined' && playerInventory && Array.isArray(playerInventory.equip)) {
                            playerInventory.equip.push(boss.drop);
                            if (typeof unlockedEquip !== 'undefined') unlockedEquip.push(boss.drop);
                        }
                        
                        if (boss.id === 'boss_healer') {
                            if (typeof currentEliteBossIndex !== 'undefined') currentEliteBossIndex++;
                            if (typeof saveGame === 'function') saveGame(); 
                            if (typeof updateResourceUI === 'function') updateResourceUI();
                            if (typeof showLootAlert === 'function') {
                                showLootAlert(`🏆 <b style="color:#ff4d4d;">${boss.name.toUpperCase()} УНИЧТОЖЕН!</b><br><br>Награда:<br>${boss.rewardGold} <img src="icons/gold.png" style="width: 1.2em; height: 1.2em; vertical-align: middle;"><br>${boss.rewardXp} XP`, () => {
                                    endBattleView(); 
                                    if (typeof startPostHealerDialogue === 'function') startPostHealerDialogue();
                                });
                            }
                        } else if (boss.id === 'boss_necromancer') {
                            if (typeof currentEliteBossIndex !== 'undefined') currentEliteBossIndex++;
                            if (typeof playerInventory !== 'undefined' && playerInventory && Array.isArray(playerInventory.equip)) { playerInventory.equip.push('ring_necromancer'); }
                            if (typeof saveGame === 'function') saveGame(); 
                            if (typeof updateResourceUI === 'function') updateResourceUI();
                            if (typeof showLootAlert === 'function') {
                                showLootAlert(`🏆 <b style="color:#ff4d4d;">НЕКРОМАНТ УНИЧТОЖЕН!</b><br><br>Тьма отступает от этих земель...<br><br>🌟 <b>+250 к базовому здоровью навсегда!</b><br>💍 Получено: <b>Кольцо Некроманта</b>`, () => {
                                    endBattleView(); 
                                    if (typeof startEndingCutscene === 'function') startEndingCutscene();
                                });
                            }
                        } else {
                            if (typeof currentEliteBossIndex !== 'undefined') currentEliteBossIndex = (Number(currentEliteBossIndex) || 0) + 1;
                            if (typeof currentEliteBossIndex !== 'undefined' && typeof eliteUndead !== 'undefined' && currentEliteBossIndex >= eliteUndead.length) elitePhaseActive = false; 
                            if (typeof saveGame === 'function') saveGame(); 
                            if (typeof updateResourceUI === 'function') updateResourceUI();
                            if (typeof showLootAlert === 'function') {
                                showLootAlert(`🏆 <b style="color:#ff4d4d;">${boss.name.toUpperCase()} УНИЧТОЖЕН!</b><br><br>Награда:<br>${boss.rewardGold} <img src="icons/gold.png" style="width: 1.2em; height: 1.2em; vertical-align: middle;"><br>${boss.rewardXp} XP<br><br><img src="icons/chest.png" style="width: 1.2em; height: 1.2em; vertical-align: middle;"> Трофей: <b style="color:#d4af37;">${item ? item.icon + ' ' + item.name : 'Ничего'}</b>`, endBattleView);
                            }
                        }
                    } else { endBattleView(); }
                }
                else if (battleState.enemyType === 'beast') {
                    let skinsAmt = Math.floor(Math.random() * 3) + 1;
                    if (typeof playerInventory !== 'undefined' && playerInventory && playerInventory.consumables) {
                        if (!playerInventory.consumables["beast_skin"]) playerInventory.consumables["beast_skin"] = 0;
                        playerInventory.consumables["beast_skin"] += skinsAmt;
                    }
                    let lootText = (typeof generateBeastLoot === 'function' ? generateBeastLoot() : "") + `<br>🐻 Шкуры зверя: <b>${skinsAmt} шт.</b>`; 
                    if(typeof gainXp === 'function') gainXp(15); 
                    if (typeof updateResourceUI === 'function') updateResourceUI(); 
                    if(typeof updateQuestProgress === 'function') updateQuestProgress('kill_beast', 1); 
                    if (typeof saveGame === 'function') saveGame(); 
                    if (typeof showLootAlert === 'function') showLootAlert(`🏆 <b>ЗВЕРЬ ПОВЕРЖЕН!</b><br>Получено 15 Опыта<br><br>${lootText}`, endBattleView);
                }
            }, 2000);

        } else if (safePlayerHp <= 0) {
            battleState.active = false; stopCombatIntervals();
            let timerEl = document.getElementById('battle-shield-timer'); if(timerEl) timerEl.style.display = 'none'; 
            let warnEl = document.getElementById('crit-warning'); if(warnEl) warnEl.style.display = 'none';
            
            setTimeout(() => {
                if (typeof baseStats !== 'undefined' && typeof playerLevel !== 'undefined') baseStats.hp = 500 + ((Number(playerLevel) - 1) * 50); 
                if (typeof updateStatsUI === 'function') updateStatsUI();
                
                let uIntroLost = typeof undeadIntroLost !== 'undefined' ? undeadIntroLost : false;
                
                if (battleState.enemyType === 'arena') {
                    if (typeof arenaPoints !== 'undefined') {
                        arenaPoints -= 5;
                        if (arenaPoints < 0) arenaPoints = 0;
                    }
                    if (typeof saveGame === 'function') saveGame();
                    
                    if (typeof renderArenaTab === 'function') {
                        setTimeout(() => renderArenaTab(), 100);
                    }

                    if (typeof showLootAlert === 'function') {
                        showLootAlert(`💀 <b>ФАНТОМ ОКАЗАЛСЯ СИЛЬНЕЕ</b><br><br>Вы потеряли сознание и были изгнаны с Арены.<br><span style="color:#ff4d4d;">-5 Очков Рейтинга</span>`, () => {
                            endBattleView();
                            if (typeof switchTab === 'function') switchTab('main', document.getElementById('nav-btn-main'));
                            if (typeof openSubTab === 'function') openSubTab('tab-arena');
                        });
                    }
                }
                else if (battleState.enemyType === 'girl') {
                    // ПЕРЕХВАТ: Если игрок проиграл девушке (как и задумано)
                    girlEncounterDone = true;
                    if (typeof saveGame === 'function') saveGame(); 
                    if (typeof showLootAlert === 'function') {
                        showLootAlert(`💀 <b>ВЫ ПОВЕРЖЕНЫ</b><br><br>Ее натиск оказался слишком силен. Вы обессилены падаете на землю...`, () => {
                            endBattleView();
                            if (typeof startGirlPostBattleDialogue === 'function') startGirlPostBattleDialogue();
                        });
                    }
                }
                else if (battleState.enemyType === 'road') {
                    if (typeof saveGame === 'function') saveGame(); 
                    if (typeof showLootAlert === 'function') {
                        showLootAlert(`💀 <b>ИЗГНАНИЕ С ДОРОГИ</b><br><br>Враг оказался слишком силен. Вы сбежали.`, () => {
                            endBattleView();
                            if (typeof openSubTab === 'function') openSubTab('tab-roads');
                        });
                    }
                }
                else if (battleState.enemyType === 'undead' && !uIntroLost) {
                    if (typeof undeadIntroLost !== 'undefined') undeadIntroLost = true; 
                    if (typeof saveGame === 'function') saveGame(); 
                    let bLog = document.getElementById('battle-log'); if(bLog) bLog.innerHTML = ''; 
                    if (typeof openSubTab === 'function') openSubTab('tab-main'); 
                    if (typeof startUndeadLossDialogue === 'function') startUndeadLossDialogue();
                } else if (battleState.enemyType === 'undead' || battleState.enemyType === 'elite' || battleState.enemyType === 'spirit') {
                    let rGold = Math.floor(Math.random() * 15) + 10; 
                    if (typeof playerGold !== 'undefined') playerGold += rGold; 
                    if(typeof gainXp === 'function') gainXp(10); 
                    if (typeof saveGame === 'function') saveGame(); 
                    if (typeof updateResourceUI === 'function') updateResourceUI();
                    
                    let extraBtn = `<button onclick="retryBattle('${battleState.enemyType}')" style="background: linear-gradient(180deg, #006600, #003300); border-color: #00cc00;">Ещё бой</button>`;
                    if (typeof showLootAlert === 'function') showLootAlert(`💀 <b style="color:#d4af37;">ОТСТУПЛЕНИЕ</b><br><span style="color:#aaa; font-size: 0.9rem;">Вам пришлось отступить.</span><br>Утешительная награда:<br>${rGold} <img src="icons/gold.png" style="width: 1.2em; height: 1.2em; vertical-align: middle;"><br>🌟 10 Опыта`, endBattleView, extraBtn);
                } else {
                    if (typeof showLootAlert === 'function') showLootAlert('💀 <b>ПОРАЖЕНИЕ</b><br><br>Вы отступили в безопасное место.', endBattleView);
                }
            }, 2000);
        }
    } catch(e) { console.error("Ошибка проверки финала:", e); }
}

function endBattleView() { 
    let log = document.getElementById('battle-log'); if(log) log.innerHTML = ''; 
    let nav = document.querySelector('.bottom-nav'); if(nav) nav.style.display = 'flex'; 
    if (typeof switchTab === 'function') switchTab('main', document.getElementById('nav-btn-main')); 
}

function retryBattle(enemyType) { 
    let alertBox = document.getElementById('loot-alert'); 
    if(alertBox) alertBox.style.opacity = '0'; 
    setTimeout(() => { 
        if(alertBox) alertBox.style.display = 'none'; 
        alertCallback = null; 
        startBattle(enemyType); 
    }, 300); 
}

function generateBeastLoot() { 
    let gold = Math.floor(Math.random() * 20) + 10; 
    if (typeof playerGold !== 'undefined') playerGold += gold; 
    return `${gold} <img src="icons/gold.png" style="width: 1.2em; height: 1.2em; vertical-align: middle;">`; 
}
