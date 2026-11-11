













module.exports = {
    
    
    
    bot: {
        activity: '',               
        autoDeployCommands: true,   
    },

    
    
    
    permissions: {
        adminRoleIds: [],           
        masterRoleIds: [],          
        
        
        
        curatorRoleIds: [],         
        curatorUserIds: [],         
        discordAdminsAreAdmins: true, 
    },

    
    
    
    logging: {
        level: 'info',              
        toFile: true,               
        keepDays: 14,
        channels: {                 
            default: '',
            characters: '',         
            xp: '',                 
            sanity: '',             
            reputation: '',         
            errors: '',             
        },
    },

    
    
    
    theme: {
        colors: {
            primary: '#2e5c3e',     
            accent: '#b87333',      
            muted: '#4a3b32',       
            light: '#fffff0',       
            danger: '#7a2e2a',      
        },
        
        dividerImage: true,
        
        profileCardImage: true,
    },

    
    
    
    characters: {
        
        maxPerUser: 3,              
        
        
        allowCustomRace: false,
        allowCustomClass: false,
        announceChannelId: '',      
        maxAvatarSizeMb: 8,

        
        races: [],
        classes: [],
    },

    
    
    
    stats: {
        
        list: [
            { key: 'str', short: 'STR', name: 'Сила', description: 'Физический урон, ношение тяжестей, ломание дверей.' },
            { key: 'dex', short: 'DEX', name: 'Ловкость', description: 'Реакция, скрытность, стрельба, акробатика.' },
            { key: 'con', short: 'CON', name: 'Телосложение', description: 'Здоровье (HP), устойчивость к ядам, выносливость.' },
            { key: 'int', short: 'INT', name: 'Интеллект', description: 'Знания, магия/технологии, память, расследования.' },
            { key: 'per', short: 'PER', name: 'Восприятие', description: 'Внимательность, поиск скрытого, интуиция.' },
            { key: 'cha', short: 'CHA', name: 'Харизма', description: 'Убеждение, обман, запугивание, торговля.' },
        ],
        base: 8,                    
        min: 1,
        
        
        
        
    },

    
    hp: { base: 10, perCon: 2, perLevel: 0 },

    
    
    
    sanity: {
        max: 100,
        start: 100,
        
        states: [
            { min: 70, name: 'Стабильно', penalty: 0 },
            { min: 45, name: 'Стресс', penalty: -1 },
            { min: 25, name: 'Срыв', penalty: -2 },
            { min: 0, name: 'Критично', penalty: -4 },
        ],
        
        madness: {
            enabled: true,
            triggerBelow: 25,
            durationMinutes: 120,
            extraPenalty: -2,       
            effects: [],            
        },
    },

    
    
    
    reputation: {
        mode: 'factions',           
        min: -100,
        max: 100,
        
        factions: [],
        
        ranks: [
            { min: 60, name: 'Почёт', priceModifier: -20, quests: 'все квесты' },
            { min: 25, name: 'Уважение', priceModifier: -10, quests: 'расширенный доступ' },
            { min: -24, name: 'Нейтрально', priceModifier: 0, quests: 'обычные квесты' },
            { min: -59, name: 'Недоверие', priceModifier: 15, quests: 'ограниченный доступ' },
            { min: -100, name: 'Вражда', priceModifier: 50, quests: 'закрыты' },
        ],
    },

    
    
    
    xp: {
        
        levelBase: 100,
        levelExponent: 1.5,
        maxLevel: 50,

        
        messages: {
            enabled: true,
            channelIds: [],         
            categoryIds: [],        
            minLength: 80,          
            cooldownSeconds: 90,    
            xpMin: 4,
            xpMax: 10,
            bonusPerChars: 250,     
            maxLengthBonus: 10,     
            dailyCap: 250,          
        },
        manual: { maxPerGive: 2000 }, 
        levelUpChannelId: '',       
    },

    
    
    
    database: {
        file: 'data/bot.db',
        backupOnStart: true,
        keepBackups: 10,
    },
};
