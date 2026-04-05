/**
 * Player System and Upgrades
 * Manages player state, equipment, and upgrades
 */

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speedX = 0;
        this.speedY = 0;
        this.speed = 3;
        this.fuel = 100;
        this.maxFuel = 100;
        this.credits = 0;
        this.inventory = {};
        this.maxInventorySlots = 10;
        this.currentInventorySlots = 0;
        this.pickaxePower = 1;
        this.miningCooldown = 0;
        this.miningDelay = 10; // frames between mines
        this.alive = true;

        // Upgrades
        this.upgrades = {
            speed: 0,
            pickaxe: 0,
            fuelCapacity: 0,
            battery: 0,
            scanner: 0
        };

        // Upgrade costs (increases with each level)
        this.upgradeCosts = {
            speed: 500,
            pickaxe: 750,
            fuelCapacity: 600,
            battery: 400,
            scanner: 1000
        };
    }

    update() {
        if (!this.alive) return;

        // Apply friction
        this.speedX *= 0.85;
        this.speedY *= 0.85;

        // Update position
        this.x += this.speedX;
        this.y += this.speedY;

        // Fuel consumption during movement
        if (Math.abs(this.speedX) > 0.5 || Math.abs(this.speedY) > 0.5) {
            this.fuel -= 0.05;
        }

        // Mining cooldown
        if (this.miningCooldown > 0) {
            this.miningCooldown--;
        }

        // Check fuel
        if (this.fuel <= 0) {
            this.alive = false;
        }
    }

    moveLeft() {
        this.speedX = -this.speed;
    }

    moveRight() {
        this.speedX = this.speed;
    }

    moveUp() {
        this.speedY = -this.speed;
    }

    moveDown() {
        this.speedY = this.speed;
    }

    stopMoving() {
        this.speedX *= 0.8;
        this.speedY *= 0.8;
    }

    mine(terrain, x, y) {
        if (this.miningCooldown > 0) return null;

        const result = terrain.mineTile(x, y, this.pickaxePower);
        this.miningCooldown = this.miningDelay;

        if (result) {
            this.addToInventory(result.ore, result.value);
            return result;
        }
        return null;
    }

    addToInventory(ore, value) {
        if (!this.inventory[ore]) {
            this.inventory[ore] = { count: 0, value: value };
        }
        this.inventory[ore].count++;
        this.currentInventorySlots++;
        this.credits += value;
    }

    canCarryMore() {
        return this.currentInventorySlots < this.maxInventorySlots;
    }

    refuel() {
        const refuelAmount = 50;
        this.fuel = Math.min(this.fuel + refuelAmount, this.maxFuel);
    }

    applyUpgrade(upgradeType) {
        if (this.credits < this.upgradeCosts[upgradeType]) {
            return false;
        }

        this.credits -= this.upgradeCosts[upgradeType];
        this.upgrades[upgradeType]++;

        switch (upgradeType) {
            case 'speed':
                this.speed += 0.5;
                break;
            case 'pickaxe':
                this.pickaxePower += 0.5;
                this.miningDelay = Math.max(5, this.miningDelay - 1);
                break;
            case 'fuelCapacity':
                this.maxFuel += 25;
                this.fuel = this.maxFuel;
                break;
            case 'battery':
                this.fuel += 30;
                break;
            case 'scanner':
                // Scanner visual range will be increased in rendering
                break;
        }

        // Increase cost for next upgrade
        this.upgradeCosts[upgradeType] = Math.floor(this.upgradeCosts[upgradeType] * 1.3);

        return true;
    }

    getUpgradeInfo() {
        return {
            speed: {
                name: 'Engine Upgrade',
                currentLevel: this.upgrades.speed,
                description: 'Increases movement speed',
                cost: this.upgradeCosts.speed
            },
            pickaxe: {
                name: 'Pickaxe Enhancement',
                currentLevel: this.upgrades.pickaxe,
                description: 'Increases mining damage and speed',
                cost: this.upgradeCosts.pickaxe
            },
            fuelCapacity: {
                name: 'Fuel Tank',
                currentLevel: this.upgrades.fuelCapacity,
                description: 'Increases maximum fuel capacity',
                cost: this.upgradeCosts.fuelCapacity
            },
            battery: {
                name: 'Battery Pack',
                currentLevel: this.upgrades.battery,
                description: 'Instantly restores fuel',
                cost: this.upgradeCosts.battery
            },
            scanner: {
                name: 'Ore Scanner',
                currentLevel: this.upgrades.scanner,
                description: 'Reveals ore deposits on screen',
                cost: this.upgradeCosts.scanner
            }
        };
    }

    getStats() {
        const totalOre = Object.values(this.inventory).reduce((sum, item) => sum + item.count, 0);
        return {
            totalOre: totalOre,
            creditsEarned: this.credits,
            upgradesApplied: Object.values(this.upgrades).reduce((sum, val) => sum + val, 0),
            currentSpeed: this.speed,
            pickaxePower: this.pickaxePower,
            maxFuel: this.maxFuel
        };
    }

    draw(ctx, terrain) {
        // Draw player ship
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw glow
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();

        // Draw direction indicator
        ctx.fillStyle = '#ffff00';
        const dirLength = this.width / 2 + 8;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - dirLength);
        ctx.lineTo(this.x - 4, this.y);
        ctx.lineTo(this.x + 4, this.y);
        ctx.closePath();
        ctx.fill();
    }
}