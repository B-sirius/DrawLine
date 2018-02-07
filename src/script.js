'use strict';

import './style.scss';

let canvas = document.getElementById('js-canvas');
let ctx = canvas.getContext('2d');
ctx.lineCap = 'round';

/* 
    两点间距离
*/
// let distenceBetween = function (x1, y1, x2, y2) {
//     return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
// }

// 线条设置
let CONFIG = {
    width: 3,
    color: '#000',
    vibration: 3,
};

// 全局变量
let GOLBAL = {
    lineList: [], // 线条集合
    currPoint: [], // 辅助点
    totalCount: 0, // 所有的点数
    progressCount: Infinity, // 回放时，当前进度的点数
    currCount: 0, // 回放时，已绘制点数
    currProgress: 0, // 回放下的进度
};

/* 
    初始化菜单栏
*/
// 线条宽度
const WIDTH_SET = [1, 2, 4, 8, 16, 32, 48];
// 颜色（hsl）
const COLOR_SET = [[0, 0, 0], [0, 0, 33], [0, 0, 60], [204, 88, 34], [204, 62, 53], [204, 75, 75], [5, 83, 53], [17, 91, 59], [20, 89, 74], [97, 66, 30], [88, 81, 46], [65, 83, 57], [304, 26, 50], [309, 85, 73], [60, 1, 5], [26, 58, 34], [26, 84, 62], [0, 0, 100]];

/* 
    初始化下拉列表
*/
let initDropdown = (function () {
    // 宽度下拉列表
    {
        let widthMenu = document.querySelector('#js-width_menu');
        let widthFragment = document.createDocumentFragment();
        for (let item of WIDTH_SET) {
            let li = document.createElement('li');
            li.className = 'dropdown-item';
    
            let span = document.createElement('span');
            span.className = 'circle';
            span.style.width = item + 'px';
            span.style.height = item + 'px';
    
            widthFragment.appendChild(li);
            li.appendChild(span);
    
            li.addEventListener('click', function () {
                CONFIG.width = item;
            });
        }
        widthMenu.appendChild(widthFragment);
    }

    // 颜色下拉列表
    {
        let colorBtn = document.querySelector('#js-color_btn');
        let colorMenu = document.querySelector('#js-color_menu');
        let colorFragment = document.createDocumentFragment();
        for (let item of COLOR_SET) {
            let li = document.createElement('li');
            li.className = 'dropdown-item';
    
            let span = document.createElement('span');
            span.className = 'circle';
            span.style.background = `hsl(${item[0]}, ${item[1]}%, ${item[2]}%)`;
    
            colorFragment.appendChild(li);
            li.appendChild(span);
    
            li.addEventListener('click', function () {
                let color = `hsl(${item[0]}, ${item[1]}%, ${item[2]}%)`;
                let darkerL = item[2] - 20 < 0 ? 0 : item[2] - 20;
                let darkerColor = `hsl(${item[0]}, ${item[1]}%, ${darkerL}%)`;
    
                CONFIG.color = color;
                // 按钮颜色改变
                colorBtn.style.background = color;
                colorBtn.style.boxShadow = `1px 1px 0 ${darkerColor}, 2px 2px 0 ${darkerColor}, 3px 3px 0 ${darkerColor}`;
                if (color == 'hsl(0, 0%, 100%)') {
                    colorBtn.style.color = '#000';
                } else {
                    colorBtn.style.color = '#fff';
                }
            });
        }
        colorMenu.appendChild(colorFragment);
    }
})();

/* 
    菜单按钮监听
*/
let btnListener = (function () {
    // 撤回按钮
    {
        let undo = function() {
            GOLBAL.lineList.pop();
        };
        // 按钮监听
        let undoBtn = document.querySelector('#js-undo_btn');
        undoBtn.addEventListener('click', undo);
        // 键盘监听
        document.addEventListener('keydown', function (e) {
            if (e.ctrlKey || e.metaKey && e.keyCode === 90) {
                undo();
            }
        });
    }

    // 回放按钮
    {
        let play = function() {
            GOLBAL.currCount = 0;
            GOLBAL.progressCount = Math.floor(GOLBAL.totalCount * 0.5);
        }

        let playBtn = document.querySelector('#js-play_btn');
        playBtn.addEventListener('click', function () {
            play();
        });
    }

    // 颜色按钮
    {
        let colorBtn = document.querySelector('#js-color_btn');
        let colorDropdown = document.querySelector('#js-color_dropdown');
        colorBtn.addEventListener('mouseover', function () {
            colorDropdown.classList.add('open');
        });
        colorBtn.addEventListener('mouseleave', function () {
            colorDropdown.classList.remove('open');
        });
        colorDropdown.addEventListener('mouseenter', function () {
            colorDropdown.classList.add('open');
        });
        colorDropdown.addEventListener('mouseleave', function () {
            colorDropdown.classList.remove('open');
        });
        colorDropdown.addEventListener('click', function (e) {
            if (e.target.classList.contains('circle') || e.target.classList.contains('dropdown-item'))
                colorDropdown.classList.remove('open');
        });
    }

    // 宽度按钮
    {
        let widthBtn = document.querySelector('#js-width_btn');
        let widthDropdown = document.querySelector('#js-width_dropdown');
        widthBtn.addEventListener('mouseover', function () {
            widthDropdown.classList.add('open');
        });
        widthBtn.addEventListener('mouseleave', function () {
            widthDropdown.classList.remove('open');
        });
        widthDropdown.addEventListener('mouseenter', function () {
            widthDropdown.classList.add('open');
        });
        widthDropdown.addEventListener('mouseleave', function () {
            widthDropdown.classList.remove('open');
        });
        widthDropdown.addEventListener('click', function (e) {
            if (e.target.classList.contains('circle') || e.target.classList.contains('dropdown-item'))
                widthDropdown.classList.remove('open');
        });
    }
})();

