'use strict';

import './style.scss';
import { start } from 'pretty-error';

let DrawLine = {
    $: {
        canvas: document.querySelector('#js-canvas'),
        colorBtn: document.querySelector('#js-color_btn'),
        colorDropdown: document.querySelector('#js-color_dropdown'),
        colorList: document.querySelector('#js-color_list'),
        undoBtn: document.querySelector('#js-undo_btn'),
        playbackBtn: document.querySelector('#js-playback_btn'),
        widthBtn: document.querySelector('#js-width_btn'),
        widthDropdown: document.querySelector('#js-width_dropdown'),
        widthMenu: document.querySelector('#js-width_menu'),
        progressContainer: document.querySelector('#js-progress_container'),
        progressBar: document.querySelector('#js-progress_bar'),
        progressBtn: document.querySelector('#js-progress_btn'),
    },
    data: {
        CONFIG: {
            width: 3,
            color: '#000',
            vibration: 3,
        },
        lineList: [], // 线条集合
        currPoint: [], // 辅助点
        totalCount: 0, // 所有的点数
        progressCount: Infinity, // 回放时，当前进度的点数
        currCount: 0, // 回放时，已绘制点数
        currProgress: 0, // 回放下的进度
        WIDTH_SET: [1, 2, 4, 8, 16, 32, 48],
        COLOR_SET: [[0, 0, 0], [0, 0, 33], [0, 0, 60], [204, 88, 34], [204, 62, 53], [204, 75, 75], [5, 83, 53], [17, 91, 59], [20, 89, 74], [97, 66, 30], [88, 81, 46], [65, 83, 57], [304, 26, 50], [309, 85, 73], [60, 1, 5], [26, 58, 34], [26, 84, 62], [0, 0, 100]],
        playbackMode: false
    },
    ctx: null,
    init() {
        DrawLine.ctx = DrawLine.$.canvas.getContext('2d');
        DrawLine.ctx.lineCap = 'round';
        DrawLine._initColorDropdown();
        DrawLine._initWidthDropdown();
        DrawLine._listenPlayback();
        DrawLine._listenUndo();
        DrawLine._listenColor();
        DrawLine._listenWidth();
        DrawLine._listenDraw();
    },
    _initWidthDropdown() {
        let fragment = document.createDocumentFragment();
        for (let item of DrawLine.data.WIDTH_SET) {
            let li = document.createElement('li');
            li.className = 'dropdown-item';

            let span = document.createElement('span');
            span.className = 'circle';
            span.style.width = item + 'px';
            span.style.height = item + 'px';

            fragment.appendChild(li);
            li.appendChild(span);

            li.addEventListener('click', function () {
                DrawLine.data.CONFIG.width = item;
            });
        }
        DrawLine.$.widthMenu.appendChild(fragment);
    },
    _initColorDropdown() {
        let fragment = document.createDocumentFragment();
        for (let item of DrawLine.data.COLOR_SET) {
            let li = document.createElement('li');
            li.className = 'dropdown-item';

            let span = document.createElement('span');
            span.className = 'circle';
            span.style.background = `hsl(${item[0]}, ${item[1]}%, ${item[2]}%)`;

            fragment.appendChild(li);
            li.appendChild(span);

            li.addEventListener('click', function () {
                let color = `hsl(${item[0]}, ${item[1]}%, ${item[2]}%)`;
                let darkerL = item[2] - 20 < 0 ? 0 : item[2] - 20;
                let darkerColor = `hsl(${item[0]}, ${item[1]}%, ${darkerL}%)`;

                DrawLine.data.CONFIG.color = color;
                // 按钮颜色改变
                DrawLine.$.colorBtn.style.background = color;
                DrawLine.$.colorBtn.style.boxShadow = `1px 1px 0 ${darkerColor}, 2px 2px 0 ${darkerColor}, 3px 3px 0 ${darkerColor}`;
                if (color == 'hsl(0, 0%, 100%)') {
                    DrawLine.$.colorBtn.style.color = '#000';
                } else {
                    DrawLine.$.colorBtn.style.color = '#fff';
                }
            });
        }
        DrawLine.$.colorList.appendChild(fragment);
    },
    _listenPlayback() {
        let isPlayingBack = false;
        let timeoutId = null;

        let updateProgress = function () {
            // if (timeoutId !== null) {
            //     return;
            // }

            // timeoutId = setTimeout(function() {
            //     DrawLine.data.progressCount++;
            //     timeoutId = null;
            // }, 16);

            DrawLine.data.progressCount++;
        }
        let playback = function () {
            let progressCount = DrawLine.data.progressCount;
            let totalCount = DrawLine.data.totalCount;

            if (!isPlayingBack || progressCount > totalCount) {
                return;
            }

            DrawLine.$.progressBtn.style.left = progressCount / totalCount * 100 + '%';
            DrawLine.$.progressBar.style.width = progressCount / totalCount * 100 + '%';
            updateProgress();

            requestAnimationFrame(playback);
        }

        let startDrag = function () {
            isPlayingBack = false;
            document.addEventListener('mousemove', drag);
        }
        let endDrag = function () {
            isPlayingBack = true;
            playback();
            document.removeEventListener('mousemove', drag);
        };
        let drag = function (e) {
            console.log(e.offsetX);
            console.log(e.offsetY);
        }

        DrawLine.$.playbackBtn.addEventListener('click', function () {
            if (isPlayingBack) {
                DrawLine.data.progressCount = 0;
                return;
            }

            DrawLine.data.playbackMode = true;

            isPlayingBack = true;

            DrawLine.data.progressCount = 0;

            DrawLine.$.progressContainer.style.opacity = 1;

            playback();
        });
        DrawLine.$.canvas.addEventListener('mousedown', function () {
            if (DrawLine.data.playbackMode) {
                DrawLine.data.playbackMode = false;
                isPlayingBack = false;
    
                DrawLine.data.progressCount = Infinity;
    
                DrawLine.$.progressContainer.style.opacity = 0
    
                DrawLine.$.progressBtn.removeEventListener('mousedown', startDrag);
                document.removeEventListener('mouseup', endDrag);

                console.log("shit");
            }
        });
        DrawLine.$.progressBtn.addEventListener('mousedown', startDrag);
        document.addEventListener('mouseup', function() {
            if (DrawLine.data.playbackMode) {
                endDrag();
            }
        });
    },
    _listenUndo() {
        let undo = function () {
            DrawLine.data.lineList.pop();
        };

        // 按钮监听
        DrawLine.$.undoBtn.addEventListener('click', undo);
        // 键盘监听
        document.addEventListener('keydown', function (e) {
            if (e.ctrlKey || e.metaKey && e.keyCode === 90) {
                undo();
            }
        });
    },
    _listenColor() {
        DrawLine.$.colorBtn.addEventListener('mouseover', function () {
            DrawLine.$.colorDropdown.classList.add('open');
        });
        DrawLine.$.colorBtn.addEventListener('mouseleave', function () {
            DrawLine.$.colorDropdown.classList.remove('open');
        });
        DrawLine.$.colorDropdown.addEventListener('mouseenter', function () {
            DrawLine.$.colorDropdown.classList.add('open');
        });
        DrawLine.$.colorDropdown.addEventListener('mouseleave', function () {
            DrawLine.$.colorDropdown.classList.remove('open');
        });
        DrawLine.$.colorDropdown.addEventListener('click', function (e) {
            if (e.target.classList.contains('circle') || e.target.classList.contains('dropdown-item'))
                DrawLine.$.colorDropdown.classList.remove('open');
        });
    },
    _listenWidth() {
        DrawLine.$.widthBtn.addEventListener('mouseover', function () {
            DrawLine.$.widthDropdown.classList.add('open');
        });
        DrawLine.$.widthBtn.addEventListener('mouseleave', function () {
            DrawLine.$.widthDropdown.classList.remove('open');
        });
        DrawLine.$.widthDropdown.addEventListener('mouseenter', function () {
            DrawLine.$.widthDropdown.classList.add('open');
        });
        DrawLine.$.widthDropdown.addEventListener('mouseleave', function () {
            DrawLine.$.widthDropdown.classList.remove('open');
        });
        DrawLine.$.widthDropdown.addEventListener('click', function (e) {
            if (e.target.classList.contains('circle') || e.target.classList.contains('dropdown-item'))
                DrawLine.$.widthDropdown.classList.remove('open');
        });
    },
    _listenDraw() {
        let isMousedown = false;

        let startDraw = function (e) {
            let line = DrawLine.newLine(e.offsetX, e.offsetY);
            DrawLine.data.lineList.push(line);

            DrawLine.$.canvas.addEventListener('mousemove', function (e) {
                if (isMousedown)
                    drawing(e);
            });
        };

        let drawing = (function () {
            let timeoutId = null;

            return function (e) {
                if (timeoutId !== null) {
                    return;
                }

                timeoutId = setTimeout(function () {
                    let line = DrawLine.data.lineList[DrawLine.data.lineList.length - 1];
                    line.addPoint(e.offsetX, e.offsetY);

                    DrawLine.data.totalCount++;

                    timeoutId = null;
                }, 25);
            }
        })();

        let endDraw = function () {
            DrawLine.data.currPoint = [];
            DrawLine.$.canvas.removeEventListener('mousemove', drawing);
        }

        let movePoint = function (e) {
            DrawLine.data.currPoint = [e.offsetX, e.offsetY];
        }

        DrawLine.$.canvas.addEventListener('mousedown', function (e) {
            isMousedown = true;
            startDraw(e);
        });
        document.addEventListener('mouseup', function () {
            isMousedown = false;
            endDraw();
        });
        DrawLine.$.canvas.addEventListener('mouseenter', function (e) {
            if (isMousedown)
                startDraw(e);
        })
        DrawLine.$.canvas.addEventListener('mouseleave', endDraw);
        DrawLine.$.canvas.addEventListener('mousemove', movePoint);
    },
    _drawGuideline() {
        let spacing = 20; // 辅助线间隔
        DrawLine.ctx.strokeStyle = 'hsla(182, 84%, 36%, 0.2)';
        DrawLine.ctx.lineWidth = 1;

        for (let x = spacing; x < DrawLine.$.canvas.width; x += spacing) {
            DrawLine.ctx.beginPath();
            DrawLine.ctx.moveTo(x, 0);
            DrawLine.ctx.lineTo(x, DrawLine.$.canvas.height);
            DrawLine.ctx.stroke();
        }

        for (let y = spacing; y < DrawLine.$.canvas.height; y += spacing) {
            DrawLine.ctx.beginPath();
            DrawLine.ctx.moveTo(0, y);
            DrawLine.ctx.lineTo(DrawLine.$.canvas.clientWidth, y);
            DrawLine.ctx.stroke();
        }
    },
    _clearCanvas() {
        DrawLine.ctx.clearRect(0, 0, DrawLine.$.canvas.width, DrawLine.$.canvas.height);
    },
    lineFn: {
        addPoint(x, y) {
            this.points.push([x, y]);
        },
        top() {
            return this.points[this.points.length - 1];
        }
    },
    newLine(x, y) {
        let line = Object.create(DrawLine.lineFn);
        line.width = DrawLine.data.CONFIG.width;
        line.color = DrawLine.data.CONFIG.color;
        if (x && y) {
            line.points = [[x, y]];
        } else {
            line.points = [];
        }

        return line;
    },
    _drawLine(line) {
        let startX, startY, controlX, controlY, endX, endY;
        let vibrationX = (Math.random() - 0.5) * DrawLine.data.CONFIG.vibration;
        let vibrationY = (Math.random() - 0.5) * DrawLine.data.CONFIG.vibration;

        DrawLine.ctx.strokeStyle = line.color;
        DrawLine.ctx.lineWidth = line.width;

        DrawLine.ctx.beginPath();
        if (line.points.length === 1) {
            DrawLine.ctx.moveTo(line.points[0][0], line.points[0][1]);
            DrawLine.ctx.lineTo(line.points[0][0], line.points[0][1]);

            DrawLine.data.currCount++;
        }
        else {
            for (let i = 1, len = line.points.length; i < len - 1 && DrawLine.data.currCount <= DrawLine.data.progressCount; i++) {
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

                DrawLine.ctx.moveTo(startX, startY);
                DrawLine.ctx.quadraticCurveTo(controlX, controlY, endX, endY);

                DrawLine.data.currCount++;
            }
        }
        DrawLine.ctx.stroke();
    },
    _drawPoint() {
        if (DrawLine.data.currPoint.length) {
            DrawLine.ctx.beginPath();
            DrawLine.ctx.arc(DrawLine.data.currPoint[0], DrawLine.data.currPoint[1], DrawLine.data.CONFIG.width / 2, 0, Math.PI * 2);
            DrawLine.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            DrawLine.ctx.fill();
        }
    },
    _paint() {
        DrawLine._clearCanvas();

        DrawLine._drawGuideline();

        DrawLine.data.currCount = 0;
        for (let line of DrawLine.data.lineList) {
            if (DrawLine.data.currCount >= DrawLine.data.progressCount)
                break;

            DrawLine._drawLine(line);
        }

        DrawLine._drawPoint();
    },
    render() {
        DrawLine._paint();
        requestAnimationFrame(DrawLine.render);
    }
};

DrawLine.init();
DrawLine.render();

/* 
    两点间距离
*/
// let distenceBetween = function (x1, y1, x2, y2) {
//     return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
// }



// let progress = (function () {
//     let progerssBar = document.getElementById('js-progress_bar');
//     let progerssBtn = document.getElementById('js-progress_btn');

//     return {
//         updateTotalProgress() {

//         },
//         updateCurrProgress() {

//         },
//     }
// })();
