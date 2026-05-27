// ==========================================
// ЛЕТОПИСЬ СУДЬБЫ (js/gameplay/story.js)
// Сюжет, катсцены и все диалоги игры
// ==========================================

window.setDialoguePortrait = function(iconUrl, fallbackEmoji, borderColor) {
    const portrait = document.getElementById('dlg-portrait');
    if(!portrait) return;
    portrait.style.opacity = '1';
    portrait.style.borderColor = borderColor || '#8b0000';
    
    if (borderColor === '#00ffff') portrait.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
    else if (borderColor === '#d4af37') portrait.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)';
    else portrait.style.boxShadow = '0 0 15px rgba(0,0,0,0.8)';
    
    portrait.innerHTML = `
        <img src="${iconUrl}" class="icon-no-frame" 
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" 
             style="display: block; width: 100%; height: 100%; object-fit: cover;">
        <div style="display: none; width: 100%; height: 100%; background: #111; color: #fff; align-items: center; justify-content: center; font-size: 4rem; text-shadow: none;">
            ${fallbackEmoji}
        </div>
    `;
};

function fadeOutAudio(audio, duration) {
    if (!audio) return;
    const step = 50; 
    const fadeAmount = audio.volume / (duration / step);
    const fadeInterval = setInterval(() => {
        if (audio.volume - fadeAmount > 0.01) { 
            audio.volume -= fadeAmount; 
        } else { 
            audio.volume = 0; 
            audio.pause(); 
            clearInterval(fadeInterval); 
        }
    }, step);
}

function startGame() {
    let menuC = document.getElementById('menu-container');
    if (menuC) menuC.style.opacity = '0';
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.volume = 0.6; 
        bgMusic.play().catch(e => console.warn("Музыка заблокирована браузерной политикой: ", e));
    }
    
    setTimeout(() => { 
        if (menuC) menuC.style.display = 'none'; 
        let storyC = document.getElementById('story-container');
        if (storyC) storyC.style.display = 'flex'; 
        showSlide(); 
    }, 1000);
}

function showSlide() {
    if (typeof storyData === 'undefined') return;
    if (currentIndex >= storyData.length) { 
        endPrologue(); 
        return; 
    }
    
    const currentSlide = storyData[currentIndex];
    const imgElement = document.getElementById('story-image');
    if(imgElement) imgElement.src = currentSlide.img;
    let txt = document.getElementById('story-text');
    if(txt) txt.innerText = currentSlide.text;
    
    setTimeout(() => { 
        if(imgElement) imgElement.style.opacity = '1'; 
        if(txt) txt.style.opacity = '1'; 
        let hint = document.getElementById('continue-hint');
        if(hint) hint.style.opacity = '1'; 
        isTransitioning = false; 
    }, 50);
}

let activeCutscene = null;

document.addEventListener('DOMContentLoaded', () => {
    const storyContainer = document.getElementById('story-container');
    if(storyContainer) {
        storyContainer.addEventListener('click', (e) => {
            if (e.target.id === 'skip-btn' || isTransitioning) return;
            isTransitioning = true; 
            let img = document.getElementById('story-image'); if(img) img.style.opacity = '0'; 
            let txt = document.getElementById('story-text'); if(txt) txt.style.opacity = '0'; 
            let hint = document.getElementById('continue-hint'); if(hint) hint.style.opacity = '0';
            setTimeout(() => { 
                currentIndex++; 
                if (activeCutscene === 'midlock') {
                    showMidlockSlide();
                } else if (typeof isEndingPhase !== 'undefined' && isEndingPhase) {
                    showEndingSlide();
                } else {
                    showSlide(); 
                }
            }, 1000);
        });
    }
});

function skipPrologue(event) {
    event.stopPropagation(); 
    if (isTransitioning) return; 
    isTransitioning = true;
    let img = document.getElementById('story-image'); if(img) img.style.opacity = '0'; 
    let txt = document.getElementById('story-text'); if(txt) txt.style.opacity = '0'; 
    let hint = document.getElementById('continue-hint'); if(hint) hint.style.opacity = '0';
    let btn = document.getElementById('skip-btn'); if(btn) btn.style.display = 'none';
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) fadeOutAudio(bgMusic, 1500);
    setTimeout(() => { endPrologue(); }, 1000);
}

function endPrologue() {
    let storyC = document.getElementById('story-container'); if(storyC) storyC.style.display = 'none';
    let finalS = document.getElementById('final-screen'); if(finalS) finalS.style.display = 'flex';
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic && bgMusic.volume > 0) fadeOutAudio(bgMusic, 2000);
    
    setTimeout(() => {
        let fTxt = document.getElementById('final-text'); if(fTxt) fTxt.style.opacity = '1';
        setTimeout(() => {
            if(fTxt) fTxt.style.opacity = '0'; 
            setTimeout(() => {
                if(finalS) finalS.style.opacity = '0';
                setTimeout(() => { 
                    if(finalS) finalS.style.display = 'none'; 
                    let nScr = document.getElementById('name-screen'); 
                    if(nScr) { nScr.style.display = 'flex'; setTimeout(() => { nScr.style.opacity = '1'; }, 50); }
                }, 1500); 
            }, 2000); 
        }, 3500); 
    }, 100);
}

function submitName() {
    let nameInput = document.getElementById('player-name-input');
    let val = nameInput ? nameInput.value.trim() : "Иземберт";
    let pname = document.getElementById('profile-player-name');
    if(pname) pname.innerText = val === "" ? "Иземберт" : val;
    let nScr = document.getElementById('name-screen');
    if(nScr) nScr.style.opacity = '0';
    setTimeout(() => {
        if(nScr) nScr.style.display = 'none';
        let cScr = document.getElementById('class-screen');
        if(cScr) { cScr.style.display = 'flex'; setTimeout(() => { cScr.style.opacity = '1'; }, 50); }
    }, 1000);
}

function selectClass(element, className) {
    try {
        document.querySelectorAll('.class-card').forEach(card => card.classList.remove('selected'));
        element.classList.add('selected');
        selectedClass = className;
        const btn = document.getElementById('confirm-class-btn');
        if (btn) {
            btn.style.opacity = '1'; 
            btn.style.pointerEvents = 'auto';
        }
    } catch(e) { console.error("Ошибка выбора класса:", e); }
}

