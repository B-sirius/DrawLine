'use strict';

import './style.scss';

/* 
    基本变量
*/
let canvas = document.getElementById('js-canvas');
let ctx = canvas.getContext('2d');

/* 
    两点间距离
*/
let distenceBetween = function (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

// 线条设置
let config = {
    width: 3,
    color: '#000',
    vibration: 3,
};
ctx.lineCap = 'round';
// 线条对象数组
const lineList = [];
// 用于绘制的线条对象数组
let lineListToDraw = lineList;
// 辅助点
let currPoint = [];


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
            config.width = item;
        });
    }
    widthMenu.appendChild(widthFragment);

    // 颜色下拉列表
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
 
            config.color = color;
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

})();

/* 
    按钮监听
*/
let btnListener = (function () {
    // 撤回按钮
    let undoBtn = document.querySelector('#js-undo_btn');
    undoBtn.addEventListener('click', function() {
        lineList.pop();
    });
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey && e.keyCode === 90) {
            lineList.pop();
        }
    });

    // 回放按钮
    let playBtn = document.querySelector('#js-play_btn');
    playBtn.addEventListener('click', function() {
        let playLineList = [newLine()];
        lineListToDraw = playLineList;
        
        let currLineIndex = 0;
        let currPointIndex = 0;

        let play = function() {
            if (currLineIndex < lineList.length) {
                let currPoint = lineList[currLineIndex].points[currPointIndex];
                playLineList[playLineList.length - 1].addPoint(currPoint[0], currPoint[1]);
                currPointIndex++;

                if (currPointIndex >= lineList[currLineIndex].points.length - 1) {
                    currLineIndex++;
                    currPointIndex = 0;

                    playLineList.push(newLine());
                }

                setTimeout(play, 30);
            }
        }

        play();
    });

    // 颜色按钮
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

    // 宽度按钮
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
})();

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
    line.width = config.width;
    line.color = config.color;
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
    let vibrationX = (Math.random() - 0.5) * config.vibration;
    let vibrationY = (Math.random() - 0.5) * config.vibration;

    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.width;

    ctx.beginPath();
    if (line.points.length === 1) {
        ctx.moveTo(line.points[0][0], line.points[0][1]);
        ctx.lineTo(line.points[0][0], line.points[0][1])
    }
    else {
        for (let i = 1, len = line.points.length; i < len - 1; i++) {
            if (i === 1) {
                startX = line.points[i - 1][0];
                startY = line.points[i - 1][1];
                controlX = line.points[i][0];
                controlY = line.points[i][1];
                endX = (line.points[i][0] + line.points[i + 1][0]) / 2;
                endY = (line.points[i][1] + line.points[i + 1][1]) / 2;
            }
            else if (i === len - 1) {
                line.points[i+1][0];
                line.points[i+1][1];
    
                startX = endX;
                startY = endY;
                controlX = line.points[i][0];
                controlY = line.points[i][1];
                endX = line.points[i + 1][0];
                endY = line.points[i + 1][0];
            }
            else {
                line.points[i+1][0];
                line.points[i+1][1];
    
                startX = endX;
                startY = endY;
                controlX = line.points[i][0];
                controlY = line.points[i][1];
                endX = (line.points[i][0] + line.points[i + 1][0]) / 2;
                endY = (line.points[i][1] + line.points[i + 1][1]) / 2;
            }
    
            // if (distenceBetween(startX, startY, endX, endY) > 2) {
            //     vibrationX = (Math.random() - 0.5) * config.vibration;
            //     vibrationY = (Math.random() - 0.5) * config.vibration;            
            // }
    
            // controlX += vibrationX;
            // controlY += vibrationY;
            // endX += vibrationX;
            // endY += vibrationY;
    
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        }
    }
    ctx.stroke();
};

/* 
    绘制鼠标当前辅助绘制点
*/
let drawPoint = function() {
    if (currPoint.length) {
        ctx.beginPath();
        ctx.arc(currPoint[0], currPoint[1], config.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
    }
}

/* 
    鼠标监听
*/
let attachDrawListener = function () {
    let startDraw = function (e) {
        let line = newLine(e.offsetX, e.offsetY);
        lineList.push(line);

        canvas.addEventListener('mousemove', drawing);
    };
    let drawing = (function () {
        let timeoutId = null;

        return function (e) {
            if (timeoutId !== null) {
                return;
            }

            timeoutId = setTimeout(function () {
                let line = lineList[lineList.length - 1];
                line.addPoint(e.offsetX, e.offsetY);

                timeoutId = null;
            }, 25);
        }
    })();
    let endDraw = function (e) {
        currPoint = [];
        canvas.removeEventListener('mousemove', drawing);
    }

    let movePoint = function(e) {
        currPoint = [e.offsetX, e.offsetY];
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseout', endDraw);
    canvas.addEventListener('mousemove', movePoint);
}

/* 
    一次绘制
*/
let paint = function () {
    clearCanvas();

    drawGuideline();

    for (let line of lineListToDraw) {
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
