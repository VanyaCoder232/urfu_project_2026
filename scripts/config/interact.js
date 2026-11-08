// Менеджер состояний взаимодействия
export const InteractManager = {
    currentSequence: null, // Хранит текущий запущенный процесс (генератор)

    // Метод, вызываемый из Event Sheet при нажатии клавиши E
    async tryInteract(runtime, entity) {
        // 1. Если диалог или взаимодействие уже запущены, продвигаем процесс дальше
        if (this.currentSequence) {
            const next = this.currentSequence.next();
            if (next.done) {
                this.currentSequence = null; // Процесс завершен
                runtime.globalVars.IsEntityInteractionActive = false;
            }
            return;
        }

        // 2. Если ничего не запущено, ищем экшен по типу сущности
        if (!entity || !entity.instVars) return;
        
        const actionName = entity.instVars.type; // Берем Instance Variable "type" из Construct 3
        const action = InteractActions[actionName];

        if (action) {
            // Устанавливаем флаг активности взаимодействия в Construct 3
            runtime.globalVars.IsEntityInteractionActive = true;
            
            // Запускаем функцию-генератор и делаем первый шаг
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
        // Показываем первую реплику
        showDialoguePanel(runtime, "top", "Вы осматриваете странный алтарь в комнате детектива...");
        showDialoguePanel(runtime, "bottom", "Кажется, этот предмет связывает реальность и кошмары.");
        yield; // Замораживаем выполнение функции! Ждем следующего нажатия Е.

        // Игрок нажал клавишу второй раз — переходим к следующему шагу
        showDialoguePanel(runtime, "top", "Границы реальности начинают стремительно размываться...");
        showDialoguePanel(runtime, "bottom", "Глаза закрываются сами собой. Вы засыпаете...");
        yield; // Снова ждем нажатия E.

        // Закрываем диалоги в конце
        closeDialoguePanel(runtime);
        
        // Переключаем игру в режим Битвы/Снов
        if (globalThis.GameStateContext) {
            globalThis.GameStateContext.changeWorld("dream");
        }
    }
};

// Вспомогательные функции отрисовки UI панелей
function showDialoguePanel(runtime, position, text) {
    const isTop = position === "top";
    const panel = runtime.objects[isTop ? "DialogPanelTop" : "DialogPanelBottom"].getFirstInstance();
    const txtObj = runtime.objects[isTop ? "DialogTextTop" : "DialogTextBottom"].getFirstInstance();

    if (panel) panel.isVisible = true;
    if (txtObj) {
        txtObj.isVisible = true;
        txtObj.text = text;
    }
}

function closeDialoguePanel(runtime) {
    const panelTop = runtime.objects["DialogPanelTop"].getFirstInstance();
    const panelBottom = runtime.objects["DialogPanelBottom"].getFirstInstance();
    const txtTop = runtime.objects["DialogTextTop"].getFirstInstance();
    const txtBottom = runtime.objects["DialogTextBottom"].getFirstInstance();

    if (panelTop) panelTop.isVisible = false;
    if (panelBottom) panelBottom.isVisible = false;
    if (txtTop) txtTop.text = "";
    if (txtBottom) txtBottom.text = "";
}
