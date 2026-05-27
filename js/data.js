// ==========================================
// БИБЛИОТЕКА ЗНАНИЙ (js/core/data.js)
// Здесь хранятся все статические данные игры
// ==========================================

const ClassDictionary = {
    "Защитник": {
        icon: "🛡️",
        baseStats: { hp: 500, shield: 1 },
        spells: [
            { id: 'base', name: "💥 Магический удар", desc: "Мощная атака чистой магией. Урон зависит от маны.", icon: "icons/spell_strike.png", emoji: "💥" },
            { id: 'shield', name: "🔮 Элементарный щит", desc: "Поглощает 50% урона.", icon: "icons/spell_shield.png", emoji: "🔮" },
            { id: 'constanta', name: "🌌 Константа", desc: "Снижает урон до 1. В бою заменяет Щит (шанс 40%).", icon: "", emoji: "🌌", isLibrary: true }
        ]
    },
    "Целитель": {
        icon: "🌿",
        baseStats: { hp: 600, shield: 0 },
        spells: [
            { id: 'base', name: "💥 Магический удар", desc: "Мощная атака чистой магией. Урон зависит от маны.", icon: "icons/spell_strike.png", emoji: "💥" },
            { id: 'heal', name: "🌿 Исцеление", desc: "Восстанавливает часть здоровья за счет маны.", icon: "", emoji: "🌿" },
            { id: 'stun_undead', name: "✨ Изгнание нежити", desc: "Оглушает нежить на 2 атаки. Не работает на других.", icon: "", emoji: "✨", isLibrary: true }
        ]
    },
    "Аннигилятор": {
        icon: "🔥",
        baseStats: { hp: 350, shield: 0 },
        spells: [
            { id: 'base', name: "💥 Магический удар", desc: "Мощная атака чистой магией. Урон зависит от маны.", icon: "icons/spell_strike.png", emoji: "💥" },
            { id: 'firestorm', name: "🔥 Буря огня", desc: "Наносит вдвое больше урона.", icon: "", emoji: "🔥" },
            { id: 'anti_undead', name: "☄️ Свергающий огонь", desc: "Огромный доп. урон по нежити.", icon: "", emoji: "☄️", isLibrary: true }
        ]
    },
    "Искуситель": {
        icon: "👁️",
        baseStats: { hp: 400, shield: 0 },
        spells: [
            { id: 'base', name: "💥 Магический удар", desc: "Мощная атака чистой магией. Урон зависит от маны.", icon: "icons/spell_strike.png", emoji: "💥" },
            { id: 'blind', name: "👁️ Ослепление", desc: "Враг промахнется следующей атакой.", icon: "", emoji: "👁️" },
            { id: 'mind_control', name: "🎭 Контроль сознания", desc: "Враг нанесет следующий удар самому себе.", icon: "", emoji: "🎭", isLibrary: true }
        ]
    },
    "Друид": {
        icon: "🐺",
        baseStats: { hp: 450, shield: 0 },
        spells: [
            { id: 'base', name: "💥 Магический удар", desc: "Мощная атака чистой магией. Урон зависит от маны.", icon: "icons/spell_strike.png", emoji: "💥" },
            { id: 'spirit', name: "🐺 Призыв духа", desc: "Защитный дух принимает 30% урона на себя.", icon: "", emoji: "🐺" },
            { id: 'release', name: "🌪️ Высвобождение", desc: "Дух обрушивает впитанный урон на врага.", icon: "", emoji: "🌪️", isLibrary: true }
        ]
    }
};

const beasts = [
    { id: 'boar', name: "Дикий кабан", icon: "icons/boar.png", emoji: "🐗", hp: 150, dmg: 80 },
    { id: 'wolf', name: "Дикий волк", icon: "icons/wolf.png", emoji: "🐺", hp: 180, dmg: 90 },
    { id: 'fox', name: "Дикий лис", icon: "icons/fox.png", emoji: "🦊", hp: 120, dmg: 110 },
    { id: 'eagle', name: "Хищный орел", icon: "icons/eagle.png", emoji: "🦅", hp: 140, dmg: 100 }
];

