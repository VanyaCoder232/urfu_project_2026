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

    // Метод добавления предмета
    add(item) {
        // item: { id: "toy_knife", name: "Игрушечный нож", type: "weapon", value: 5 }
        this.items.push(item);
        console.log(`Добавлен предмет: ${item.name}. Всего в инвентаре:`, this.items);
        
        // Сюда можно добавить вызов функции Construct 3, 
        // которая визуально обновит UI инвентаря на экране
        // runtime.callFunction("UpdateInventoryUI");
    }

    // Метод проверки наличия предмета (например, для квестов или дверей)
    has(itemId) {
        return this.items.some(item => item.id === itemId);
    }

    // Метод удаления предмета
    remove(itemId) {
        const index = this.items.findIndex(item => item.id === itemId);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }
}


globalThis.Inventory = new Inventory();