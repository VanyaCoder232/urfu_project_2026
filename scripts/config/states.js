export const GameStates = {
    // НАСТРОЙКА ПУНКТА 1 ТЗ: Реальный мир (Детективное расследование, вид сверху)
    real: {
        init: (runtime) => {
            console.log("Состояние: Реальный мир (Расследование)");
            const player = runtime.objects.PlayerBox.getFirstInstance();
            if (player) {
                // В реальном мире включаем вид сверху (8 Направлений), полностью гасим платформер
                if (player.behaviors.EightDirection) {
                    player.behaviors.EightDirection.isEnabled = true;
                }
                if (player.behaviors.Platform) {
                    player.behaviors.Platform.isEnabled = false;
                    player.behaviors.Platform.vectorY = 0; // Защита от случайного падения
                    player.behaviors.Platform.vectorX = 0;
                }
            }
        }
    },
    
    // НАСТРОЙКА ПУНКТОВ 2 и 3 ТЗ: Сюрреалистичный Мир Снов и Битва (Вид сбоку, платформер)
    dream: {
        init: (runtime) => {
            console.log("Состояние: Мир Снов / Битва (Платформер)");
            
            // 1. Программный переход на Макет 2 (Сюрреалистичные хитбоксы)
            if (runtime.layout.name !== "Макет 2") {
                runtime.goToLayout("Макет 2");
            }

            // 2. Настройка физики платформера и кастомных переменных для паркура/боёвки
            // Небольшой таймаут гарантирует, что Макет 2 успел полностью прогрузиться в память
            setTimeout(() => {
                const player = runtime.objects.PlayerBox.getFirstInstance();
                if (player) {
                    // Переключаем поведением: выключаем 8-Direction, активируем физику Платформера
                    if (player.behaviors.EightDirection) {
                        player.behaviors.EightDirection.isEnabled = false;
                    }
                    if (player.behaviors.Platform) {
                        player.behaviors.Platform.isEnabled = true;
                        player.behaviors.Platform.vectorY = 0;
                        player.behaviors.Platform.vectorX = 0;
                        
                        // Задаем выверенные сбалансированные параметры для прыжков по клеткам
                        player.behaviors.Platform.jumpStrength = 550; // Сила прыжка под пиксельные платформы
                        player.behaviors.Platform.gravity = 1400;      // Ощутимая физика веса
                        player.behaviors.Platform.maxSpeed = 330;     // Стандартная скорость бега
                    }

                    // Инициализируем внутренние переменные хитбокса игрока под ТЗ Боевки и Паркура
                    if (player.instVars) {
                        player.instVars.lastShotTime = 0; // Таймер перезарядки для стрельбы на Е
                        player.instVars.isDashing = false; // Состояние быстрого перемещения/рывка
                    }
                }
            }, 100);
        }
    }
};
