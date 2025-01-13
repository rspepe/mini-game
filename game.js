// ゲームの設定
const FRUITS = [
    { radius: 15, color: '#FF9999', score: 1, name: 'チェリー' },
    { radius: 22, color: '#FFB366', score: 3, name: 'みかん' },
    { radius: 30, color: '#FFFF99', score: 6, name: 'レモン' },
    { radius: 38, color: '#99FF99', score: 10, name: 'キウイ' },
    { radius: 46, color: '#FF99FF', score: 15, name: 'ぶどう' },
    { radius: 54, color: '#FF9966', score: 21, name: 'もも' },
    { radius: 62, color: '#FF6666', score: 28, name: 'りんご' },
    { radius: 70, color: '#FFCC66', score: 36, name: 'パイナップル' },
    { radius: 78, color: '#99FF66', score: 45, name: 'メロン' },
    { radius: 86, color: '#FF6699', score: 55, name: 'スイカ' }
];

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.fruits = [];
        this.nextFruit = null;
        this.gameOver = false;
        this.mouseX = this.canvas.width / 2;
        
        // イベントリスナーの設定
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseX = Math.max(this.nextFruit.radius, Math.min(this.canvas.width - this.nextFruit.radius, this.mouseX));
        });
        
        this.canvas.addEventListener('click', () => {
            if (this.nextFruit && !this.gameOver) {
                this.dropFruit();
            }
        });

        this.createNextFruit();
        this.update();
    }

    createNextFruit() {
        this.nextFruit = {
            ...FRUITS[Math.floor(Math.random() * 5)], // 最初の5種類からランダム
            x: this.canvas.width / 2,
            y: 50,
            vy: 0
        };
    }

    dropFruit() {
        this.fruits.push({
            ...this.nextFruit,
            x: this.mouseX
        });
        this.createNextFruit();
    }

    update() {
        if (this.gameOver) return;

        // 物理演算
        const gravity = 0.5;
        const friction = 0.8;
        const elasticity = 0.6;

        // フルーツの更新
        for (let i = 0; i < this.fruits.length; i++) {
            const fruit = this.fruits[i];
            fruit.vy += gravity;
            fruit.y += fruit.vy;

            // 床との衝突
            if (fruit.y + fruit.radius > this.canvas.height) {
                fruit.y = this.canvas.height - fruit.radius;
                fruit.vy *= -elasticity;
            }

            // 他のフルーツとの衝突
            for (let j = i + 1; j < this.fruits.length; j++) {
                const other = this.fruits[j];
                const dx = other.x - fruit.x;
                const dy = other.y - fruit.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = fruit.radius + other.radius;

                if (distance < minDistance) {
                    // 衝突時の位置調整
                    const angle = Math.atan2(dy, dx);
                    const targetX = fruit.x + Math.cos(angle) * minDistance;
                    const targetY = fruit.y + Math.sin(angle) * minDistance;
                    
                    const ax = (targetX - other.x) * 0.05;
                    const ay = (targetY - other.y) * 0.05;
                    
                    fruit.x -= ax;
                    fruit.y -= ay;
                    other.x += ax;
                    other.y += ay;

                    // 同じ種類のフルーツが衝突した場合、合体
                    if (fruit.radius === other.radius) {
                        const nextFruitIndex = FRUITS.findIndex(f => f.radius === fruit.radius) + 1;
                        if (nextFruitIndex < FRUITS.length) {
                            fruit.radius = FRUITS[nextFruitIndex].radius;
                            fruit.color = FRUITS[nextFruitIndex].color;
                            fruit.score = FRUITS[nextFruitIndex].score;
                            fruit.name = FRUITS[nextFruitIndex].name;
                            this.fruits.splice(j, 1);
                            this.score += FRUITS[nextFruitIndex].score;
                            document.getElementById('score').textContent = `スコア: ${this.score}`;
                        }
                    }
                }
            }
        }

        // ゲームオーバー判定
        for (const fruit of this.fruits) {
            if (fruit.y - fruit.radius < 100) { // 上部境界線
                this.gameOver = true;
                document.getElementById('game-over').style.display = 'block';
                document.getElementById('final-score').textContent = this.score;
                return;
            }
        }

        // 描画
        this.draw();
        requestAnimationFrame(() => this.update());
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 上部境界線
        this.ctx.beginPath();
        this.ctx.moveTo(0, 100);
        this.ctx.lineTo(this.canvas.width, 100);
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.stroke();

        // 次のフルーツ
        if (this.nextFruit) {
            this.ctx.beginPath();
            this.ctx.arc(this.mouseX, this.nextFruit.y, this.nextFruit.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.nextFruit.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.stroke();
        }

        // 落下中のフルーツ
        for (const fruit of this.fruits) {
            this.ctx.beginPath();
            this.ctx.arc(fruit.x, fruit.y, fruit.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = fruit.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.stroke();
        }
    }
}

// ゲーム開始
new Game();
