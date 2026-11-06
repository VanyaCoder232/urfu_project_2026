// Менеджер состояний взаимодействия
export const InteractManager = {
    currentSequence: null, // Хранит текущий запущенный процесс (генератор)

    // Метод, вызываемый из Event Sheet при нажатии клавиши
    async tryInteract(runtime, entity) {
        // runtime.globalVars.IsEntityInteractionActive = true
        // 1. Если диалог уже открыт, продвигаем его дальше
        if (this.currentSequence) {
            const next = this.currentSequence.next();
            if (next.done) {
                this.currentSequence = null; // Процесс завершен
                runtime.globalVars.IsEntityInteractionActive = false
            }
            return;
        }

        // 2. Если ничего не запущено, ищем экшен по типу сущности
        const actionName = entity.instVars.type; // Берем Instance Variable из Construct 3
        const action = InteractActions[actionName];

        if (action) {
            // Запускаем функцию-генератор и делаем первый шаг
            this.currentSequence = action(runtime, entity);
            const next = this.currentSequence.next();
            if (next.done) this.currentSequence = null;
        }
    }
};

// Функции теперь являются генераторами (function*)
// Магия yield позволяет "поставить код на паузу" до следующего нажатия клавиши
export const InteractActions = {
    "switcherToDreamWorld": function* (runtime, entity) {
        changeWorld("dream");
    },

    "testOpenerDialogue": function* (runtime, entity) {
        // Показываем первую реплику
        showDialoguePanel(runtime, "top", "Верхний текст1");
        showDialoguePanel(runtime, "bottom", "Нижний текст1");
        yield; // Замораживаем выполнение функции! Ждем следующего нажатия.

        // Игрок нажал клавишу второй раз — переходим к следующему шагу
        showDialoguePanel(runtime, "top", "Вторая реплика сверху");
        yield; // Снова ждем

        // Закрываем диалоги в конце
        closeDialoguePanel(runtime);
    }
};

function showDialoguePanel(runtime, position, text) {
    const isTop = position === "top";
    runtime.objects[isTop ? "DialogPanelTop" : "DialogPanelBottom"].getFirstInstance().isVisible = true;

    runtime.objects[isTop ? "DialogTextTop" : "DialogTextBottom"].getFirstInstance().isVisible = true;
    runtime.objects[isTop ? "DialogTextTop" : "DialogTextBottom"].getFirstInstance().text = text;

}

function closeDialoguePanel(runtime) {
    runtime.objects["DialogPanelTop"].getFirstInstance().isVisible = false;
    runtime.objects["DialogPanelBottom"].getFirstInstance().isVisible = false;
    runtime.objects["DialogTextTop"].getFirstInstance().text = "";
    runtime.objects["DialogTextBottom"].getFirstInstance().text = "";
}