function finishSetup() {
    try {
        if (!selectedClass) return;
        let cName = document.getElementById('profile-player-class');
        if(cName) cName.innerText = selectedClass;
        if (typeof applyClassStats === 'function') applyClassStats(); 

        if (typeof isChangingClass !== 'undefined' && isChangingClass) {
            isChangingClass = false;
            playerHasLibrarySpell = true;
            undeadIntroLost = true;
            let cScr = document.getElementById('class-screen'); if(cScr) cScr.style.opacity = '0';
            setTimeout(() => {
                if(cScr) cScr.style.display = 'none';
                let hub = document.getElementById('game-hub');
                if(hub) { hub.style.display = 'flex'; setTimeout(() => { hub.style.opacity = '1'; }, 50); }
                if (typeof updateStatsUI === 'function') updateStatsUI();
                if (typeof renderBattleSpells === 'function') renderBattleSpells();
                saveGame();
                if (typeof showLootAlert === 'function') showLootAlert(`🔮 <b>Вы избрали новый путь: ${selectedClass}!</b><br><small>Тайные знания добавлены в вашу книгу магии.</small>`);
            }, 500);
        } else {
            banditDefeated = false;
            let dl = document.getElementById('domain-locked'); if(dl) dl.style.display = 'block';
            let du = document.getElementById('domain-unlocked'); if(du) du.style.display = 'none';
            
            let cScr = document.getElementById('class-screen'); if(cScr) cScr.style.opacity = '0';
            setTimeout(() => {
                if(cScr) cScr.style.display = 'none';
                let hub = document.getElementById('game-hub');
                if(hub) { hub.style.display = 'flex'; setTimeout(() => { hub.style.opacity = '1'; }, 50); }
                if (typeof updateMainCards === 'function') updateMainCards(); 
                if (typeof updateStatsUI === 'function') updateStatsUI();
                if (typeof updateResourceUI === 'function') updateResourceUI();
                saveGame(); 
            }, 1000);
        }
    } catch(e) { console.error("Ошибка завершения настройки:", e); }
}

function startGhostAuthDialogue() {
    const diagScreen = document.getElementById('dialogue-screen');
    if(!diagScreen) return;
    diagScreen.style.display = 'flex';
    diagScreen.style.background = "linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 20, 40, 0.95))";
    setTimeout(() => { diagScreen.style.opacity = '1'; }, 50);
    showGhostAuthStep(1);
}

function showGhostAuthStep(step) {
    const speaker = document.getElementById('dlg-speaker'); 
    const text = document.getElementById('dlg-text');
    const options = document.getElementById('dlg-options'); 
    if(!options) return;
    options.innerHTML = '';

    if (step === 1) {
        let ghostIcon = (typeof bossDialogueIcons !== 'undefined' && bossDialogueIcons['ghost']) ? bossDialogueIcons['ghost'] : 'icons/ghost_dialogue.png'; 
        setDialoguePortrait(ghostIcon, '👻', '#00ffff');
        
        if(speaker) { speaker.innerText = 'Таинственный призрак'; speaker.style.color = '#00ffff'; speaker.style.textShadow = '0 0 10px rgba(0, 255, 255, 0.5)'; }
        if(text) text.innerText = 'Постой, Избавитель... Ты сделал первый шаг, очистив эти земли от скверны. Но твой путь долог. Хочешь ли ты, чтобы твои подвиги были навечно вписаны в Книгу Судеб Яндекса? Это спасет твою душу от забвения при следующей потере сил.';
        
        let btnAuth = document.createElement('button'); 
        btnAuth.className = 'dialogue-btn'; 
        btnAuth.style.color = '#ffd700';
        btnAuth.innerText = 'Вписать имя (Авторизация + Награда)'; 
        btnAuth.onclick = () => {
            if (window.ysdk) {
                window.ysdk.auth.openAuthDialog().then(() => {
                    if (typeof YaGames !== 'undefined') {
                        YaGames.init().then(ysdk => {
                            ysdk.getPlayer().then(_player => {
                                window.ysdkPlayer = _player;
                                if (typeof authRewardClaimed !== 'undefined' && !authRewardClaimed) {
                                    if (typeof playerGold !== 'undefined') playerGold += 3000;
                                    if (typeof playerDiamonds !== 'undefined') playerDiamonds += 50;
                                    authRewardClaimed = true;
                                    if (typeof saveGame === 'function') saveGame(); 
                                    if (typeof updateResourceUI === 'function') updateResourceUI();
                                    showGhostAuthStep(2);
                                } else { closeDialogueView(); }
                            });
                        });
                    }
                }).catch(() => { closeDialogueView(); if (typeof showLootAlert === 'function') showLootAlert("Призрак печально вздыхает и растворяется во тьме..."); });
            } else { 
                if (typeof showLootAlert === 'function') showLootAlert("Магия Яндекса сейчас недоступна. Попробуй позже."); 
                closeDialogueView(); 
            }
        };
        
        let btnLater = document.createElement('button'); 
        btnLater.className = 'dialogue-btn'; 
        btnLater.innerText = 'Я полагаюсь только на себя'; 
        btnLater.onclick = () => closeDialogueView();
        
        options.appendChild(btnAuth); options.appendChild(btnLater);
    } 
    else if (step === 2) {
        if(text) text.innerText = 'Свершилось. Твои силы теперь под защитой Древних. Прими этот дар: 3000 золотых и 50 алмазов помогут тебе в восстановлении Галмонда. Ступай...';
        let btnExit = document.createElement('button'); 
        btnExit.className = 'dialogue-btn'; 
        btnExit.innerText = 'Продолжить путь'; 
        btnExit.onclick = () => closeDialogueView();
        options.appendChild(btnExit);
    }
}

function startElderInterruptDialogue() {
    const diagScreen = document.getElementById('dialogue-screen');
    if(!diagScreen) return;
    diagScreen.style.display = 'flex';
    diagScreen.style.background = "linear-gradient(rgba(10, 15, 20, 0.8), rgba(5, 5, 10, 0.95)), url('img/village.png') center/cover";
    setTimeout(() => { diagScreen.style.opacity = '1'; }, 50);
    showElderInterruptStep(1);
}

function showElderInterruptStep(step) {
    const speaker = document.getElementById('dlg-speaker'); 
    const text = document.getElementById('dlg-text');
    const options = document.getElementById('dlg-options'); 
    if(!options) return;
    options.innerHTML = '';

    if (step === 1) {
        let elderIcon = (typeof bossDialogueIcons !== 'undefined' && bossDialogueIcons['elder']) ? bossDialogueIcons['elder'] : 'icons/elder.png';
        setDialoguePortrait(elderIcon, '👴', '#a6a6a6');
        
        if(speaker) { speaker.innerText = 'Староста'; speaker.style.color = '#ccc'; }
        if(text) text.innerText = 'Стой, Избавитель! Эти мертвецы... они другие. Из тумана выходят Павшие рыцари, закованные в броню. Тебе не выстоять против них голыми руками!';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Я справлюсь. Отойди.'; btn.onclick = () => showElderInterruptStep(2); options.appendChild(btn);
    } else if (step === 2) {
        if(text) text.innerText = 'Нет! Послушай старика. Без крепкой опоры за спиной у тебя ничего не выйдет. Нам нужно развить деревню, чтобы мы могли торговать, и ты смог покупать книги заклинаний и броню.';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'И как мне это сделать?'; btn.onclick = () => showElderInterruptStep(3); options.appendChild(btn);
    } else if (step === 3) {
        if(text) text.innerText = 'В лесах бродят дикие звери. Охоться на них. Шкуры, которые ты добудешь, приноси мне — я обменяю их на древесину и камень в соседних поселениях. Нам нужно отстроить Ратушу, а затем Лесопилку и Каменоломню.';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Хорошо. Я добуду шкуры.'; 
        btn.onclick = () => {
            beastHuntingUnlocked = true;
            if (typeof quests !== 'undefined' && !quests.find(q => q.id === 'q_elder_skins')) {
                quests.push({ id: 'q_elder_skins', type: 'give_skins', title: "Помощь старосте", desc: "Отдайте 5 шкур зверей старосте для обмена.", target: 5, current: 0, rewardGold: 100, rewardXp: 50, icon: "👴", claimed: false });
            }
            saveGame();
            const diagScreen = document.getElementById('dialogue-screen'); 
            if(diagScreen) diagScreen.style.opacity = '0';
            setTimeout(() => { 
                if(diagScreen) { diagScreen.style.display = 'none'; diagScreen.style.background = 'rgba(0, 0, 0, 0.7)'; }
                if (typeof updateMainCards === 'function') updateMainCards();
                if (typeof showLootAlert === 'function') showLootAlert(`🎯 <b>ОХОТА ОТКРЫТА!</b><br><small>Теперь вы можете охотиться на диких зверей в Главном меню, чтобы добывать Шкуры. Отстройте Ратушу во вкладке Домен!</small>`);
            }, 500);
        }; 
        options.appendChild(btn);
    }
}

