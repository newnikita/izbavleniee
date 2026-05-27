// ==========================================
// ЕЖЕДНЕВНЫЕ ПОРУЧЕНИЯ (js/gameplay/quests.js)
// Система заданий и начисление наград
// ==========================================

function updateQuestProgress(type, amount) {
    if(typeof quests === 'undefined' || !quests) return;
    let q = quests.find(q => q.type === type && !q.claimed);
    if (q && q.current < q.target) {
        q.current += amount;
        if (q.current > q.target) q.current = q.target;
        if (typeof saveGame === 'function') saveGame();
        let tabQuests = document.getElementById('tab-quests');
        if (tabQuests && tabQuests.classList.contains('active') && typeof renderQuests === 'function') renderQuests();
    }
}

function claimQuestReward(id) {
    if(typeof quests === 'undefined' || !quests) return;
    let q = quests.find(q => q.id === id);
    if (q && q.current >= q.target && !q.claimed) {
        q.claimed = true; 
        if (typeof playerGold !== 'undefined') playerGold += q.rewardGold; 
        if(typeof gainXp === 'function') gainXp(q.rewardXp);
        if (typeof saveGame === 'function') saveGame(); 
        if (typeof updateResourceUI === 'function') updateResourceUI(); 
        if (typeof renderQuests === 'function') renderQuests();
        if (typeof showLootAlert === 'function') {
            showLootAlert(`📜 <b>Задание выполнено!</b><br><br>Получена награда:<br>${q.rewardGold > 0 ? q.rewardGold + ' <img src="icons/gold.png" class="ui-icon"><br>' : ''}${q.rewardXp} Опыта`);
        }
    }
}

function renderQuests() {
    if(typeof quests === 'undefined' || !quests) return;
    let html = ""; 
    let activeQuests = quests.filter(q => !q.claimed);
    
    if (activeQuests.length === 0) {
        html += `<div style="padding: 20px; text-align: center; color: #88a3d6;">Заданий больше нет. Вы отлично поработали!</div>`;
    }
    
    activeQuests.forEach(q => {
        let isComplete = q.current >= q.target;
        let btnHtml = isComplete ? `<div class="btn-quest active" onclick="claimQuestReward('${q.id}')">Забрать награду</div>` : `<div class="btn-quest disabled">${q.current}/${q.target}</div>`;
        html += `<div class="quest-card">
                    <div class="quest-icon"><img src="icons/quests.png" class="ui-icon"></div>
                    <div class="quest-info">
                        <div class="quest-title">${q.title}</div>
                        <div class="quest-desc" style="font-size: 0.8rem; color: #aaa; margin: 4px 0;">${q.desc}</div>
                        <div class="quest-reward">Награда: ${q.rewardGold > 0 ? q.rewardGold + ' <img src="icons/gold.png" class="ui-icon">, ' : ''}${q.rewardXp} XP</div>
                        ${btnHtml}
                    </div>
                </div>`;
    });
    
    let completedQuests = quests.filter(q => q.claimed);
    if (completedQuests.length > 0) {
         html += `<div class="inv-section-title mt10">✅ Выполненные</div>`;
         completedQuests.forEach(q => { 
             html += `<div class="quest-card" style="opacity: 0.5;">
                        <div class="quest-icon" style="filter: grayscale(100%);"><img src="icons/quests.png" class="ui-icon"></div>
                        <div class="quest-info">
                            <div class="quest-title" style="text-decoration: line-through;">${q.title}</div>
                            <div class="quest-desc" style="font-size: 0.8rem; color: #777; margin: 4px 0;">Выполнено</div>
                        </div>
                    </div>`; 
         });
    }
    
    let questList = document.getElementById('quest-list'); 
    if (questList) questList.innerHTML = html;
}