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
let lineList = [];

/* 
    初始化菜单栏
*/
const WIDTH_SET = [1, 2, 4, 8, 16];
const COLOR_SET = ['#000000', '#555555', '#999999', '#0a67a3', '#3e97d1', '#8ec9ef', '#ff0000', '#f56c36', '#f8a881', '#407f1a', '#7ed616', '#ddec38', '#a15f9d', '#f580e3', '#ffff00', '#8a5025', '#ef934d', '#ffffff'];
let initMenu = (function () {
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

    let colorBtn = document.querySelector('#js-color_btn');
    let colorMenu = document.querySelector('#js-color_menu');
    let colorFragment = document.createDocumentFragment();
    for (let item of COLOR_SET) {
        let li = document.createElement('li');
        li.className = 'dropdown-item';

        let span = document.createElement('span');
        span.className = 'circle';
        span.style.background = item;

        colorFragment.appendChild(li);
        li.appendChild(span);

        li.addEventListener('click', function () {
            config.color = item;
            colorBtn.style.background = item;
            if (item === '#ffffff') {
                colorBtn.style.color = '#000';
            } else {
                colorBtn.style.color = '#fff';
            }
        });
    }
    colorMenu.appendChild(colorFragment);

})();

/* 
    下拉列表监听
*/
let dropdownListener = (function () {
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

    line.points = [[x, y]];

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
    for (let i = 1, len = line.points.length; i < len - 1; i++) {
        if (i === 1) {
            line.points[i - 1][0] += vibrationX;
            line.points[i - 1][1] += vibrationY;
            line.points[i][0] += vibrationX;
            line.points[i][1] += vibrationY;
            line.points[i+1][0] += vibrationX;
            line.points[i+1][1] += vibrationY;

            startX = line.points[i - 1][0];
            startY = line.points[i - 1][1];
            controlX = line.points[i][0];
            controlY = line.points[i][1];
            endX = (line.points[i][0] + line.points[i + 1][0]) / 2;
            endY = (line.points[i][1] + line.points[i + 1][1]) / 2;
        }
        else if (i === len - 1) {
            line.points[i+1][0] += vibrationX;
            line.points[i+1][1] += vibrationY;

            startX = endX;
            startY = endY;
            controlX = line.points[i][0];
            controlY = line.points[i][1];
            endX = line.points[i + 1][0];
            endY = line.points[i + 1][0];
        }
        else {
            line.points[i+1][0] += vibrationX;
            line.points[i+1][1] += vibrationY;

            startX = endX;
            startY = endY;
            controlX = line.points[i][0];
            controlY = line.points[i][1];
            endX = (line.points[i][0] + line.points[i + 1][0]) / 2;
            endY = (line.points[i][1] + line.points[i + 1][1]) / 2;
        }

        if (distenceBetween(startX, startY, endX, endY) > 2) {
            vibrationX = (Math.random() - 0.5) * config.vibration;
            vibrationY = (Math.random() - 0.5) * config.vibration;            
        }

        // controlX += vibrationX;
        // controlY += vibrationY;
        // endX += vibrationX;
        // endY += vibrationY;

        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    }
    ctx.stroke();
};

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
        canvas.removeEventListener('mousemove', drawing);
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseout', endDraw);
}

/* 
    一次绘制
*/
let paint = function () {
    clearCanvas();

    drawGuideline();

    for (let line of lineList) {
        drawLine(line);
    }
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