function startUndeadLossDialogue() {
    const diagScreen = document.getElementById('dialogue-screen');
    if(!diagScreen) return;
    diagScreen.style.display = 'flex';
    diagScreen.style.background = "linear-gradient(rgba(10, 15, 20, 0.8), rgba(5, 5, 10, 0.95)), url('img/village.png') center/cover";
    setTimeout(() => { diagScreen.style.opacity = '1'; }, 50);
    showUndeadLossStep(1);
}

function showUndeadLossStep(step) {
    const speaker = document.getElementById('dlg-speaker'); 
    const text = document.getElementById('dlg-text');
    const options = document.getElementById('dlg-options'); 
    let pNameEl = document.getElementById('profile-player-name');
    const playerName = pNameEl ? pNameEl.innerText : "Герой";
    if(!options) return;
    options.innerHTML = '';

    if (step === 1) {
        let elderIcon = (typeof bossDialogueIcons !== 'undefined' && bossDialogueIcons['elder']) ? bossDialogueIcons['elder'] : 'icons/elder.png';
        setDialoguePortrait(elderIcon, '👴', '#a6a6a6');
        
        if(speaker) { speaker.innerText = 'Перепуганный староста'; speaker.style.color = '#ccc'; }
        if(text) text.innerText = 'Господин, вы еле живы! Я вовремя вас вытащил... Эти мертвецы слишком сильны. Но послушайте, когда местный дворянин бежал от некроманта, он бросил в ратуше старые магические фолианты!';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Показывай. Любая магия сейчас будет кстати.'; btn.onclick = () => showUndeadLossStep(2); options.appendChild(btn);
    } 
    else if (step === 2) {
        let avFile = (typeof getCurrentAvatarFile === 'function') ? getCurrentAvatarFile() : 'icons/av_mage.png';
        setDialoguePortrait(avFile, '🦹', '#00b3ff');
        
        if(speaker) { speaker.innerText = playerName; speaker.style.color = '#00b3ff'; }
        
        let spellDesc = "";
        if (selectedClass === "Защитник") spellDesc = "Здесь описано заклинание Константа. Оно позволит пережить даже самый сокрушительный удар, сведя урон к единице.";
        else if (selectedClass === "Целитель") spellDesc = "Здесь описано заклинание Изгнание нежити. Это мощная светлая магия, способная оглушить мертвецов на несколько атак и сбить их концентрацию.";
        else if (selectedClass === "Аннигилятор") spellDesc = "Здесь описано заклинание Свергающий огонь. Оно наносит колоссальный урон по нежити, обращая гнилую плоть в пепел.";
        else if (selectedClass === "Искуситель") spellDesc = "Здесь описано заклинание Контроль сознания. Оно заставит неразумную нежить нанести смертельный удар самой себе.";
        else if (selectedClass === "Друид") spellDesc = "Здесь описано заклинание Высвобождение. Оно позволит моему духу-спутнику обрушить впитанный урон обратно на врага, сбивая его с ног.";

        if(text) text.innerText = '(Вы изучаете древнюю книгу, страницы которой светятся магическим светом...) ' + spellDesc;
        
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Запомнить заклинание';
        btn.onclick = () => {
            playerHasLibrarySpell = true;
            saveGame();
            const diagScreen = document.getElementById('dialogue-screen'); 
            if(diagScreen) diagScreen.style.opacity = '0';
            setTimeout(() => { 
                if(diagScreen) { diagScreen.style.display = 'none'; diagScreen.style.background = 'rgba(0, 0, 0, 0.7)'; }
                let libSpellName = (typeof ClassDictionary !== 'undefined' && ClassDictionary[selectedClass] && ClassDictionary[selectedClass].spells[2]) ? ClassDictionary[selectedClass].spells[2].name : "Тайное заклинание";
                if (typeof showLootAlert === 'function') showLootAlert(`📖 <b>Вы изучили заклинание: ${libSpellName}!</b><br><small>Оно появилось в вашей книге магии и доступно в бою.</small>`, typeof endBattleView === 'function' ? endBattleView : null);
            }, 500);
        }; options.appendChild(btn);
    }
}

function startDialogue() {
    const diagScreen = document.getElementById('dialogue-screen');
    if(!diagScreen) return;
    diagScreen.style.display = 'flex';
    diagScreen.style.background = "rgba(0, 0, 0, 0.7)";
    setTimeout(() => { diagScreen.style.opacity = '1'; }, 50);
    showDialogStep(1);
}