const eliteUndead = [
    { id: 'boss_anni', name: "Мертвец-Аннигилятор", icon: "icons/undead_annig.png", emoji: "🧟🔥", hp: 1500, dmg: 100, rewardGold: 300, rewardXp: 150, ability: "exhaustion", drop: "ring_ember" },
    { id: 'boss_def', name: "Мертвец-Защитник", icon: "icons/undead_safe.png", emoji: "🧟🛡️", hp: 2500, dmg: 120, rewardGold: 500, rewardXp: 220, ability: "shield", drop: "rusty_chest" },
    { id: 'boss_druid', name: "Мертвец-Друид", icon: "icons/undead_druo.png", emoji: "🧟🐺", hp: 2200, dmg: 140, rewardGold: 800, rewardXp: 300, ability: "spirit", drop: "amulet_absorb" },
    { id: 'boss_tempter', name: "Мертвец-Искуситель", icon: "icons/undead_tempter.png", emoji: "🧟👁️", hp: 2800, dmg: 180, rewardGold: 1200, rewardXp: 400, ability: "blind", drop: "eye_truth" },
    { id: 'boss_healer', name: "Мертвец-Целитель", icon: "icons/undead_healer.png", emoji: "🧟🌿", hp: 4500, dmg: 80, rewardGold: 2000, rewardXp: 600, ability: "rot", drop: "tome_deliverer" },
    { id: 'boss_necromancer', name: "Некромант", icon: "icons/necromage.png", emoji: "🧙‍♂️", hp: 6000, dmg: 200, rewardGold: 5000, rewardXp: 2000, ability: "all", drop: "" }
];

