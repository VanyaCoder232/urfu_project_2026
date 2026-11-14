// Менеджер состояний взаимодействия
export const InteractManager = {
    currentSequence: null, // Хранит текущий запущенный процесс (генератор)

    // Единый метод, вызываемый из Event Sheet при нажатии клавиши E
    async handleInteractKey(runtime) {
        // Если игрок в мире снов (бой/платформер), взаимодействия реального мира не запускаем
        if (globalThis.GameStateContext && globalThis.GameStateContext.currentState !== "real") {
            return;
        }

        // 1. Если диалог или взаимодействие уже запущены — продвигаем его дальше
        if (this.currentSequence) {
            await this.tryInteract(runtime, null);
            return;
        }

        const player = runtime.objects.PlayerBox?.getFirstInstance();
        if (!player) return;

        const INTERACT_RADIUS = 64;
        let closestObj = null;
        let minDist = INTERACT_RADIUS;
        let objCategory = null; // "door" или "entity"

        // Ищем ближайшую дверь (отдельный объект Door)
        if (runtime.objects.Door) {
            for (const door of runtime.objects.Door.getAllInstances()) {
                const dist = Math.hypot(player.x - door.x, player.y - door.y);
                if (dist <= minDist) {
                    minDist = dist;
                    closestObj = door;
                    objCategory = "door";
                }
            }
        }

        // Ищем ближайший интерактивный объект Entity (кровать, улики, NPC)
        if (runtime.objects.Entity) {
            for (const entity of runtime.objects.Entity.getAllInstances()) {
                const dist = Math.hypot(player.x - entity.x, player.y - entity.y);
                if (dist <= minDist) {
                    minDist = dist;
                    closestObj = entity;
                    objCategory = "entity";
                }
            }
        }

        // Выполняем переход в дверь или взаимодействие с Entity
        if (objCategory === "door" && closestObj) {
            runtime.globalVars.IsEntityInteractionActive = true;
            const targetLayout = closestObj.instVars.targetLayout;
            const targetDoorId = closestObj.instVars.targetDoorId;

            if (targetLayout && globalThis.GameStateContext) {
                globalThis.GameStateContext.goToRoom(targetLayout, targetDoorId);
            } else {
                console.error("У объекта Door не заполнена переменная targetLayout!", closestObj);
            }
            runtime.globalVars.IsEntityInteractionActive = false;

        } else if (objCategory === "entity" && closestObj) {
            await this.tryInteract(runtime, closestObj);
        }
    },

    // Обработка конкретной сущности Entity по её переменной type
    async tryInteract(runtime, entity) {
        if (this.currentSequence) {
            const next = this.currentSequence.next();
            if (next.done) {
                this.currentSequence = null;
                runtime.globalVars.IsEntityInteractionActive = false;
            }
            return;
        }

        if (!entity || !entity.instVars) return;

        const actionName = entity.instVars.type;
        const action = InteractActions[actionName];

        if (action) {
            runtime.globalVars.IsEntityInteractionActive = true;

            this.currentSequence = action(runtime, entity);
            const next = this.currentSequence.next();
            if (next.done) {
                this.currentSequence = null;
                runtime.globalVars.IsEntityInteractionActive = false;
            }
        }
    }
};

// Функции-генераторы (function*) управления сценами и диалогами
export const InteractActions = {
    // Осмотр кровати в комнате ГГ (по второму нажатию E переносит в мир снов)
    "bed": function* (runtime, entity) {
        showDialoguePanel(runtime, "top", "Ваша кровать. Выглядит помятой после бессонной ночи.");
        showDialoguePanel(runtime, "bottom", "Нажмите E еще раз, чтобы лечь спать и погрузиться в мир снов...");
        yield; // Ждем следующего нажатия E

        closeDialoguePanel(runtime);

        if (globalThis.GameStateContext) {
            globalThis.GameStateContext.changeWorld("dream");
        }
    },

    // Триггер немедленного перехода в мир снов
    "switcherToDreamWorld": function* (runtime, entity) {
        if (globalThis.GameStateContext) {
            globalThis.GameStateContext.changeWorld("dream");
        } else {
            console.error("Глобальный GameStateContext не инициализирован!");
        }
    },

    // Сюжетный диалог осмотра стола/улики, плавно переходящий в битву мира снов
    "testOpenerDialogue": function* (runtime, entity) {
        showDialoguePanel(runtime, "top", "Вы осматриваете странный алтарь в комнате детектива...");
        showDialoguePanel(runtime, "bottom", "Кажется, этот предмет связывает реальность и кошмары.");
        yield;

        showDialoguePanel(runtime, "top", "Границы реальности начинают стремительно размываться...");
        showDialoguePanel(runtime, "bottom", "Глаза закрываются сами собой. Вы засыпаете...");
        yield;

        closeDialoguePanel(runtime);

        if (globalThis.GameStateContext) {
            globalThis.GameStateContext.changeWorld("dream");
        }
    }
};

// Вспомогательные функции отрисовки UI панелей
function showDialoguePanel(runtime, position, text) {
    const isTop = position === "top";
    const panel = runtime.objects[isTop ? "DialogPanelTop" : "DialogPanelBottom"]?.getFirstInstance();
    const txtObj = runtime.objects[isTop ? "DialogTextTop" : "DialogTextBottom"]?.getFirstInstance();

    if (panel) panel.isVisible = true;
    if (txtObj) {
        txtObj.isVisible = true;
        txtObj.text = text;
    }
}

function closeDialoguePanel(runtime) {
    const panelTop = runtime.objects["DialogPanelTop"]?.getFirstInstance();
    const panelBottom = runtime.objects["DialogPanelBottom"]?.getFirstInstance();
    const txtTop = runtime.objects["DialogTextTop"]?.getFirstInstance();
    const txtBottom = runtime.objects["DialogTextBottom"]?.getFirstInstance();

    if (panelTop) panelTop.isVisible = false;
    if (panelBottom) panelBottom.isVisible = false;
    if (txtTop) txtTop.text = "";
    if (txtBottom) txtBottom.text = "";
}