function showDialogStep(step) {
    const speaker = document.getElementById('dlg-speaker'); 
    const text = document.getElementById('dlg-text');
    const options = document.getElementById('dlg-options'); 
    let pNameEl = document.getElementById('profile-player-name');
    const playerName = pNameEl ? pNameEl.innerText : "Герой";
    if(!options) return;
    options.innerHTML = ''; 

    if (step === 1) {
        let banditIcon = (typeof bossDialogueIcons !== 'undefined' && bossDialogueIcons['bandit']) ? bossDialogueIcons['bandit'] : 'icons/mage_dialogue.png';
        setDialoguePortrait(banditIcon, '🥷', '#8b0000');
        
        if(speaker) { speaker.innerText = 'Маг-бандит'; speaker.style.color = '#ff4d4d'; }
        if(text) text.innerText = 'Черт! А ты силен! Откуда ты взялся в этих разоренных краях?';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Не слышал, что случилось вчера в столице?'; btn.onclick = () => showDialogStep(2); options.appendChild(btn);
    }
    else if (step === 2) {
        if(text) text.innerText = 'Да короля ассасины завалили. А Избавители видимо в таверне свои богатства пропивали, раз не спасли его. И толку от этой троицы теперь?';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Схватить его за грудки'; btn.onclick = () => showDialogStep(3); options.appendChild(btn);
    }
    else if (step === 3) {
        let avFile = (typeof getCurrentAvatarFile === 'function') ? getCurrentAvatarFile() : 'icons/av_mage.png';
        setDialoguePortrait(avFile, '🦹', '#00b3ff');
        
        if(speaker) { speaker.innerText = playerName; speaker.style.color = '#00b3ff'; }
        if(text) text.innerText = 'Ничтожество! Как ты смеешь!';
        
        let btnKill = document.createElement('button'); btnKill.className = 'dialogue-btn'; btnKill.style.color = '#ff4d4d'; btnKill.innerText = 'Убить бандита'; btnKill.onclick = () => endDialogue('kill');
        let btnSpare = document.createElement('button'); btnSpare.className = 'dialogue-btn'; btnSpare.style.color = '#00ffcc'; btnSpare.innerText = 'Пощадить бандита'; btnSpare.onclick = () => endDialogue('spare');
        options.appendChild(btnKill); options.appendChild(btnSpare);
    }
}

function endDialogue(choice) {
    const options = document.getElementById('dlg-options'); if(options) options.innerHTML = '';
    if (choice === 'kill') {
        banditKilled = true;
        playerApostasy += 1;
        
        const blackScreen = document.getElementById('black-screen-ending');
        if(blackScreen) blackScreen.style.display = 'flex'; 
        setTimeout(() => { if(blackScreen) blackScreen.style.opacity = '1'; }, 50);
        
        setTimeout(() => { 
            if(blackScreen) blackScreen.style.opacity = '0'; 
            setTimeout(() => { 
                if(blackScreen) blackScreen.style.display = 'none'; 
                unlockVillagePath(); 
                closeDialogueView(); 
            }, 2000); 
        }, 4000);
    } else {
        banditKilled = false; 
        playerRighteousness += 1;
        
        let port = document.getElementById('dlg-portrait'); if(port) port.style.opacity = '0'; 
        let spk = document.getElementById('dlg-speaker'); 
        let pNameEl = document.getElementById('profile-player-name');
        if(spk) { spk.innerText = pNameEl ? pNameEl.innerText : "Герой"; spk.style.color = '#00b3ff'; }
        let txt = document.getElementById('dlg-text'); if(txt) txt.innerText = 'Молодец. Беги прочь отсюда и не возвращайся.';
        
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Продолжить путь'; 
        btn.onclick = () => { unlockVillagePath(); closeDialogueView(); }; 
        if(options) options.appendChild(btn);
    }
}

function closeDialogueView() {
    const diagScreen = document.getElementById('dialogue-screen');
    if(!diagScreen) return;
    diagScreen.style.opacity = '0'; 
    setTimeout(() => { 
        diagScreen.style.display = 'none'; 
        if (typeof updateMainCards === 'function') updateMainCards(); 
        if (typeof endBattleView === 'function') endBattleView(); 
    }, 500);
}

function unlockVillagePath() {
    banditDefeated = true;
    let dl = document.getElementById('domain-locked'); if(dl) dl.style.display = 'none';
    let du = document.getElementById('domain-unlocked'); if(du) du.style.display = 'block';
    saveGame();
}

function goToVillage() {
    const diagScreen = document.getElementById('dialogue-screen');
    if(!diagScreen) return;
    diagScreen.style.display = 'flex';
    diagScreen.style.background = "linear-gradient(rgba(10, 15, 20, 0.6), rgba(5, 5, 10, 0.9)), url('img/village.png') center/cover";
    setTimeout(() => { diagScreen.style.opacity = '1'; }, 50);
    
    let avFile = (typeof getCurrentAvatarFile === 'function') ? getCurrentAvatarFile() : 'icons/av_mage.png';
    setDialoguePortrait(avFile, '🦹', '#00b3ff');
    
    let spk = document.getElementById('dlg-speaker'); 
    let pNameEl = document.getElementById('profile-player-name');
    if(spk) { spk.innerText = pNameEl ? pNameEl.innerText : "Герой"; spk.style.color = '#00b3ff'; }
    let txt = document.getElementById('dlg-text'); if(txt) txt.innerText = 'Что ж. Разорение и разруха здесь повсюду. Надо попробовать начать новую жизнь.';
    
    const options = document.getElementById('dlg-options'); if(options) options.innerHTML = '';
    let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Осмотреться';
    btn.onclick = () => { showTownHallStep(1); }; 
    if(options) options.appendChild(btn);
}

function enterTownHall() {
    if (!banditDefeated) return; 
    const diagScreen = document.getElementById('dialogue-screen');
    if(!diagScreen) return;
    diagScreen.style.display = 'flex';
    diagScreen.style.background = "linear-gradient(rgba(10, 15, 20, 0.6), rgba(5, 5, 10, 0.9)), url('img/village.png') center/cover";
    setTimeout(() => { diagScreen.style.opacity = '1'; }, 50);
    
    if (!townHallIntroDone) { showTownHallStep(1); } else { showTownHallStep(3); }
}