const itemsDB = {
    "beast_skin": { id: "beast_skin", type: "resource", name: "Шкура зверя", desc: "Обменяйте у старосты на стройматериалы или продайте.", icon: "🐻" },

    "magic_book": { id: "magic_book", type: "skill_book", name: "Книга магии", desc: "Прокачивает Магический удар. Обычная.", icon: "📘" },
    "book_shield": { id: "book_shield", type: "skill_book", name: "Книга Элементарного щита", desc: "Редкая.", icon: "📕" },
    "book_heal": { id: "book_heal", type: "skill_book", name: "Книга Исцеления", desc: "Редкая.", icon: "📕" },
    "book_firestorm": { id: "book_firestorm", type: "skill_book", name: "Книга Бури огня", desc: "Редкая.", icon: "📕" },
    "book_blind": { id: "book_blind", type: "skill_book", name: "Книга Ослепления", desc: "Редкая.", icon: "📕" },
    "book_spirit": { id: "book_spirit", type: "skill_book", name: "Книга Призыва духа", desc: "Редкая.", icon: "📕" },
    "book_constanta": { id: "book_constanta", type: "skill_book", name: "Трактат Константы", desc: "Эпическая.", icon: "📙" },
    "book_stun_undead": { id: "book_stun_undead", type: "skill_book", name: "Трактат Изгнания", desc: "Эпическая.", icon: "📙" },
    "book_anti_undead": { id: "book_anti_undead", type: "skill_book", name: "Трактат Свергающего огня", desc: "Эпическая.", icon: "📙" },
    "book_mind_control": { id: "book_mind_control", type: "skill_book", name: "Трактат Контроля сознания", desc: "Эпическая.", icon: "📙" },
    "book_release": { id: "book_release", type: "skill_book", name: "Трактат Высвобождения", desc: "Эпическая.", icon: "📙" },
    "tome_of_mind": { id: "tome_of_mind", type: "consumable", name: "Тайный трактат: Подчинение", desc: "Позволяет применять Контроль разума на элитных боссах.", icon: "📕" },
    "tome_deliverer": { id: "tome_deliverer", type: "consumable", name: "Том Избавителя", desc: "Открывает легендарную магию.", icon: "📙" },
    
    "ring_necromancer": { id: "ring_necromancer", type: "equip", slot: "ring", name: "Кольцо Некроманта", desc: "Спасает от смертельного удара. Ломается при снятии.", bonusDmg: 0, bonusArmor: 0, icon: "💀" },
    "amulet_elder_cross": { id: "amulet_elder_cross", type: "equip", slot: "amulet", name: "Крест Старосты", desc: "+250 Здоровья. Бонус растет с уровнем.", bonusDmg: 0, bonusArmor: 0, icon: "✝️" },
    "ring_ember": { id: "ring_ember", type: "equip", slot: "ring", name: "Кольцо Тлеющего Угля", desc: "+15 к магическому урону.", bonusDmg: 15, bonusArmor: 0, icon: "💍" },
    "rusty_chest": { id: "rusty_chest", type: "equip", slot: "body", name: "Ржавый Нагрудник Ордена", desc: "+5 к Броне, +200 к Здоровью.", bonusDmg: 0, bonusArmor: 5, bonusHp: 200, icon: "🦺" },
    "amulet_absorb": { id: "amulet_absorb", type: "equip", slot: "amulet", name: "Амулет Поглощения", desc: "Сопротивление Истощению.", bonusDmg: 5, bonusArmor: 0, icon: "🧿" },
    "eye_truth": { id: "eye_truth", type: "equip", slot: "head", name: "Око Истины", desc: "Иммунитет к ослеплению, шанс на крит.", bonusDmg: 10, bonusArmor: 2, icon: "👑" },
    
    "weak_def_head": { id: "weak_def_head", type: "equip", slot: "head", name: "Шляпа слабого защитника", desc: "Часть сета Защитника.", bonusDmg: 2, bonusArmor: 1, icon: "🎩" },
    "weak_def_feet": { id: "weak_def_feet", type: "equip", slot: "feet", name: "Сапоги слабого защитника", desc: "Часть сета Защитника.", bonusDmg: 1, bonusArmor: 1, icon: "👢" },
    "weak_def_body": { id: "weak_def_body", type: "equip", slot: "body", name: "Мантия слабого защитника", desc: "Часть сета Защитника.", bonusDmg: 2, bonusArmor: 2, icon: "🧥" },
    "weak_def_weapon": { id: "weak_def_weapon", type: "equip", slot: "weapon", name: "Посох слабого защитника", desc: "Часть сета Защитника.", bonusDmg: 5, bonusArmor: 0, icon: "🦯" },
    
    "weak_heal_head": { id: "weak_heal_head", type: "equip", slot: "head", name: "Шляпа слабого целителя", desc: "Часть сета Целителя.", bonusDmg: 2, bonusArmor: 1, icon: "🎩" },
    "weak_heal_feet": { id: "weak_heal_feet", type: "equip", slot: "feet", name: "Сапоги слабого целителя", desc: "Часть сета Целителя.", bonusDmg: 1, bonusArmor: 1, icon: "👢" },
    "weak_heal_body": { id: "weak_heal_body", type: "equip", slot: "body", name: "Мантия слабого целителя", desc: "Часть сета Целителя.", bonusDmg: 2, bonusArmor: 2, icon: "🧥" },
    "weak_heal_weapon": { id: "weak_heal_weapon", type: "equip", slot: "weapon", name: "Посох слабого целителя", desc: "Часть сета Целителя.", bonusDmg: 5, bonusArmor: 0, icon: "🦯" },

    "weak_anni_head": { id: "weak_anni_head", type: "equip", slot: "head", name: "Шляпа слабого аннигилятора", desc: "Часть сета Аннигилятора.", bonusDmg: 2, bonusArmor: 1, icon: "🎩" },
    "weak_anni_feet": { id: "weak_anni_feet", type: "equip", slot: "feet", name: "Сапоги слабого аннигилятора", desc: "Часть сета Аннигилятора.", bonusDmg: 1, bonusArmor: 1, icon: "👢" },
    "weak_anni_body": { id: "weak_anni_body", type: "equip", slot: "body", name: "Мантия слабого аннигилятора", desc: "Часть сета Аннигилятора.", bonusDmg: 2, bonusArmor: 2, icon: "🧥" },
    "weak_anni_weapon": { id: "weak_anni_weapon", type: "equip", slot: "weapon", name: "Посох слабого аннигилятора", desc: "Часть сета Аннигилятора.", bonusDmg: 5, bonusArmor: 0, icon: "🦯" },

    "weak_temp_head": { id: "weak_temp_head", type: "equip", slot: "head", name: "Шляпа слабого искусителя", desc: "Часть сета Искусителя.", bonusDmg: 2, bonusArmor: 1, icon: "🎩" },
    "weak_temp_feet": { id: "weak_temp_feet", type: "equip", slot: "feet", name: "Сапоги слабого искусителя", desc: "Часть сета Искусителя.", bonusDmg: 1, bonusArmor: 1, icon: "👢" },
    "weak_temp_body": { id: "weak_temp_body", type: "equip", slot: "body", name: "Мантия слабого искусителя", desc: "Часть сета Искусителя.", bonusDmg: 2, bonusArmor: 2, icon: "🧥" },
    "weak_temp_weapon": { id: "weak_temp_weapon", type: "equip", slot: "weapon", name: "Посох слабого искусителя", desc: "Часть сета Искусителя.", bonusDmg: 5, bonusArmor: 0, icon: "🦯" },

    "weak_druid_head": { id: "weak_druid_head", type: "equip", slot: "head", name: "Шляпа слабого друида", desc: "Часть сета Друида.", bonusDmg: 2, bonusArmor: 1, icon: "🎩" },
    "weak_druid_feet": { id: "weak_druid_feet", type: "equip", slot: "feet", name: "Сапоги слабого друида", desc: "Часть сета Друида.", bonusDmg: 1, bonusArmor: 1, icon: "👢" },
    "weak_druid_body": { id: "weak_druid_body", type: "equip", slot: "body", name: "Мантия слабого друида", desc: "Часть сета Друида.", bonusDmg: 2, bonusArmor: 2, icon: "🧥" },
    "weak_druid_weapon": { id: "weak_druid_weapon", type: "equip", slot: "weapon", name: "Посох слабого друида", desc: "Часть сета Друида.", bonusDmg: 5, bonusArmor: 0, icon: "🦯" }
};

