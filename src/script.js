'use strict';

import './style.scss';

let canvas = document.getElementById('js-canvas');
let ctx = canvas.getContext('2d');

// 线条设置
let config = {
    width: 3,
    color: '#000',
};
ctx.lineCap = 'round';
// 线条对象数组
let lineList = [];

/* 
    绘制画布辅助线
*/
let drawGuideline = function() {
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
let clearCanvas = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/* 
    创建线条对象
*/
let lineFn = {
    addPoint(x, y) {
        this.points.push([x, y]);
    }
};
let newLine = function(x, y) {
    let line = Object.create(lineFn);
    line.width = config.width;
    line.color = config.color;

    line.points = [[x, y]];

    return line;
};

/* 
    绘制线条
*/
let drawLine = function(line) {
    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.width;

    ctx.beginPath();
    for (let i = 1, len = line.points.length; i < len-1; i++) {
        let startX, startY, controlX, controlY, endX, endY;

        if (i === 1) {
            startX = line.points[i-1][0];
            startY = line.points[i-1][1];
            controlX = line.points[i][0];
            controlY = line.points[i][1];
            endX = (line.points[i][0] + line.points[i+1][0]) / 2;
            endY = (line.points[i][1] + line.points[i+1][1]) / 2;
        }
        else if (i === len-1) {
            startX = (line.points[i-1][0] + line.points[i][0]) / 2;
            startY = (line.points[i-1][1] + line.points[i][1]) / 2;
            controlX = line.points[i][0];
            controlY = line.points[i][1];
            endX = line.points[i+1][0];
            endY = line.points[i+1][0];
        }
        else {
            startX = (line.points[i-1][0] + line.points[i][0]) / 2;
            startY = (line.points[i-1][1] + line.points[i][1]) / 2;
            controlX = line.points[i][0];
            controlY = line.points[i][1];        
            endX = (line.points[i][0] + line.points[i+1][0]) / 2;
            endY = (line.points[i][1] + line.points[i+1][1]) / 2;
        }
        
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    }
    ctx.stroke();
};

/* 
    鼠标监听
*/
let attachDrawListener = function() {
    let startDraw = function(e) {
        let line = newLine(e.offsetX, e.offsetY);
        lineList.push(line);

        canvas.addEventListener('mousemove', drawing);
    };
    let drawing = (function() {
        let timeoutId = null;

        return function(e) {
            if (timeoutId !== null) {
                return;
            }

            timeoutId = setTimeout(function() {
                let line = lineList[lineList.length - 1];
                line.addPoint(e.offsetX, e.offsetY);

                timeoutId = null;
            }, 25);
        }
    })();
    let endDraw = function(e) {
        canvas.removeEventListener('mousemove', drawing);
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseout', endDraw);
}

/* 
    一次绘制
*/
let paint = function() {
    clearCanvas();

    drawGuideline();

    for (let line of lineList) {
        drawLine(line);
    }
}

/* 
    渲染
*/
let rendering = function() {
    paint();

    requestAnimationFrame(rendering);
}

/* 
    开始
*/
attachDrawListener();
rendering();