function showTownHallStep(step) {
    const speaker = document.getElementById('dlg-speaker'); 
    const text = document.getElementById('dlg-text');
    const options = document.getElementById('dlg-options'); 
    let pNameEl = document.getElementById('profile-player-name');
    const playerName = pNameEl ? pNameEl.innerText : "Герой";
    if(!options) return;
    options.innerHTML = '';

    if (step === 1) {
        let elderIcon = (typeof bossDialogueIcons !== 'undefined' && bossDialogueIcons['elder']) ? bossDialogueIcons['elder'] : 'icons/elder.png';
        setDialoguePortrait(elderIcon, '👴', '#a6a6a6');
        
        if(speaker) { speaker.innerText = 'Перепуганный староста'; speaker.style.color = '#ccc'; }
        if(text) text.innerText = 'Г-господин! Вы живой?! Ох, святые угодники... Год назад... этот проклятый некромант... он поднял наших мертвецов! Превратил их в послушных солдат и начал набеги. Кто-то примкнул к этому безумцу от страха, кто-то сбежал... А я не могу. Всю жизнь деревню эту строил, каждую доску сам вытесывал. Как же я её брошу?';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Успокойся. Я всё исправлю.'; btn.onclick = () => showTownHallStep(2); options.appendChild(btn);
    } 
    else if (step === 2) {
        let avFile = (typeof getCurrentAvatarFile === 'function') ? getCurrentAvatarFile() : 'icons/av_mage.png';
        setDialoguePortrait(avFile, '🦹', '#00b3ff');
        
        if(speaker) { speaker.innerText = playerName; speaker.style.color = '#00b3ff'; }
        
        let baseText = 'Я намерен восстановить эту деревню. И покончить с некромантом, потому что я Изба... нет, потому что по-другому нельзя. Мертвые должны упокоиться, а тот, кто совершил святотатство, должен познать мощь правосудия.';
        if (banditKilled) { 
            baseText += ' И я убью его за это. Без малейших сомнений.'; 
        } else { 
            baseText += ' Я найду его и заставлю ответить за содеянное. Накажу по всей строгости... правда, пока не решил как именно.'; 
        }
        if(text) text.innerText = baseText;
        
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Приступить к восстановлению';
        btn.onclick = () => {
            townHallIntroDone = true; 
            saveGame();
            const diagScreen = document.getElementById('dialogue-screen'); 
            if(diagScreen) diagScreen.style.opacity = '0';
            setTimeout(() => { 
                if(diagScreen) { diagScreen.style.display = 'none'; diagScreen.style.background = 'rgba(0, 0, 0, 0.7)'; }
                if (typeof switchTab === 'function') switchTab('domain', document.getElementById('nav-btn-domain')); 
                if (typeof updateMainCards === 'function') updateMainCards();
            }, 500);
        }; 
        options.appendChild(btn);
    }
    else if (step === 3) {
        let elderIcon = (typeof bossDialogueIcons !== 'undefined' && bossDialogueIcons['elder']) ? bossDialogueIcons['elder'] : 'icons/elder.png';
        setDialoguePortrait(elderIcon, '👴', '#a6a6a6');
        
        if(speaker) { speaker.innerText = 'Староста'; speaker.style.color = '#ccc'; }
        if(text) text.innerText = 'Мы готовы к работе, господин Избавитель. Ждем ваших указаний по восстановлению зданий. Откройте вкладку Домен!';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Я зайду позже.';
        btn.onclick = () => {
            const diagScreen = document.getElementById('dialogue-screen'); 
            if(diagScreen) diagScreen.style.opacity = '0';
            setTimeout(() => { 
                if(diagScreen) { diagScreen.style.display = 'none'; diagScreen.style.background = 'rgba(0, 0, 0, 0.7)'; }
            }, 500);
        }; 
        options.appendChild(btn);
    }
}

function tryGoToMidlock() {
    try {
        const diagScreen = document.getElementById('dialogue-screen');
        if(!diagScreen) return;
        diagScreen.style.display = 'flex';
        diagScreen.style.background = "rgba(0, 0, 0, 0.85)";
        setTimeout(() => { diagScreen.style.opacity = '1'; }, 50);

        if (typeof currentEliteBossIndex !== 'undefined' && currentEliteBossIndex > 5) {
            showMidlockTransitionStep(1);
        } else {
            let avFile = (typeof getCurrentAvatarFile === 'function') ? getCurrentAvatarFile() : 'icons/av_mage.png';
            setDialoguePortrait(avFile, '🦹', '#00b3ff');

            let spk = document.getElementById('dlg-speaker'); 
            let pNameEl = document.getElementById('profile-player-name');
            if(spk) { spk.innerText = pNameEl ? pNameEl.innerText : "Герой"; spk.style.color = '#00b3ff'; }
            
            let txt = document.getElementById('dlg-text'); 
            if(txt) txt.innerText = 'Я не готов двигаться дальше. Надо восстановить деревню и одолеть некроманта.';

            const options = document.getElementById('dlg-options'); 
            if(options) {
                options.innerHTML = '';
                let btn = document.createElement('button'); 
                btn.className = 'dialogue-btn'; 
                btn.innerText = 'Вернуться к делам'; 
                btn.onclick = () => {
                    midlockLocked = true;
                    saveGame();
                    diagScreen.style.opacity = '0'; 
                    setTimeout(() => { 
                        diagScreen.style.display = 'none'; 
                        if (typeof updateMainCards === 'function') updateMainCards(); 
                    }, 500);
                }; 
                options.appendChild(btn);
            }
        }
    } catch(e) { console.error("Ошибка tryGoToMidlock:", e); }
}

function showMidlockTransitionStep(step) {
    try {
        const speaker = document.getElementById('dlg-speaker'); 
        const text = document.getElementById('dlg-text');
        const options = document.getElementById('dlg-options'); 
        let pNameEl = document.getElementById('profile-player-name');
        const playerName = pNameEl ? pNameEl.innerText : "Герой";
        if(!options) return;
        options.innerHTML = '';

        let hasRing = false;
        if (typeof playerEquipped !== 'undefined' && playerEquipped && playerEquipped.ring === 'ring_necromancer') hasRing = true;
        if (typeof playerInventory !== 'undefined' && playerInventory && Array.isArray(playerInventory.equip) && playerInventory.equip.includes('ring_necromancer')) hasRing = true;

        if (step === 1) {
            let avFile = (typeof getCurrentAvatarFile === 'function') ? getCurrentAvatarFile() : 'icons/av_mage.png';
            setDialoguePortrait(avFile, '🦹', '#00b3ff');
            
            if(speaker) { speaker.innerText = playerName; speaker.style.color = '#00b3ff'; }
            if(text) text.innerText = 'Теперь пора двигаться дальше.';
            
            let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Далее'; 
            btn.onclick = () => hasRing ? showMidlockTransitionStep(2) : showMidlockTransitionStep(4); 
            options.appendChild(btn);
        } 
        else if (step === 2) {
            let elderIcon = (typeof bossDialogueIcons !== 'undefined' && bossDialogueIcons['elder']) ? bossDialogueIcons['elder'] : 'icons/elder.png';
            setDialoguePortrait(elderIcon, '👴', '#a6a6a6');
            
            if(speaker) { speaker.innerText = 'Староста'; speaker.style.color = '#ccc'; }
            if(text) text.innerText = 'Господин, подождите! Я вижу у вас кольцо этого чудовища... Прошу, отдайте его мне как знак победы над злом, чтобы мы сохранили его в назидание потомкам. Обещаю, я дам вам взамен нашу семейную реликвию.';
            
            let btnGive = document.createElement('button'); btnGive.className = 'dialogue-btn'; btnGive.innerText = 'Хорошо, держи. Оно мне ни к чему.'; 
            btnGive.onclick = () => showMidlockTransitionStep(3); 
            
            let btnKeep = document.createElement('button'); btnKeep.className = 'dialogue-btn'; btnKeep.innerText = 'Нет. Это мой трофей, он останется у меня.'; 
            btnKeep.onclick = () => showMidlockTransitionStep(4); 
            
            options.appendChild(btnGive); options.appendChild(btnKeep);
        } 
        else if (step === 3) {
            if (playerEquipped && playerEquipped.ring === 'ring_necromancer') playerEquipped.ring = null;
            else if (playerInventory && Array.isArray(playerInventory.equip)) {
                let idx = playerInventory.equip.indexOf('ring_necromancer');
                if (idx > -1) playerInventory.equip.splice(idx, 1);
            }
            if (playerInventory && Array.isArray(playerInventory.equip)) {
                playerInventory.equip.push('amulet_elder_cross');
            }
            saveGame();
            
            if(speaker) speaker.innerText = 'Староста';
            if(text) text.innerText = 'Безмерно благодарен! Как и обещал, вот Крест Старосты. Он защитит вас.';
            
            let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Спасибо.'; 
            btn.onclick = () => showMidlockTransitionStep(5); options.appendChild(btn);
        }
        else if (step === 4) {
            if(speaker) speaker.innerText = 'Староста';
            if(text) text.innerText = hasRing ? 'Как скажете, господин. Ваше право.' : 'Я хотел бы отблагодарить вас...';
            
            let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Далее'; 
            btn.onclick = () => showMidlockTransitionStep(5); options.appendChild(btn);
        }
        else if (step === 5) {
            if(speaker) speaker.innerText = 'Староста';
            if(text) text.innerText = 'Смотрите, что я еще нашел! Это кристалл из поместья нашего бывшего хозяина. С его помощью вы сможете всегда вернуться в деревню, куда бы вас ни забросила судьба. Берегите себя!';
            
            let btnWarm = document.createElement('button'); btnWarm.className = 'dialogue-btn'; btnWarm.style.color = '#00ffcc'; 
            btnWarm.innerText = 'Прощай, старый друг. Береги деревню. (Тепло попрощаться)'; 
            btnWarm.onclick = () => {
                playerRighteousness += 1;
                saveGame(); closeDialogueView(); startMidlockCutscene();
            }; 
            
            let btnCold = document.createElement('button'); btnCold.className = 'dialogue-btn'; btnCold.style.color = '#ff4d4d'; 
            btnCold.innerText = 'Молча забрать кристалл и уйти. (Проигнорировать)'; 
            btnCold.onclick = () => {
                playerApostasy += 1;
                saveGame(); closeDialogueView(); startMidlockCutscene();
            }; 
            
            options.appendChild(btnWarm); options.appendChild(btnCold);
        }
    } catch(e) { console.error("Ошибка showMidlockTransitionStep:", e); }
}

