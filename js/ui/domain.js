// ==========================================
// ДОМЕН И ДЕРЕВНЯ (js/ui/domain.js)
// ==========================================

function renderDomain() {
    const container = document.getElementById('domain-unlocked');
    if (!container) return;

    let pWood = typeof playerWood !== 'undefined' ? playerWood : 0;
    let pStone = typeof playerStone !== 'undefined' ? playerStone : 0;

    let html = `
        <div style="padding: 15px; text-align: center; border-bottom: 1px solid #5a6e9c; margin-bottom: 15px;">
            <h3 style="color: #00b3ff; margin-top:0;">Склад поселения</h3>
            <div style="display:flex; justify-content:center; gap: 20px; font-size: 1.2rem; font-weight: bold;">
                <span style="color:#cd853f;">🪵 ${pWood}</span>
                <span style="color:#a9a9a9;">🧱 ${pStone}</span>
            </div>
            <p style="font-size: 0.8rem; color:#aaa; margin-top: 10px;">Добывайте шкуры на охоте и обменивайте их у старосты в инвентаре.</p>
        </div>
    `;

    if (typeof townHallRebuilt === 'undefined' || !townHallRebuilt) {
        let canBuild = (pWood >= 50 && pStone >= 25);
        html += `
            <div style="background: rgba(0,0,0,0.5); border: 1px solid #5a6e9c; border-radius: 8px; padding: 15px; margin-bottom: 15px; text-align:center;">
                <div style="font-size: 3rem;">🏚️</div>
                <h3 style="color:#fff; margin: 10px 0;">Ратуша (Руины)</h3>
                <p style="font-size: 0.9rem; color:#aaa;">Сердце деревни. Восстановите её, чтобы начать масштабное строительство.</p>
                <div style="margin: 10px 0; color: ${canBuild ? '#00ff00' : '#ff4d4d'};">
                    Цена: 50 🪵 / 25 🧱
                </div>
                <button class="btn-quest ${canBuild ? 'active' : 'disabled'}" style="width:100%; padding:10px;" onclick="buildTownHall()">Восстановить Ратушу</button>
            </div>
        `;
    } else {
        html += `
            <div style="background: rgba(0,255,0,0.1); border: 1px solid #00ff00; border-radius: 8px; padding: 15px; margin-bottom: 15px; text-align:center;">
                <div style="font-size: 3rem;">🏛️</div>
                <h3 style="color:#00ff00; margin: 10px 0;">Ратуша (Ур. 1)</h3>
                <p style="font-size: 0.9rem; color:#aaa;">Сердце деревни бьется вновь. Староста доволен.</p>
            </div>
            <div style="display:flex; gap: 10px;">
                <div style="flex:1; background: rgba(0,0,0,0.5); border: 1px dashed #5a6e9c; border-radius: 8px; padding: 15px; text-align:center; opacity:0.7;">
                    <div style="font-size: 2rem;">🪚</div>
                    <h4 style="color:#fff; margin: 5px 0;">Лесопилка</h4>
                    <button class="btn-quest disabled" style="width:100%; font-size:0.8rem;">Скоро</button>
                </div>
                <div style="flex:1; background: rgba(0,0,0,0.5); border: 1px dashed #5a6e9c; border-radius: 8px; padding: 15px; text-align:center; opacity:0.7;">
                    <div style="font-size: 2rem;">⛏️</div>
                    <h4 style="color:#fff; margin: 5px 0;">Каменоломня</h4>
                    <button class="btn-quest disabled" style="width:100%; font-size:0.8rem;">Скоро</button>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

window.buildTownHall = function() {
    if (playerWood < 50 || playerStone < 25) {
        showLootAlert("Недостаточно ресурсов для строительства!");
        return;
    }
    playerWood -= 50;
    playerStone -= 25;
    townHallRebuilt = true;
    saveGame();
    renderDomain();
    showLootAlert(`🏛️ <b>РАТУША ВОССТАНОВЛЕНА!</b><br><br><small>Вы заложили крепкий фундамент для будущего поселения. Теперь можно планировать новые постройки.</small>`);
}

function depositBank() {
    let inp = document.getElementById('bank-input');
    if(!inp) return;
    let amount = parseInt(inp.value);
    if (isNaN(amount) || amount <= 0) return;
    if (amount > playerDiamonds) { showLootAlert("У вас нет столько кристаллов!"); return; }
    playerDiamonds -= amount; playerBankDiamonds += amount;
    inp.value = "";
    updateResourceUI(); updateStatsUI(); updateBankUI(); saveGame();
    showLootAlert(`Вы спрятали <b>${amount}</b> <img src="icons/diamond.png" class="ui-icon"> в копилку.`);
}

function withdrawBank() {
    let inp = document.getElementById('bank-input');
    if(!inp) return;
    let amount = parseInt(inp.value);
    if (isNaN(amount) || amount <= 0) return;
    if (amount > playerBankDiamonds) { showLootAlert("В копилке нет столько кристаллов!"); return; }
    playerBankDiamonds -= amount; playerDiamonds += amount;
    inp.value = "";
    updateResourceUI(); updateStatsUI(); updateBankUI(); saveGame();
    showLootAlert(`Вы забрали <b>${amount}</b> <img src="icons/diamond.png" class="ui-icon"> из копилки.`);
}

function updateBankUI() {
    let safeD = (typeof playerDiamonds !== 'undefined' && !isNaN(playerDiamonds)) ? playerDiamonds : 0;
    let safeB = (typeof playerBankDiamonds !== 'undefined' && !isNaN(playerBankDiamonds)) ? playerBankDiamonds : 0;
    let bHand = document.getElementById('bank-hand'); let bBal = document.getElementById('bank-balance');
    if(bHand) bHand.innerHTML = `<img src="icons/diamond.png" class="ui-icon"> ${safeD.toLocaleString()}`;
    if(bBal) bBal.innerHTML = `<img src="icons/diamond.png" class="ui-icon"> ${safeB.toLocaleString()}`;
}