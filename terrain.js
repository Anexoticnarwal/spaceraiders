/**
 * Terrain Generation System
 * Creates procedural space mining terrain with various ore types and obstacles
 */

class TerrainGenerator {
    constructor(width, height, tileSize = 40) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.grid = [];
        this.oreValues = {
            'stone': 0,
            'copper': 50,
            'silver': 100,
            'gold': 200,
            'platinum': 500,
            'rare': 1000
        };
        this.generateTerrain();
    }

    generateTerrain() {
        this.grid = [];
        
        // Initialize grid
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = {
                    type: 'empty',
                    ore: null,
                    mined: false,
                    health: 100,
                    depth: y
                };
            }
        }

        // Top area - safe zone (shallow)
        this.fillWithOre(0, Math.floor(this.height * 0.15), 'stone', 0.7);

        // Layer 1 - copper zone (shallow)
        this.fillWithOre(
            Math.floor(this.height * 0.15),
            Math.floor(this.height * 0.35),
            'stone',
            0.8,
            { copper: 0.3 }
        );

        // Layer 2 - silver zone (medium)
        this.fillWithOre(
            Math.floor(this.height * 0.35),
            Math.floor(this.height * 0.55),
            'stone',
            0.85,
            { copper: 0.2, silver: 0.3 }
        );

        // Layer 3 - gold zone (deep)
        this.fillWithOre(
            Math.floor(this.height * 0.55),
            Math.floor(this.height * 0.8),
            'stone',
            0.9,
            { silver: 0.2, gold: 0.3, rare: 0.1 }
        );

        // Layer 4 - platinum zone (very deep)
        this.fillWithOre(
            Math.floor(this.height * 0.8),
            this.height,
            'stone',
            0.95,
            { gold: 0.2, platinum: 0.3, rare: 0.15 }
        );
    }

    fillWithOre(startY, endY, baseType, density, oreDistribution = {}) {
        for (let y = startY; y < endY; y++) {
            for (let x = 0; x < this.width; x++) {
                if (Math.random() < density) {
                    let oreName = baseType;

                    // Determine ore type based on distribution
                    const rand = Math.random();
                    let cumulative = 0;
                    for (const [ore, chance] of Object.entries(oreDistribution)) {
                        cumulative += chance;
                        if (rand < cumulative) {
                            oreName = ore;
                            break;
                        }
                    }

                    this.grid[y][x] = {
                        type: 'solid',
                        ore: oreName,
                        mined: false,
                        health: this.getOreHealth(oreName),
                        depth: y
                    };
                }
            }
        }

        // Create some empty spaces for navigation
        this.createCaves(startY, endY);
    }

    createCaves(startY, endY) {
        for (let i = 0; i < Math.floor((endY - startY) * 0.3); i++) {
            const caveX = Math.floor(Math.random() * (this.width - 3));
            const caveY = startY + Math.floor(Math.random() * (endY - startY));
            
            // Create small cave
            for (let dy = 0; dy < 2; dy++) {
                for (let dx = 0; dx < 3; dx++) {
                    const y = caveY + dy;
                    const x = caveX + dx;
                    if (y < this.height && x < this.width) {
                        this.grid[y][x] = {
                            type: 'empty',
                            ore: null,
                            mined: true,
                            health: 0,
                            depth: y
                        };
                    }
                }
            }
        }
    }

    getOreHealth(oreName) {
        const healthMap = {
            'stone': 1,
            'copper': 2,
            'silver': 3,
            'gold': 4,
            'platinum': 5,
            'rare': 6
        };
        return healthMap[oreName] || 1;
    }

    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return { type: 'empty', ore: null, mined: true };
        }
        return this.grid[y][x];
    }

    mineTile(x, y, damage = 1) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }

        const tile = this.grid[y][x];
        if (tile.type === 'empty' || tile.mined) {
            return null;
        }

        tile.health -= damage;
        if (tile.health <= 0) {
            tile.mined = true;
            tile.type = 'empty';
            return {
                ore: tile.ore,
                value: this.oreValues[tile.ore] || 0
            };
        }

        return null; // Not yet broken
    }

    getVisibleTiles(playerX, playerY, viewRadius = 5) {
        const tiles = [];
        for (let dy = -viewRadius; dy <= viewRadius; dy++) {
            for (let dx = -viewRadius; dx <= viewRadius; dx++) {
                const x = Math.floor(playerX / this.tileSize) + dx;
                const y = Math.floor(playerY / this.tileSize) + dy;
                const tile = this.getTile(x, y);
                tiles.push({
                    x: x * this.tileSize,
                    y: y * this.tileSize,
                    gridX: x,
                    gridY: y,
                    ...tile
                });
            }
        }
        return tiles;
    }

    getDepth(y) {
        return Math.floor(y / this.tileSize) * 10;
    }

    getGridCoordinates(x, y) {
        return {
            x: Math.floor(x / this.tileSize),
            y: Math.floor(y / this.tileSize)
        };
    }

    reset() {
        this.generateTerrain();
    }
}