function startMidlockCutscene() {
    let hub = document.getElementById('game-hub'); if(hub) hub.style.opacity = '0';
    let sBtn = document.getElementById('skip-btn'); if(sBtn) sBtn.style.display = 'none'; 
    
    setTimeout(() => {
        if(hub) hub.style.display = 'none';
        const storyContainer = document.getElementById('story-container');
        if(storyContainer) storyContainer.style.display = 'flex';
        
        currentIndex = 0;
        activeCutscene = 'midlock'; 
        
        showMidlockSlide();
    }, 1000);
}

function showMidlockSlide() {
    if (typeof midlockIntroData === 'undefined') return;
    if (currentIndex >= midlockIntroData.length) { 
        const storyContainer = document.getElementById('story-container');
        if(storyContainer) storyContainer.style.display = 'none';
        
        midlockIntroDone = true;
        saveGame();

        const hub = document.getElementById('game-hub');
        if(hub) {
            hub.style.display = 'flex'; 
            setTimeout(() => { 
                hub.style.opacity = '1'; 
                if (typeof updateMainCards === 'function') updateMainCards(); 
            }, 50);
        }
        return; 
    }
    
    const currentSlide = midlockIntroData[currentIndex];
    const imgElement = document.getElementById('story-image');
    if(imgElement) imgElement.src = currentSlide.img;
    let txt = document.getElementById('story-text');
    if(txt) txt.innerText = currentSlide.text;
    
    setTimeout(() => { 
        if(imgElement) imgElement.style.opacity = '1'; 
        if(txt) txt.style.opacity = '1'; 
        let hint = document.getElementById('continue-hint');
        if(hint) hint.style.opacity = '1'; 
        isTransitioning = false; 
    }, 50);
}

// === НОВЫЙ ДИАЛОГ С НЕЗНАКОМКОЙ (ПОСЛЕ ДУХА) ===
window.startPostSpiritDialogue = function() {
    const diagScreen = document.getElementById('dialogue-screen');
    if(!diagScreen) return;
    diagScreen.style.display = 'flex';
    diagScreen.style.background = "rgba(0, 0, 0, 0.85)";
    setTimeout(() => { diagScreen.style.opacity = '1'; }, 50);
    showPostSpiritStep(1);
}

window.showPostSpiritStep = function(step) {
    const speaker = document.getElementById('dlg-speaker'); 
    const text = document.getElementById('dlg-text');
    const options = document.getElementById('dlg-options'); 
    let pNameEl = document.getElementById('profile-player-name');
    const playerName = pNameEl ? pNameEl.innerText : "Герой";
    if(!options) return;
    options.innerHTML = '';

    if (step === 1) {
        let avFile = (typeof getCurrentAvatarFile === 'function') ? getCurrentAvatarFile() : 'icons/av_mage.png';
        setDialoguePortrait(avFile, '🦹', '#00b3ff');
        
        if(speaker) { speaker.innerText = playerName; speaker.style.color = '#00b3ff'; }
        if(text) text.innerText = 'Природа его силы... удивительна. Но она настораживает меня. Это не простое проклятье некроманта.';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Осмотреться...'; 
        btn.onclick = () => showPostSpiritStep(2); options.appendChild(btn);
    } else if (step === 2) {
        let girlIcon = (typeof bossDialogueIcons !== 'undefined' && bossDialogueIcons['girl']) ? bossDialogueIcons['girl'] : 'icons/girl_knight.png';
        setDialoguePortrait(girlIcon, '🤺', '#ffcccc');
        
        if(speaker) { speaker.innerText = 'Незнакомка в доспехах'; speaker.style.color = '#ffcccc'; }
        if(text) text.innerText = '(Слышен лязг доспехов, и из-за колонны внезапно выходит вооруженная девушка) Стой, где стоишь! Кто ты такой?! Отвечай живо, пока я не отрубила тебе голову!';
        
        let btn1 = document.createElement('button'); btn1.className = 'dialogue-btn'; btn1.style.color = '#00ffcc'; btn1.innerText = 'Я - друг'; 
        btn1.onclick = () => showGirlPreBattleStep('friend'); 
        
        let btn2 = document.createElement('button'); btn2.className = 'dialogue-btn'; btn2.style.color = '#ff4d4d'; btn2.innerText = 'Я - Избавитель'; 
        btn2.onclick = () => showGirlPreBattleStep('deliverer'); 
        
        options.appendChild(btn1); options.appendChild(btn2);
    }
}

window.showGirlPreBattleStep = function(choice) {
    const text = document.getElementById('dlg-text');
    const options = document.getElementById('dlg-options'); 
    options.innerHTML = '';

    if (choice === 'friend') {
        if(text) text.innerText = 'Не пытайся меня обмануть. Я вижу злой блеск в твоих глазах.';
    } else {
        if(text) text.innerText = 'Ага, а я тогда - королева Алисия. Готовься к смерти, лжец.';
    }

    let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.style.color = '#ff0000'; btn.innerText = 'Принять бой!'; 
    btn.onclick = () => {
        const diagScreen = document.getElementById('dialogue-screen');
        if(diagScreen) diagScreen.style.opacity = '0'; 
        setTimeout(() => { 
            if(diagScreen) diagScreen.style.display = 'none'; 
            if (typeof startBattle === 'function') startBattle('girl'); 
        }, 500);
    }; 
    options.appendChild(btn);
}

