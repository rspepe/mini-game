// ゲームの設定
const FRUITS = [
    { radius: 15, color: '#FF0000', score: 1, name: 'さくらんぼ', emoji: '🍒' },
    { radius: 22, color: '#FF0844', score: 3, name: 'いちご', emoji: '🍓' },
    { radius: 30, color: '#8A2BE2', score: 6, name: 'ぶどう', emoji: '🍇' },
    { radius: 38, color: '#FFA500', score: 10, name: 'ポンカン', emoji: '🍊' },
    { radius: 46, color: '#FF6633', score: 15, name: '柿', emoji: '🎃' },
    { radius: 54, color: '#FF0000', score: 21, name: 'りんご', emoji: '🍎' },
    { radius: 62, color: '#D4AF37', score: 28, name: '梨', emoji: '🍐' },
    { radius: 70, color: '#FFD700', score: 36, name: 'パイナップル', emoji: '🍍' },
    { radius: 86, color: '#008000', score: 55, name: 'スイカ', emoji: '🍉' }
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
            y: 150,
            vy: 0
        };
    }

    dropFruit() {
        this.fruits.push({
            ...this.nextFruit,
            x: this.mouseX,
            vy: 0
        });
        this.createNextFruit();
    }

    update() {
        if (this.gameOver) return;

        // 物理演算
        const gravity = 0.5;
        const friction = 0.5;
        const elasticity = 0.4;

        // フルーツの更新
        for (let i = 0; i < this.fruits.length; i++) {
            const fruit = this.fruits[i];
            fruit.vy += gravity;
            fruit.y += fruit.vy;

            // 床と壁との衝突
            if (fruit.y + fruit.radius > this.canvas.height) {
                fruit.y = this.canvas.height - fruit.radius;
                fruit.vy *= -elasticity;
            }
            // 左壁との衝突
            if (fruit.x - fruit.radius < 0) {
                fruit.x = fruit.radius;
            }
            // 右壁との衝突
            if (fruit.x + fruit.radius > this.canvas.width) {
                fruit.x = this.canvas.width - fruit.radius;
            }

            // 他のフルーツとの衝突
            for (let j = i + 1; j < this.fruits.length; j++) {
                const other = this.fruits[j];
                const dx = other.x - fruit.x;
                const dy = other.y - fruit.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = fruit.radius + other.radius;

                if (distance < minDistance * 0.8) {
                    // 衝突時の位置調整（さらに厳密な方法）
                    const angle = Math.atan2(dy, dx);
                    const overlap = (minDistance - distance) * 1.2;
                    
                    // 重なりを解消する量を計算
                    const moveX = Math.cos(angle) * overlap / 2;
                    const moveY = Math.sin(angle) * overlap / 2;
                    
                    // フルーツの位置を調整
                    fruit.x -= moveX;
                    fruit.y -= moveY;
                    other.x += moveX;
                    other.y += moveY;
                    
                    // 壁との衝突を考慮して位置を制限
                    fruit.x = Math.max(fruit.radius, Math.min(this.canvas.width - fruit.radius, fruit.x));
                    fruit.y = Math.max(fruit.radius, Math.min(this.canvas.height - fruit.radius, fruit.y));
                    other.x = Math.max(other.radius, Math.min(this.canvas.width - other.radius, other.x));
                    other.y = Math.max(other.radius, Math.min(this.canvas.height - other.radius, other.y));

                    // 同じ種類のフルーツが衝突した場合、合体
                    if (fruit.radius === other.radius) {
                        const nextFruitIndex = FRUITS.findIndex(f => f.radius === fruit.radius) + 1;
                        if (nextFruitIndex < FRUITS.length) {
                            fruit.radius = FRUITS[nextFruitIndex].radius;
                            fruit.color = FRUITS[nextFruitIndex].color;
                            fruit.score = FRUITS[nextFruitIndex].score;
                            fruit.name = FRUITS[nextFruitIndex].name;
                            fruit.emoji = FRUITS[nextFruitIndex].emoji;
                            this.fruits.splice(j, 1);
                            this.score += FRUITS[nextFruitIndex].score;
                            document.getElementById('score').textContent = `スコア: ${this.score}`;
                        }
                    }
                }
            }
        }

        // ゲームオーバー判定（落下中のフルーツは除外）
        for (const fruit of this.fruits) {
            if (fruit.y - fruit.radius < 100 && Math.abs(fruit.vy) < 2 && fruit.y < 150) { // 上部境界線 + 静止判定 + 初期位置除外
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
            // フルーツの背景
            this.ctx.beginPath();
            this.ctx.arc(this.mouseX, this.nextFruit.y, this.nextFruit.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.nextFruit.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.stroke();

            // 絵文字
            this.ctx.font = `${this.nextFruit.radius}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.nextFruit.emoji, this.mouseX, this.nextFruit.y);
        }

        // 落下中のフルーツ
        for (const fruit of this.fruits) {
            // フルーツの背景
            this.ctx.beginPath();
            this.ctx.arc(fruit.x, fruit.y, fruit.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = fruit.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.stroke();

            // 絵文字
            this.ctx.font = `${fruit.radius}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(fruit.emoji, fruit.x, fruit.y);
        }
    }
}

// ゲーム開始
new Game();
