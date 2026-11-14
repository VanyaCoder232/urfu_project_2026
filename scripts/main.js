import { Inventory } from "./components/inventory.js";
import { InteractManager } from "./config/interact.js";
import { GameStates } from "./config/states.js";

// Настройки камеры-бокса (Пункты 6 и 8 GDD)
const CAMERA_DEADZONE_W = 120; // Половина ширины области удержания
const CAMERA_DEADZONE_H = 80;  // Половина высоты области удержания
const CAMERA_SMOOTH = 0.08;    // Плавность смещения камеры

let camX = 0;
let camY = 0;

runOnStartup(async runtime => {
    runtime.addEventListener("beforeprojectstart", () => {
        OnBeforeProjectStart(runtime);
    });
});

async function OnBeforeProjectStart(runtime) {
    // 1. Привязываем менеджер взаимодействий к глобальной видимости
    globalThis.InteractManager = InteractManager;

    // 2. Создаем ЕДИНЫЙ глобальный контекст игры
    globalThis.GameStateContext = {
        currentState: "real", // Начальный мир — всегда реальный
        playerStats: { hp: 20, maxHp: 20, equippedWeapon: null },
        currentStage: 1,
        pendingDoorId: null, // ID двери, у которой нужно заспавнить игрока после перехода

        // Универсальный переход между комнатами/макетами через объект Door
        goToRoom(targetLayout, targetDoorId) {
            this.pendingDoorId = targetDoorId;
            runtime.goToLayout(targetLayout);
        },

        // Переключение между реальным миром (real) и миром снов (dream)
        changeWorld(stateName) {
            this.currentState = stateName;

            // Закрываем все панели диалогов при смене мира
            if (runtime.objects.DialogPanelTop) {
                runtime.objects.DialogPanelTop.getAllInstances().forEach(i => i.isVisible = false);
                runtime.objects.DialogPanelBottom.getAllInstances().forEach(i => i.isVisible = false);
                runtime.objects.DialogTextTop.getAllInstances().forEach(i => i.text = "");
                runtime.objects.DialogTextBottom.getAllInstances().forEach(i => i.text = "");
            }

            if (GameStates[stateName]) {
                GameStates[stateName].init(runtime);
            } else {
                console.error(`Состояние "${stateName}" не найдено в GameStates!`);
            }
        }
    };

    // 3. Обработчик загрузки КАЖДОГО макета (срабатывает при переходе через двери и миры)
    runtime.addEventListener("afterlayoutstart", () => {
        const player = runtime.objects.PlayerBox?.getFirstInstance();
        if (!player) return;

        // Если мы перешли через дверь — ставим игрока рядом с целевой дверью (объект Door)
        const targetId = globalThis.GameStateContext.pendingDoorId;
        if (targetId && runtime.objects.Door) {
            const doors = runtime.objects.Door.getAllInstances();
            const spawnDoor = doors.find(d => d.instVars.doorId === targetId);

            if (spawnDoor) {
                const offsetX = spawnDoor.instVars.spawnOffsetX ?? 0;
                const offsetY = spawnDoor.instVars.spawnOffsetY ?? 48;
                player.x = spawnDoor.x + offsetX;
                player.y = spawnDoor.y + offsetY;
            } else {
                console.warn(`Дверь с doorId "${targetId}" не найдена на макете "${runtime.layout.name}"!`);
            }
            globalThis.GameStateContext.pendingDoorId = null;
        }

        // Центрируем камеру на игроке при входе в локацию без резкого скачка
        camX = player.x;
        camY = player.y;
        runtime.layout.scrollTo(camX, camY);

        // Инициализируем физику текущего режима (real или dream)
        const currentWorld = globalThis.GameStateContext.currentState;
        if (GameStates[currentWorld]) {
            GameStates[currentWorld].init(runtime);
        }
    });

    // 4. Единый кадровый цикл игры (Паркур, Боёвка и Камера-бокс)
    runtime.addEventListener("tick", () => {
        const player = runtime.objects.PlayerBox?.getFirstInstance();
        if (!player) return;

        // --- ЛОГИКА ДЛЯ МИРА СНОВ / БИТВЫ (dream) ---
        if (globalThis.GameStateContext.currentState === "dream") {
            const platform = player.behaviors.Platform;

            if (platform) {
                platform.isDefaultControlsEnabled = false;
                let isTouchingWall = false;

                if (runtime.objects.DreamFloor && runtime.collisions.testOverlap(player, runtime.objects.DreamFloor)) {
                    isTouchingWall = true;
                }
                if (runtime.objects.TileMap && runtime.collisions.testOverlap(player, runtime.objects.TileMap)) {
                    isTouchingWall = true;
                }

                // ПАРКУР: Удерживание Пробела — зацеп за стену и карабканье
                if (runtime.keyboard.isKeyDown("Space") && isTouchingWall) {
                    platform.vectorY = 0;
                    if (runtime.keyboard.isKeyDown("W") || runtime.keyboard.isKeyDown("w")) {
                        platform.vectorY = -180;
                    }
                } else {
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
                platform.maxSpeed = runtime.keyboard.isKeyDown("Shift") ? 600 : 330;
            }

            // СТРЕЛЬБА И БОЕВКА: Нажатие на клавишу E в мире снов
            if (runtime.keyboard.isKeyDown("E") || runtime.keyboard.isKeyDown("e")) {
                const now = runtime.gameTime;
                if (!player.instVars.lastShotTime || now - player.instVars.lastShotTime > 0.4) {
                    player.instVars.lastShotTime = now;
                    console.log("💥 БОЙ: Выстрел в мире снов!");
                    if (runtime.objects.Audio) {
                        runtime.objects.Audio.play("shoot_sound", false, -5);
                    }
                }
            }
        }

        // --- ОБЩАЯ ЛОГИКА ДЛЯ ОБОИХ МИРОВ: КАМЕРА-БОКС (Пункты 6 и 8 GDD) ---
        let targetCamX = camX;
        let targetCamY = camY;

        if (player.x > camX + CAMERA_DEADZONE_W) {
            targetCamX = player.x - CAMERA_DEADZONE_W;
        } else if (player.x < camX - CAMERA_DEADZONE_W) {
            targetCamX = player.x + CAMERA_DEADZONE_W;
        }

        if (player.y > camY + CAMERA_DEADZONE_H) {
            targetCamY = player.y - CAMERA_DEADZONE_H;
        } else if (player.y < camY - CAMERA_DEADZONE_H) {
            targetCamY = player.y + CAMERA_DEADZONE_H;
        }

        camX += (targetCamX - camX) * CAMERA_SMOOTH;
        camY += (targetCamY - camY) * CAMERA_SMOOTH;
        runtime.layout.scrollTo(camX, camY);
    });
}