// === ПОСЛЕ ПОРАЖЕНИЯ ОТ НЕЗНАКОМКИ ===
window.startGirlPostBattleDialogue = function() {
    const diagScreen = document.getElementById('dialogue-screen');
    if(!diagScreen) return;
    diagScreen.style.display = 'flex';
    diagScreen.style.background = "rgba(0, 0, 0, 0.85)";
    setTimeout(() => { diagScreen.style.opacity = '1'; }, 50);
    showGirlPostBattleStep(1);
}

window.showGirlPostBattleStep = function(step) {
    const speaker = document.getElementById('dlg-speaker'); 
    const text = document.getElementById('dlg-text');
    const options = document.getElementById('dlg-options'); 
    let pNameEl = document.getElementById('profile-player-name');
    const playerName = pNameEl ? pNameEl.innerText : "Герой";
    if(!options) return;
    options.innerHTML = '';

    if (step === 1) {
        let girlIcon = (typeof bossDialogueIcons !== 'undefined' && bossDialogueIcons['girl']) ? bossDialogueIcons['girl'] : 'icons/girl_knight.png';
        setDialoguePortrait(girlIcon, '🤺', '#ffcccc');
        
        if(speaker) { speaker.innerText = 'Незнакомка в доспехах'; speaker.style.color = '#ffcccc'; }
        if(text) text.innerText = 'Подожди... Твоя боевая аура... Она так похожа на ауру друга моего отца, Избавителя Грейсмонда. Но он погиб, когда мне было 10 лет...';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Отдышаться и подняться...'; 
        btn.onclick = () => showGirlPostBattleStep(2); options.appendChild(btn);
    } else if (step === 2) {
        let avFile = (typeof getCurrentAvatarFile === 'function') ? getCurrentAvatarFile() : 'icons/av_mage.png';
        setDialoguePortrait(avFile, '🦹', '#00b3ff');
        
        if(speaker) { speaker.innerText = playerName; speaker.style.color = '#00b3ff'; }
        if(text) text.innerText = 'Давай поговорим.';
        
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Продолжить'; 
        btn.onclick = () => {
            closeDialogueView();
        }; 
        options.appendChild(btn);
    }
}

function startPostHealerDialogue() {
    const diagScreen = document.getElementById('dialogue-screen');
    if(!diagScreen) return;
    diagScreen.style.display = 'flex';
    diagScreen.style.background = "rgba(0, 0, 0, 0.85)";
    setTimeout(() => { diagScreen.style.opacity = '1'; }, 50);

    showPostHealerStep(1);
}

function showPostHealerStep(step) {
    const speaker = document.getElementById('dlg-speaker'); 
    const text = document.getElementById('dlg-text');
    const options = document.getElementById('dlg-options'); 
    let pNameEl = document.getElementById('profile-player-name');
    const playerName = pNameEl ? pNameEl.innerText : "Герой";
    if(!options) return;
    options.innerHTML = '';

    if (step === 1) {
        let avFile = (typeof getCurrentAvatarFile === 'function') ? getCurrentAvatarFile() : 'icons/av_mage.png';
        setDialoguePortrait(avFile, '🦹', '#00b3ff');
        
        if(speaker) { speaker.innerText = playerName; speaker.style.color = '#00b3ff'; }
        if(text) text.innerText = 'Это был последний. Похоже, у некроманта закончились марионетки.';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Продолжить'; btn.onclick = () => showPostHealerStep(2); options.appendChild(btn);
    } else if (step === 2) {
        let elderIcon = (typeof bossDialogueIcons !== 'undefined' && bossDialogueIcons['elder']) ? bossDialogueIcons['elder'] : 'icons/elder.png';
        setDialoguePortrait(elderIcon, '👴', '#a6a6a6');
        
        if(speaker) { speaker.innerText = 'Староста'; speaker.style.color = '#ccc'; }
        if(text) text.innerText = 'Не расслабляйтесь, господин. Перед боем с ним вам лучше отточить свои навыки до максимума, иначе быть беде.';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Я буду готов.'; 
        btn.onclick = () => {
            necromancerUnlocked = true;
            saveGame();
            closeDialogueView();
        }; 
        options.appendChild(btn);
    }
}

function startPreNecromancerDialogue() {
    const diagScreen = document.getElementById('dialogue-screen');
    if(!diagScreen) return;
    diagScreen.style.display = 'flex';
    diagScreen.style.background = "linear-gradient(rgba(10, 15, 20, 0.9), rgba(20, 0, 0, 0.95))";
    setTimeout(() => { diagScreen.style.opacity = '1'; }, 50);
    showPreNecromancerStep(1);
}

function showPreNecromancerStep(step) {
    const speaker = document.getElementById('dlg-speaker'); 
    const text = document.getElementById('dlg-text');
    const options = document.getElementById('dlg-options'); 
    let pNameEl = document.getElementById('profile-player-name');
    const playerName = pNameEl ? pNameEl.innerText : "Герой";
    if(!options) return;
    options.innerHTML = '';

    if (step === 1) {
        let necroIcon = (typeof bossDialogueIcons !== 'undefined' && bossDialogueIcons['necromancer']) ? bossDialogueIcons['necromancer'] : 'icons/necromage.png';
        setDialoguePortrait(necroIcon, '🧙‍♂️', '#8b0000');
        
        if(speaker) { speaker.innerText = 'Некромант'; speaker.style.color = '#ff4d4d'; }
        if(text) text.innerText = 'Глупец. Не строй из себя героя. Твои драгоценные Избавители сидят в своих теплых дворцах, далеко отсюда. Они не спасут эти гниющие земли, как не спасут и тебя.';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Ответить...'; btn.onclick = () => showPreNecromancerStep(2); options.appendChild(btn);
    } else if (step === 2) {
        let avFile = (typeof getCurrentAvatarFile === 'function') ? getCurrentAvatarFile() : 'icons/av_mage.png';
        setDialoguePortrait(avFile, '🦹', '#00b3ff');
        
        if(speaker) { speaker.innerText = playerName; speaker.style.color = '#00b3ff'; }
        if(text) text.innerText = 'Я и есть Избавитель.';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.style.color = '#ff4d4d'; btn.innerText = 'В бой!'; 
        btn.onclick = () => {
            necromancerIntroDone = true;
            saveGame();
            const diagScreen = document.getElementById('dialogue-screen');
            if(diagScreen) diagScreen.style.opacity = '0'; 
            setTimeout(() => { 
                if(diagScreen) diagScreen.style.display = 'none'; 
                if (typeof startBattle === 'function') startBattle('elite'); 
            }, 500);
        }; 
        options.appendChild(btn);
    }
}

