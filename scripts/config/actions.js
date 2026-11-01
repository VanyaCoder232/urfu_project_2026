import { InputSystem } from "./components/input.js";
export const InteractActions = {
// Cписок для добавления действий игрока с объектами на поле
//    lever: (runtime, entity, inv) => {
//        entity.setAnimation("activated"); 
//        showDialogue(runtime, "top", "Рычаг со скрипом повернулся. Путь открыт!");
//    },
//    chest: (runtime, entity, inv) => {
//        inv.add({ id: "toy_knife", name: "Игрушечный нож", type: "weapon", value: 5 });
//        showDialogue(runtime, "bottom", "Вы нашли Игрушечный нож в сундуке!");
//    },
    switcherToDreamWorld: (runtime, entity, inv, changeWorld) => {
        changeWorld("dream");
    },
    switcherToFight: (runtime, entity, inv, changeWorld) => {
        changeWorld("battle");
    },
    testOpenerDialogue(runtime, entity, inv, changeWorld){
        showDialogue(runtime , "top" , "Верхний текст1")
        showDialogue(runtime , "bottom" , "Нижний текст1")
    }
};

// Вспомогательная функция, чтобы не дублировать код вызова текста
function showDialogue(runtime, position, text) {
    const input = new InputSystem();
    const isTop = position === "top";
    runtime.objects[isTop ? "DialogPanelTop" : "DialogPanelBottom"].getFirstInstance().isVisible = true;
    runtime.objects[isTop ? "DialogTextTop" : "DialogTextBottom"].getFirstInstance().text = text;
    if (input.is("interact")) {
        runtime.objects[isTop ? "DialogPanelTop" : "DialogPanelBottom"].getFirstInstance().isVisible = false;
        runtime.objects[isTop ? "DialogTextTop" : "DialogTextBottom"].getFirstInstance().text = "";
    }
}