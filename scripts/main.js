import { Inventory } from "./components/inventory.js";
import { InteractManager } from "./config/interact.js";
import { GameStates } from "./config/states.js";

runOnStartup(async runtime => {
    runtime.addEventListener("beforeprojectstart", () => {
        OnBeforeProjectStart(runtime);
    });
});

async function OnBeforeProjectStart(runtime)
{
    // 1. Привязываем менеджер взаимодействий к глобальной видимости
    globalThis.InteractManager = InteractManager;
    
    // 2. Создаем ЕДИНЫЙ глобальный контекст игры
    globalThis.GameStateContext = {
        currentState: "real", // Начальный мир — всегда реальный
        playerStats: { hp: 20, maxHp: 20, equippedWeapon: null },
        currentStage: 1,
        
        changeWorld(stateName) {
            this.currentState = stateName;
            
            // Закрываем все панели диалогов при смене мира
            runtime.objects.DialogPanelTop.getAllInstances().forEach(i => i.isVisible = false);
            runtime.objects.DialogPanelBottom.getAllInstances().forEach(i => i.isVisible = false);
            runtime.objects.DialogTextTop.getAllInstances().forEach(i => i.text = "");
            runtime.objects.DialogTextBottom.getAllInstances().forEach(i => i.text = "");

            // Активируем логику смены мира из states.js
            if (GameStates[stateName]) {
                GameStates[stateName].init(runtime);
            } else {
                console.error(`Состояние "${stateName}" не найдено в GameStates!`);
            }
        }
    };

    // 3. Единый кадровый цикл игры (Движение, Паркур, Боёвка и Камера)
    runtime.addEventListener("tick", () => {
        const player = runtime.objects.PlayerBox.getFirstInstance();
        if (!player) return;

        // --- ЛОГИКА ДЛЯ МИРА СНОВ / БИТВЫ (dream) ---
        if (globalThis.GameStateContext.currentState === "dream") {
            const platform = player.behaviors.Platform;
            
            if (platform) {
                // Отключаем стандартное управление стрелочками, чтобы использовать WASD
                platform.isDefaultControlsEnabled = false;

                let isTouchingWall = false;
                
                // Проверяем соприкосновение с твердыми стенами/платформами (DreamFloor или TileMap)
                if (runtime.objects.DreamFloor && runtime.collisions.testOverlap(player, runtime.objects.DreamFloor)) {
                    isTouchingWall = true;
                }
                if (runtime.objects.TileMap && runtime.collisions.testOverlap(player, runtime.objects.TileMap)) {
                    isTouchingWall = true;
                }

                // ПАРКУР: Удерживание Пробела — зацеп за стену и карабканье (Пункт 10 и 12 ТЗ)
                if (runtime.keyboard.isKeyDown("Space") && isTouchingWall) {
                    // Персонаж цепляется и зависает на стене (обнуляем падение)
                    platform.vectorY = 0;
                    
                    // Если при зацепе зажата W — плавно карабкаемся вверх
                    if (runtime.keyboard.isKeyDown("W") || runtime.keyboard.isKeyDown("w")) {
                        platform.vectorY = -180;
                    }
                } else {
                    // Стандартное перемещение по платформе на WASD, если нет зацепа
                    if (runtime.keyboard.isKeyDown("A") || runtime.keyboard.isKeyDown("a")) {
                        platform.simulateControl("left");
                    }
                    if (runtime.keyboard.isKeyDown("D") || runtime.keyboard.isKeyDown("d")) {
                        platform.simulateControl("right");
                    }
                    if (runtime.keyboard.isKeyDown("W") || runtime.keyboard.isKeyDown("w")) {
                        platform.simulateControl("jump");
                    }
                }

                // ПАРКУР: Быстрое перемещение / Рывок на клавишу Shift
                if (runtime.keyboard.isKeyDown("Shift")) {
                    platform.maxSpeed = 600; // Повышенная скорость паркура
                } else {
                    platform.maxSpeed = 330; // Стандартный пиксельный бег
                }
            }

            // СТРЕЛЬБА И БОЕВКА: Нажатие на клавишу E в мире снов (Пункт 10 и 12 ТЗ)
            if (runtime.keyboard.isKeyDown("E") || runtime.keyboard.isKeyDown("e")) {
                const now = runtime.gameTime;
                
                // Ограничиваем частоту выстрелов (cooldown) в 0.4 секунды
                if (!player.instVars.lastShotTime || now - player.instVars.lastShotTime > 0.4) {
                    player.instVars.lastShotTime = now;
                    
                    console.log("💥 БОЙ: Выстрел в мире снов!");
                    
                    if (runtime.objects.Audio) {
                        runtime.objects.Audio.play("shoot_sound", false, -5);
                    }
                }
            }
        }

        // --- ОБЩАЯ ЛОГИКА ДЛЯ ОБОИХ МИРОВ ---
        // Плавное следование камеры за игроком (Пункт 6 и 8 ТЗ)
        runtime.layout.scrollToTarget(player);
    });
}