function startEndingCutscene() {
    let hub = document.getElementById('game-hub'); if(hub) hub.style.opacity = '0';
    let sBtn = document.getElementById('skip-btn'); if(sBtn) sBtn.style.display = 'none'; 
    
    setTimeout(() => {
        if(hub) hub.style.display = 'none';
        
        const storyContainer = document.getElementById('story-container');
        if(storyContainer) storyContainer.style.display = 'flex';
        
        currentIndex = 0;
        isEndingPhase = true; 
        saveGame();
        
        showEndingSlide();
    }, 1000);
}

function showEndingSlide() {
    if (typeof endingData === 'undefined') return;
    if (currentIndex >= endingData.length) { 
        const storyContainer = document.getElementById('story-container');
        if(storyContainer) storyContainer.style.display = 'none';
        
        const blackScreen = document.getElementById('black-screen-ending');
        if(blackScreen) {
            blackScreen.innerHTML = '<p>Тьма отступила...<br>Но это лишь начало вашего пути.<br><br><span style="color:#d4af37;">Спасибо за игру!</span></p>';
            blackScreen.style.display = 'flex'; 
        }
        setTimeout(() => { if(blackScreen) blackScreen.style.opacity = '1'; }, 50);
        
        setTimeout(() => {
            if(blackScreen) blackScreen.style.opacity = '0';
            setTimeout(() => {
                if(blackScreen) blackScreen.style.display = 'none';
                const hub = document.getElementById('game-hub');
                if(hub) {
                    hub.style.display = 'flex';
                    setTimeout(() => { 
                        hub.style.opacity = '1'; 
                        isEndingPhase = false; 
                        if (typeof updateMainCards === 'function') updateMainCards(); 
                    }, 50);
                }
            }, 2000);
        }, 5000);
        
        return; 
    }
    
    const currentSlide = endingData[currentIndex];
    const imgElement = document.getElementById('story-image');
    if(imgElement) imgElement.src = currentSlide.img;
    let txt = document.getElementById('story-text');
    if(txt) txt.innerText = currentSlide.text;
    
    setTimeout(() => { 
        if(imgElement) imgElement.style.opacity = '1'; 
        if(txt) txt.style.opacity = '1'; 
        let hint = document.getElementById('continue-hint');
        if(hint) hint.style.opacity = '1'; 
        isTransitioning = false; 
    }, 50);
}

function startArenaIntroDialogue() {
    const diagScreen = document.getElementById('dialogue-screen');
    if(!diagScreen) return;
    diagScreen.style.display = 'flex';
    diagScreen.style.background = "linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 20, 40, 0.95))";
    setTimeout(() => { diagScreen.style.opacity = '1'; }, 50);
    showArenaIntroStep(1);
}

function showArenaIntroStep(step) {
    const speaker = document.getElementById('dlg-speaker'); 
    const text = document.getElementById('dlg-text');
    const options = document.getElementById('dlg-options'); 
    if(!options) return;
    options.innerHTML = '';

    if (step === 1) {
        let ghostIcon = (typeof bossDialogueIcons !== 'undefined' && bossDialogueIcons['ghost']) ? bossDialogueIcons['ghost'] : 'icons/ghost_dialogue.png'; 
        setDialoguePortrait(ghostIcon, '👻', '#00ffff');
        
        if(speaker) { speaker.innerText = 'Таинственный призрак'; speaker.style.color = '#00ffff'; }
        if(text) text.innerText = 'Снова мы встретились... Твоя аура стала плотнее. Достигнув 8-го уровня, ты доказал, что твоя сила — не случайность. Ты не так прост, как кажешься.';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'К чему ты клонишь?'; btn.onclick = () => showArenaIntroStep(2); options.appendChild(btn);
    } 
    else if (step === 2) {
        if(text) text.innerText = 'Пришло время испытать тебя по-настоящему. Я открою тебе врата Арены — места, где скрещиваются судьбы воителей из других миров. Сразись с их фантомами, докажи свою мощь, и я щедро награжу тебя.';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.style.color = '#ffd700'; btn.innerText = 'Я готов к испытанию (Разблокировать Арену)'; 
        btn.onclick = () => {
            arenaUnlocked = true;
            arenaGhostIntroDone = true;
            etherealFlowers = 5; 
            if(typeof saveGame === 'function') saveGame();
            closeDialogueView();
            if(typeof showLootAlert === 'function') {
                showLootAlert('🛡️ <b>АРЕНА РАЗБЛОКИРОВАНА!</b><br><br>В главном меню теперь доступен режим PvP. Сражайтесь с фантомами других игроков и поднимайтесь по лигам!');
            }
            if(typeof updateMainCards === 'function') updateMainCards();
        }; 
        options.appendChild(btn);
    }
}

window.startRoadsIntroDialogue = function() {
    const diagScreen = document.getElementById('dialogue-screen');
    if(!diagScreen) return;
    diagScreen.style.display = 'flex';
    diagScreen.style.background = "linear-gradient(rgba(0, 0, 0, 0.9), rgba(20, 0, 40, 0.95))";
    setTimeout(() => { diagScreen.style.opacity = '1'; }, 50);
    showRoadsIntroStep(1);
};

window.showRoadsIntroStep = function(step) {
    const speaker = document.getElementById('dlg-speaker'); 
    const text = document.getElementById('dlg-text');
    const options = document.getElementById('dlg-options'); 
    if(!options) return;
    options.innerHTML = '';

    if (step === 1) {
        let ghostIcon = (typeof bossDialogueIcons !== 'undefined' && bossDialogueIcons['ghost']) ? bossDialogueIcons['ghost'] : 'icons/ghost_dialogue.png'; 
        setDialoguePortrait(ghostIcon, '👻', '#d4af37');
        
        if(speaker) { speaker.innerText = 'Таинственный дух'; speaker.style.color = '#d4af37'; }
        if(text) text.innerText = 'Твоя сила растет, Избавитель. С достижением седьмого уровня твой взор проникает сквозь иллюзии этого мира. Я открываю для тебя Неизведанные Дороги. Там тебя ждут древние чудовища и несметные богатства.';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.innerText = 'Я готов к новому пути.'; btn.onclick = () => showRoadsIntroStep(2); options.appendChild(btn);
    } else if (step === 2) {
        if(text) text.innerText = 'Дороги изменчивы. Каждые 4 часа пути меняются, а их опасность то возрастает, то падает. Ты сможешь пройти лишь по одной из них за цикл. Выбирай с умом.';
        let btn = document.createElement('button'); btn.className = 'dialogue-btn'; btn.style.color = '#00ffcc'; btn.innerText = 'Показать Дороги'; 
        btn.onclick = () => {
            roadsIntroDone = true;
            if(typeof saveGame === 'function') saveGame();
            closeDialogueView();
            if(typeof renderRoadsTab === 'function') renderRoadsTab();
            if(typeof openSubTab === 'function') openSubTab('tab-roads');
        }; 
        options.appendChild(btn);
    }
};