/* 
    鼠标绘图监听
*/
let attachDrawListener = function () {
    let startDraw = function (e) {
        let line = newLine(e.offsetX, e.offsetY);
        GOLBAL.lineList.push(line);

        canvas.addEventListener('mousemove', drawing);
    };

    let drawing = (function () {
        let timeoutId = null;

        return function (e) {
            if (timeoutId !== null) {
                return;
            }

            timeoutId = setTimeout(function () {
                let line = GOLBAL.lineList[GOLBAL.lineList.length - 1];
                line.addPoint(e.offsetX, e.offsetY);
                
                GOLBAL.totalCount++;
                
                timeoutId = null;
            }, 25);
        }
    })();

    let endDraw = function (e) {
        GOLBAL.currPoint = [];
        canvas.removeEventListener('mousemove', drawing);
    }

    let movePoint = function (e) {
        GOLBAL.currPoint = [e.offsetX, e.offsetY];
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseout', endDraw);
    canvas.addEventListener('mousemove', movePoint);
}

/* 
    绘制画布辅助线
*/
let drawGuideline = function () {
    let spacing = 20; // 辅助线间隔
    ctx.strokeStyle = 'hsla(182, 84%, 36%, 0.2)';
    ctx.lineWidth = 1;

    for (let x = spacing; x < canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = spacing; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.clientWidth, y);
        ctx.stroke();
    }
};

/* 
    清除画布
*/
let clearCanvas = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/* 
    创建线条对象
*/
let lineFn = {
    addPoint(x, y) {
        this.points.push([x, y]);
    },
    top() {
        return this.points[this.points.length - 1];
    }
};
let newLine = function (x, y) {
    let line = Object.create(lineFn);
    line.width = CONFIG.width;
    line.color = CONFIG.color;
    if (x && y) {
        line.points = [[x, y]];
    } else {
        line.points = [];
    }

    return line;
};

/* 
    绘制线条
*/
let drawLine = function (line) {
    let startX, startY, controlX, controlY, endX, endY;
    let vibrationX = (Math.random() - 0.5) * CONFIG.vibration;
    let vibrationY = (Math.random() - 0.5) * CONFIG.vibration;

    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.width;

    ctx.beginPath();
    if (line.points.length === 1) {
        ctx.moveTo(line.points[0][0], line.points[0][1]);
        ctx.lineTo(line.points[0][0], line.points[0][1]);

        GOLBAL.currCount++;        
    }
    else {
        for (let i = 1, len = line.points.length; i < len - 1 && GOLBAL.currCount <= GOLBAL.progressCount; i++) {
            if (i === 1) {
                startX = line.points[i - 1][0];
                startY = line.points[i - 1][1];
                controlX = line.points[i][0];
                controlY = line.points[i][1];
                endX = (line.points[i][0] + line.points[i + 1][0]) / 2;
                endY = (line.points[i][1] + line.points[i + 1][1]) / 2;
            }
            else if (i === len - 1) {
                line.points[i + 1][0];
                line.points[i + 1][1];

                startX = endX;
                startY = endY;
                controlX = line.points[i][0];
                controlY = line.points[i][1];
                endX = line.points[i + 1][0];
                endY = line.points[i + 1][0];
            }
            else {
                line.points[i + 1][0];
                line.points[i + 1][1];

                startX = endX;
                startY = endY;
                controlX = line.points[i][0];
                controlY = line.points[i][1];
                endX = (line.points[i][0] + line.points[i + 1][0]) / 2;
                endY = (line.points[i][1] + line.points[i + 1][1]) / 2;
            }

            // if (distenceBetween(startX, startY, endX, endY) > 2) {
            //     vibrationX = (Math.random() - 0.5) * CONFIG.vibration;
            //     vibrationY = (Math.random() - 0.5) * CONFIG.vibration;            
            // }

            // controlX += vibrationX;
            // controlY += vibrationY;
            // endX += vibrationX;
            // endY += vibrationY;

            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(controlX, controlY, endX, endY);

            GOLBAL.currCount++;
        }
    }
    ctx.stroke();
};

/* 
    绘制鼠标当前辅助绘制点
*/
let drawPoint = function () {
    if (GOLBAL.currPoint.length) {
        ctx.beginPath();
        ctx.arc(GOLBAL.currPoint[0], GOLBAL.currPoint[1], CONFIG.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
    }
}

/* 
    一次绘制
*/
let paint = function () {
    clearCanvas();

    drawGuideline();

    GOLBAL.currCount = 0;
    for (let line of GOLBAL.lineList) {
        if (GOLBAL.currCount >= GOLBAL.progressCount)
            break;

        drawLine(line);
    }

    drawPoint();
}

/* 
    渲染
*/
let rendering = function () {
    paint();
    requestAnimationFrame(rendering);
}

/* 
    开始
*/
attachDrawListener();
rendering();
