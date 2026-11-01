// Состояния игры (в каком мире находится игрок)
export const GameStates = {
    real: {
        init: (runtime) => {
            runtime.objects.BlackOverlay.getFirstInstance().isVisible = false;
            runtime.layout.getLayer("Game").isVisible = true;
        }
    },
    battle: {
        init: (runtime) => {
            runtime.objects.BlackOverlay.getFirstInstance().isVisible = true;
            runtime.layout.getLayer("Game").isVisible = false; // Прячем реальный мир
            
            // Выводим сообщение в нижнюю панель
            const panel = runtime.objects.DiagPanelBottom.getFirstInstance();
            const txt = runtime.objects.DiagTextBottom.getFirstInstance();
            panel.isVisible = true;
            txt.text = "Вы в режиме СРАЖЕНИЕ. Нажмите X, чтобы выйти.";
        }
    },
    dream: {
        init: (runtime) => {
            runtime.objects.BlackOverlay.getFirstInstance().isVisible = true;
            runtime.layout.getLayer("Game").isVisible = false;
            
            const panel = runtime.objects.DiagPanelBottom.getFirstInstance();
            const txt = runtime.objects.DiagTextBottom.getFirstInstance();
            panel.isVisible = true;
            txt.text = "Вы в режиме СНОВ. Нажмите X, чтобы выйти.";
        }
    }
};
