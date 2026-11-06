import { Inventory } from "./components/inventory.js";
import { InteractManager } from "./config/interact.js";
import { GameStates } from "./config/states.js";


globalThis.InteractManager = InteractManager; 
runOnStartup(async runtime => {
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.
	runtime.addEventListener("beforeprojectstart", () => {
        OnBeforeProjectStart(runtime)
    });
});

async function OnBeforeProjectStart(runtime)
{
	// Code to run just before 'On start of layout' on
	// the first layout. Loading has finished and initial
	// instances are created and available to use here.


    let currentState = "real";

    const playerStats = { hp: 20, maxHp: 20, equippedWeapon: null };

    const changeWorld = (stateName) => {
        currentState = stateName;
        runtime.objects.DialogPanelTop.getAllInstances().forEach(i => i.isVisible = false);
        runtime.objects.DialogPanelBottom.getAllInstances().forEach(i => i.isVisible = false);

        GameStates[stateName].init(runtime);
    };
    //                     runtime.objects.DialogPanelBottom.getAllInstances().isVisible = false;
    // runtime.objects.DialogPanelTop.getAllInstances().isVisible = false;
    // runtime.objects.DialogTextBottom.getAllInstances().isVisible = false;
    // runtime.objects.DialogTextTop.getAllInstances().isVisible = false;


    globalThis.InteractManager = InteractManager;



    // Code to run every tick
    runtime.addEventListener("tick", () => {
        // const dt = runtime.dt;
        // const player = runtime.objects.PlayerBox.getFirstInstance();

        // if (!player) return;

        // // Выход из режимов Битва/Сон на клавишу X
        // if (currentState !== "real" && input.is("exit")) {
        //     changeWorld("real");
        //     return;
        // }

        // if (currentState !== "real") return;

        // // --- 1. ПЕРЕМЕЩЕНИЕ И ВЫРАВНИВАНИЕ НА ГРАНЯХ ---
        // let dx = 0, dy = 0;
        // if (input.is("up")) dy = -1;
        // if (input.is("down")) dy = 1;
        // if (input.is("left")) dx = -1;
        // if (input.is("right")) dx = 1;

        // if (dx !== 0 || dy !== 0) {
        //     const speed = 150;
        //     const length = Math.hypot(dx, dy);

        //     // 1. Запоминаем текущую позицию на случай отката
        //     const oldX = player.x;
        //     const oldY = player.y;

        //     // 2. Считаем правильный шаг движения с учетом диагоналей
        //     const moveX = (dx / length) * speed * dt;
        //     const moveY = (dy / length) * speed * dt;

        //     // 3. Проверяем движение по оси X
        //     player.x += moveX;
        //     player.x = Math.max(player.width / 2, Math.min(runtime.layout.width - player.width / 2, player.x));

        //     // ИСПРАВЛЕНИЕ: Проверяем коллизию конкретно с объектами Entity на карте
        //     if (runtime.collisions.testOverlap(player, runtime.objects.Entity)) {
        //         player.x = oldX; // Если врезались в стену/камень, возвращаем обратно по X
        //     }
            
        //     // Если используете Tilemap для стен, раскомментируйте строку ниже:
        //     // if (runtime.collisions.testOverlap(player, runtime.objects.Tilemap)) player.x = oldX;

        //     // 4. Проверяем движение по оси Y
        //     player.y += moveY;
        //     player.y = Math.max(player.height / 2, Math.min(runtime.layout.height - player.height / 2, player.y));

        //     // ИСПРАВЛЕНИЕ: Точно так же точечно проверяем ось Y
        //     if (runtime.collisions.testOverlap(player, runtime.objects.Entity)) {
        //         player.y = oldY; // Если врезались, возвращаем обратно по Y
        //     }
            
        //     // Если используете Tilemap для стен, раскомментируйте строку ниже:
        //     // if (runtime.collisions.testOverlap(player, runtime.objects.Tilemap)) player.y = oldY;

        //     // 5. Включаем нужную анимацию (только если движение действительно произошло)
        //     if (player.x !== oldX || player.y !== oldY) {
        //         if (dy > 0) player.setAnimation("walk_down");
        //         else if (dy < 0) player.setAnimation("walk_up");
        //         else if (dx > 0) player.setAnimation("walk_right");
        //         else if (dx < 0) player.setAnimation("walk_left");
        //     }
        // }

        // --- 2. ВЗАИМОДЕЙСТВИЕ ---
    });
}