const storyData = [
    { img: 'img/pic1.jpg', text: "Орден Избавителей хранил королевство Галмонд тысячи лет." },
    { img: 'img/pic2.jpg', text: "Однако спустя годы от некогда огромного ордена остались лишь трое магов, не знавших пощады чудовищам и монстрам." },
    { img: 'img/pic3.jpg', text: "И вот однажды, один из оставшихся Избавителей получил от короля важное задание - одолеть Серебряного дракона." },
    { img: 'img/pic4.jpg', text: "В тяжелой битве дракон был повержен." },
    { img: 'img/pic5.jpg', text: "Избавитель вернулся ночью, и в коридоре дворца таинственный ассасин лишил его сил с помощью запретной магии, тяжело ранив героя." },
    { img: 'img/pic6.jpg', text: "Чтобы спастись, Избавитель использовал древнюю магию \"Великий побег\", однако на ее сотворение ушли последние силы..." }
];

const endingData = [
    { img: 'img/necro_defeat.jpg', text: "Магия Избавителя пронзила некроманта, обрывая его темный ритуал навсегда." },
    { img: 'img/sunrise.jpg', text: "Над истерзанным лесом взошло солнце. Земли Галмонда вновь обрели надежду." }
];

const midlockIntroData = [
    { img: 'img/midlock_ruins.jpg', text: "Оставив деревню позади, Избавитель вышел к мрачным Руинам Мидлока — некогда великого города, ныне преданного забвению." },
    { img: 'img/midlock_ghosts.jpg', text: "Внезапно воздух похолодел. Из полуразрушенных склепов и каменных плит со всех сторон начали надвигаться бесплотные призраки..." }
];

window.playerAvatars = [
    { id: 'av_mage', name: 'Маг', file: 'icons/av_mage.png' },
    { id: 'av_paladin', name: 'Паладин', file: 'icons/av_paladin.png' },
    { id: 'av_rogue', name: 'Разбойник', file: 'icons/av_rogue.png' },
    { id: 'av_ranger', name: 'Рейнджер', file: 'icons/av_ranger.png' },
    { id: 'av_necromancer', name: 'Некромант', file: 'icons/av_necromancer.png' }
];

window.bossDialogueIcons = {
    'bandit': 'icons/mage.png',
    'elder': 'icons/elder.png',
    'undead': 'icons/enemy_undead.png', 
    'spirit': 'icons/spirit_dialogue.png',
    'ghost': 'icons/ghost_dialogue.png',
    'necromancer': 'icons/necromage.png',
    'girl': 'icons/girl_knight.png' // Иконка незнакомки в доспехах
};

// === АРЕНА И ЛИГИ ===
window.arenaLeagues = [
    { id: 'lily', name: "Лига Ландыша", icon: "icons/league_lily.png", reqPoints: 0 },
    { id: 'wormwood', name: "Лига Полыни", icon: "icons/league_wormwood.png", reqPoints: 100 },
    { id: 'moon', name: "Лига Луны", icon: "icons/league_moon.png", reqPoints: 300 },
    { id: 'peak', name: "Лига Вершины", icon: "icons/league_peak.png", reqPoints: 600 },
    { id: 'divine', name: "Лига Божества", icon: "icons/league_divine.png", reqPoints: 1000 }
];

