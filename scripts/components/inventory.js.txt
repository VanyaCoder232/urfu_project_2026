// Для описания инвентаря игрока
export class Inventory {
    constructor() {
        this.items = [];
    }

    add(item) {
        this.items.push(item);
        console.log(`Получен предмет: ${item.name}`);
    }

    use(itemId, playerStats) {
        const idx = this.items.findIndex(i => i.id === itemId);
        if (idx === -1) return;

        const item = this.items[idx];
        if (item.type === "healing") {
            playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + item.value);
            this.items.splice(idx, 1); // Удаляем лечилку после использования
        } else if (item.type === "weapon") {
            playerStats.equippedWeapon = item; // Экипируем оружие
        }
    }
}