window.pvpBots = [
    { league: 0, name: "Иллюзия Новичка", hp: 1200, dmg: 80, pierce: 0, spells: ['base'], spellChance: 0.1, rewardPoints: 15, rewardGold: 100 },
    { league: 1, name: "Фантом Воителя", hp: 2500, dmg: 150, pierce: 5, spells: ['base', 'shield'], spellChance: 0.2, rewardPoints: 25, rewardGold: 200 },
    { league: 2, name: "Астральный Гладиатор", hp: 4500, dmg: 250, pierce: 15, spells: ['base', 'firestorm', 'heal'], spellChance: 0.3, rewardPoints: 35, rewardGold: 350 },
    { league: 3, name: "Тень Магистра", hp: 7000, dmg: 400, pierce: 25, spells: ['base', 'blind', 'spirit', 'heal'], spellChance: 0.4, rewardPoints: 50, rewardGold: 500 },
    { league: 4, name: "Эхо Божества", hp: 12000, dmg: 700, pierce: 40, spells: ['base', 'constanta', 'anti_undead', 'mind_control'], spellChance: 0.5, rewardPoints: 75, rewardGold: 800 }
];

window.arenaIcons = {
    'flower': 'icons/ethereal_flower.png',
    'lb_daily': 'icons/lb_daily.png',
    'lb_monthly': 'icons/lb_monthly.png'
};

// === БАЗА ДАННЫХ ДЛЯ ДОРОГ С НОВЫМИ ИКОНКАМИ ===
window.roadsDB = [
    { id: 'lawless', name: "Дорога беззакония", img: "icons/road_lawless.png", emoji: "🔥", color: "#ff4d4d", bg: "linear-gradient(180deg, #330000, #1a0000)" },
    { id: 'devastation', name: "Дорога опустошения", img: "icons/road_devastation.png", emoji: "🌪️", color: "#aaaaaa", bg: "linear-gradient(180deg, #222222, #111111)" },
    { id: 'power', name: "Дорога власти", img: "icons/road_power.png", emoji: "👑", color: "#d4af37", bg: "linear-gradient(180deg, #332200, #1a1100)" },
    { id: 'wealth', name: "Дорога богатства", img: "icons/road_wealth.png", emoji: "💰", color: "#00ffcc", bg: "linear-gradient(180deg, #003322, #001a11)" },
    { id: 'thorns', name: "Дорога терния", img: "icons/road_thorns.png", emoji: "🌿", color: "#00cc00", bg: "linear-gradient(180deg, #002200, #001100)" },
    { id: 'darkness', name: "Дорога тьмы", img: "icons/road_darkness.png", emoji: "🌑", color: "#6600cc", bg: "linear-gradient(180deg, #110022, #080011)" },
    { id: 'destruction', name: "Дорога разрушения", img: "icons/road_destruction.png", emoji: "🌋", color: "#ff6600", bg: "linear-gradient(180deg, #331100, #1a0800)" },
    { id: 'tyranny', name: "Дорога тирании", img: "icons/road_tyranny.png", emoji: "👁️", color: "#ff00ff", bg: "linear-gradient(180deg, #330033, #1a001a)" },
    { id: 'doom', name: "Дорога гибели", img: "icons/road_doom.png", emoji: "💀", color: "#ff0000", bg: "linear-gradient(180deg, #2a0000, #000000)" }
];

window.roadEnemiesDB = [
    { id: 'dark_follower', name: "Темный последователь", icon: "icons/enemy_dark_follower.png", emoji: "🦹", hp: 1000, dmg: 80, ability: "none" },
    { id: 'cursed_thug', name: "Проклятый головорез", icon: "icons/enemy_cursed_thug.png", emoji: "🥷", hp: 1200, dmg: 100, ability: "none" },
    { id: 'killer_griffon', name: "Грифон-убийца", icon: "icons/enemy_killer_griffon.png", emoji: "🦅", hp: 900, dmg: 120, ability: "none" },
    { id: 'weak_wyvern', name: "Слабая виверна", icon: "icons/enemy_weak_wyvern.png", emoji: "🐉", hp: 1400, dmg: 110, ability: "none" },
    { id: 'usurper_spirit', name: "Дух узурпатора", icon: "icons/enemy_usurper_spirit.png", emoji: "👻", hp: 1100, dmg: 90, ability: "ethereal" },
    { id: 'death_herald', name: "Вестник смерти", icon: "icons/enemy_death_herald.png", emoji: "💀", hp: 1300, dmg: 140, ability: "none" },
    { id: 'forgotten_undead', name: "Забытый мертвец", icon: "icons/enemy_forgotten_undead.png", emoji: "🧟", hp: 1600, dmg: 70, ability: "exhaustion" },
    { id: 'possessed_skeleton', name: "Одержимый скелет", icon: "icons/enemy_possessed_skeleton.png", emoji: "☠️", hp: 800, dmg: 90, ability: "none" },
    { id: 'evil_unicorn', name: "Злой единорог", icon: "icons/enemy_evil_unicorn.png", emoji: "🦄", hp: 1000, dmg: 100, ability: "none" }
];