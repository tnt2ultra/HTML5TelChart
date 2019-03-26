/******************
 * Telegram contest
 * Andrew Chachin
 * tnt2ultra@ya.ru
 * 2019-03-24
 ******************/
var jsonfile = 'chart_data.json';
const DAY = 0, NIGHT = 1, MAXLINES = 6, ALPHA = 0.2, LINEWIDTH = 2, MAXDOWN = 6;
var canvas, ctx;    
var down = false;
var started = false;
var pos = [];
var posBox = {x: 0,y: 0};
var screen, box, box1;
var lineWidth = LINEWIDTH;
var month_names_short = 
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var $ = function(){};
var colors;
var textSwitch = [];
var mode = DAY;
var horlines = [];
var fontsize = 12;
var fontname = 'verdana';
var textbaseline = 'top';
var texts = [];
var hortexts = [];
var vertexts = [];
var borders = [];
var mouserect;
var mousesize = 10;
var moveleft = false;
var moveright = false;
var movebox = false;
var minx = 15;
var kx = 0.0;
var myObj;
var loadjson = false;
var graph1, graph2;
var curgraph = 0, maxgraph = 5;
var textdown = [];
var countdown = MAXDOWN;
var boxdown = [];
var checkdown = [];
var showdown = [];
var verline;
var drawver = false;
var heightver = 0;
var dot = [0, 0, 0, 0, 0, 0];
var dotflag = false;
var bannertitle;
var bannerup = [];
var bannerdown = [];
        
function graph(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    };
    
var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };
    xhr.send();
};

function rect(color, x, y, width, height) {
    this.color = color; // цвет прямоугольника
    this.x = x; // координата х
    this.y = y; // координата у
    this.width = width; // ширина
    this.height = height; // высота
    // функция рисует прямоугольник согласно заданным параметрам
    this.draw = function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
}

function outtext(text, color, x, y, align, bold) {
    this.text = text; // текст
    this.font = fontname; // шрифт
    this.size = fontsize; // размер шрифта
    this.textBaseline = textbaseline; // выравнивание по вертикали
    this.color = color; // цвет прямоугольника
    this.x = x; // координата х
    this.y = y; // координата у
    this.align = align; // выравнивание по горизонтали
    this.bold = bold; // жирный шрифт
    this.lastwidth = 0;
    // функция рисует текст согласно заданным параметрам
    this.draw = function() {
        ctx.font = ((this.bold === 'bold')?'bold ':'') 
                    + this.size + 'px ' + this.font;
        ctx.textAlign = this.align;
        ctx.textBaseline = this.textBaseline;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
        this.lastwidth = ctx.measureText(this.text).width;
    };
}

function OnClick(e) {
    var m = getMouse(e);
    if (!started) {
        posBox.x = m.x;
        posBox.y = m.y;
        started = true;
    }
    if (m.y >= texts[1].y - 10) {
        if (m.x <= fontsize * 4) {
            curgraph = (maxgraph + --curgraph) % maxgraph;
            resetbox();
        } else if (m.x >= canvas.width - fontsize * 4) {
            curgraph = ++curgraph % maxgraph;
            resetbox();
        } else 
            toggleday();
    } else {
        for(var i = 0; i < countdown; i++) {
            if (showdown[i] && collision(mouserect, boxdown[i])) {
                checkdown[i] = !checkdown[i];
                if (checkdown[i])
                    boxdown[i].color = myObj[curgraph].colors["y" + (i + 0)];
                else
                    boxdown[i].color = colors[mode].border;
            }
        }
    }
//    console.log(curgraph);
}

function draw() {
    screen.draw();    
    for(var i = 0; i < texts.length; i++) 
        texts[i].draw();
    for(var i = 0; i < horlines.length; i++) 
        hortexts[i].draw();
    for(var i = 0; i < vertexts.length; i++) 
        vertexts[i].draw();
    for(var i = 0; i < horlines.length; i++) 
        horlines[i].draw();
    box.draw();
    box1.draw();
    for(var i = 0; i < 4; i++) 
        borders[i].draw();
    if (down)
        if (mouserect.drawing) {
//            mouserect.draw();
        }  
    for(var i = 0; i < countdown; i++) 
        if (showdown[i]) {
            boxdown[i].draw();
            textdown[i].draw();
        }
    if(drawver)
        verline.draw();
    
    if (loadjson) {
        start2(graph1, false);
        start2(graph2, true);
    }    
}

function update() {
    if (down) {
        if (pos.length > 0) {
            mouserect.x = pos[pos.length - 1].x - mouserect.width / 2;
            mouserect.y = pos[pos.length - 1].y - mouserect.height / 2;
            if (!mouserect.drawing)
                mouserect.drawing = true;
            if (moveleft) {
                var oldx = box1.x;
                var olddx = box1.width;
                box1.x = movex + mouserect.x;
                if (box1.x < 0)
                    box1.x = 0;
                var dx = oldx - box1.x;
                box1.width = box1.width + dx;
                minx = borders[0].width * 4;
                if (box1.width < minx) {
                    box1.width = minx;
                    box1.x = oldx + olddx - minx;
                }                
                for(var i = 0; i < 4; i++) 
                    if (i !== 2) borders[i].x = box1.x;                
                borders[2].x = box1.x + box1.width - borders[0].width; 
                borders[3].width = borders[1].width = box1.width;                
            } else if (moveright) {
                var oldx = box1.x + box1.width;
                var olddx = box1.width;
                var x1 = movex + mouserect.x;   
                minx = borders[0].width * 4;             
                if (x1 < box1.x + minx)
                    x1 = box1.x + minx;
                var dx = x1 - box1.x;
                box1.width = x1 - box1.x;
                if (box1.width < minx) 
                    box1.width = minx;                
                if (box1.x + box1.width > canvas.width) 
                    box1.width = canvas.width - box1.x; 
                for(var i = 0; i < 4; i++) 
                    if (i !== 2) borders[i].x = box1.x;                
                borders[2].x = box1.x + box1.width - borders[0].width; 
                borders[3].width = borders[1].width = box1.width;     
            } else if (movebox) {
                box1.x = movex + mouserect.x;
                if (box1.x < 0)
                    box1.x = 0;
                if (box1.x + box1.width > canvas.width)
                    box1.x = canvas.width - box1.width;
                for(var i = 0; i < 4; i++) 
                    borders[i].x = box1.x;                
                borders[2].x = box1.x + box1.width - borders[0].width;     
            } else if (collision(mouserect, borders[0])) {
                moveleft = true;
                movex = box1.x - mouserect.x;
            } else if (collision(mouserect, borders[2])) {
                moveright = true;
                movex = box1.x + box1.width - mouserect.x;
            } else if (collision(mouserect, box1)) {
//                console.log(mouserect.x);
                movebox = true;
                movex = box1.x - mouserect.x;
            } 
        }
    } else {
        moveleft = false;
        moveright = false;
        movebox = false;
    }
}

function main() {
    update();
    draw();
}

function init() {
    canvas = document.createElement("canvas");
    resizeCanvas();
    initcolors();
    inittexts();        
    initaxes();
    resizeAll();

    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);
    
    document.addEventListener("mousedown", OnMouseDown, false);
    document.addEventListener("mousemove", OnMouseMove, false);
    document.addEventListener("mouseup", OnMouseUp, false);
    document.addEventListener("touchstart", OnMouseDown, false);
    document.addEventListener("touchmove",  OnMouseMove, false);
    document.addEventListener("touchend",   OnMouseUp, false);
    document.addEventListener("click",   OnClick, false);
    window.addEventListener('resize', OnResize, false);    

    setInterval(main, 1000/60);

    getJSON(jsonfile,
    function(err, data) {
      if (err !== null) {
        alert('Something went wrong: ' + err);
      } else {
        myObj = data;   
        maxgraph = myObj.length;
        graph1 = new graph(box.x, box.y+3, box.width, box.height-6);
        graph2 = new graph(0, texts[0].y + texts[0].size + 5, canvas.width, 
            horlines[horlines.length - 1].y - (texts[0].y + texts[0].size + 5));
//        console.log(texts[0].y + texts[0].size);
        loadjson = true;
      }
    });

}

function OnMouseDown(e) {
    var m = getMouse(e);
    pos.push({
        x: m.x,
        y: m.y
    });
    down = true;
    drawver = m.y >= verline.y - 10 && m.y <= verline.y + verline.height + 10;
}

function OnMouseMove(e) {
    var m = getMouse(e);
    if(down) 
        pos.push({
            x: m.x,
            y: m.y
        });
}

function OnMouseUp(e) {
    down = false;
    mouserect.drawing = false;
    drawver = false;
    pos = [];
}

function getMouse(e) {
    var mx, my;
    // check MOUSE or TOUCH 
    if((e.pageX === undefined && e.pageY === undefined) 
            ||(e.clientX === undefined && e.clientY === undefined)){
        var touches = e.changedTouches;
        if(touches === undefined || touches.length > 1)
            return false;
        mx = (touches[0].pageX || touches[0].clientX) 
                    - canvas.getBoundingClientRect().left;
        my = (touches[0].pageY || touches[0].clientY) 
                    - canvas.getBoundingClientRect().top;
    }else{
        mx = (e.cleintX || e.pageX) - canvas.getBoundingClientRect().left;
        my = (e.clientY || e.pageY) - canvas.getBoundingClientRect().top;
    }
    return {x: mx,y: my};
}

function OnResize() {
    resizeCanvas();
    resizeAll();
}
    
function resizeCanvas() {
    canvas.width = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;
    canvas.height = (window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight);

    canvas.width -= 20;
    canvas.height -= 20;
}

function resetbox() {
    box1.y = box.y = horlines[horlines.length - 1].y + 6 + fontsize * 2;
    box1.height = box.height = fontsize * 4;
    box1.width = canvas.width / 2;
    box1.x = box1.width / kx;

    var dx = box1.width / 25;
    var dy = box1.height / 16;
    var i = 0;
    borders[i].x = box1.x; 
    borders[i].y = box1.y;
    borders[i].width = dx;
    borders[i].height = box1.height;    
    i++;
    borders[i].x = box1.x; 
    borders[i].y = box1.y;
    borders[i].width = box1.width;
    borders[i].height = dy;    
    i++;
    borders[i].x = box1.x + box1.width - dx; 
    borders[i].y = box1.y;
    borders[i].width = dx;
    borders[i].height = box1.height;    
    i++;
    borders[i].x = box1.x; 
    borders[i].y = box1.y + box1.height - dy;
    borders[i].width = box1.width;
    borders[i].height = dy;
    
    for(var i = 0; i < MAXDOWN; i++) {
        showdown[i] = false;
        checkdown[i] = true;
        if (loadjson)
        boxdown[i].color = myObj[curgraph].colors["y" + (i + 0)];
    }
}

function resizeAll() {
    screen.width = canvas.width;
    screen.height = canvas.height;    
    box.width = canvas.width;
    
    fontsize = Math.round(36 * canvas.height / 2000) + 4;
    
    heightver = (canvas.height * 3) / 6 / 6;
//    console.log(heightver * 6);       
    for(var i = 0; i < horlines.length; i++) {
        horlines[i].width = canvas.width;
        horlines[i].y = (i + 1) * heightver + 10 + fontsize;
    }
    
    texts[0].size = fontsize + 4;
    texts[1].size = fontsize + 8;
    texts[2].size = fontsize;
    texts[3].size = fontsize;
    texts[1].x = canvas.width / 2;
    texts[1].y = canvas.height - 20 - fontsize;
    texts[2].y = canvas.height - 12 - fontsize;
    texts[3].y = canvas.height - 12 - fontsize;
    texts[3].x = canvas.width - 5;
    
    for(var i = 0; i < hortexts.length; i++) {
        hortexts[i].y = horlines[i].y  - 5 - fontsize;
        hortexts[i].size = fontsize;
    }
 
    var dx = canvas.width / 6;        
    for(var i = 0; i < vertexts.length; i++) {
        vertexts[i].x = 6 + i * dx;
        vertexts[i].y = horlines[horlines.length - 1].y + 6;
        vertexts[i].size = fontsize;
    }

    resetbox();
    
    if (loadjson) {
        graph1.x = box.x;
        graph1.y = box.y + 3;
        graph1.width = box.width;
        graph1.height = box.height - 6;
        graph2.x = 0;
        graph2.y = texts[0].y + texts[0].size + 5;
        graph2.width = canvas.width;
        graph2.height = horlines[horlines.length - 1].y 
            - (texts[0].y + texts[0].size + 5);
    }
    
    for(var i = 0; i < countdown; i++) {
        boxdown[i].x = vertexts[i].x;
        boxdown[i].y = box.y + box.height + fontsize;
        boxdown[i].width = boxdown[i].height = fontsize * 1.3;
        textdown[i].x = vertexts[i].x + boxdown[i].width + fontsize / 2;
        textdown[i].y = boxdown[i].y;
        textdown[i].size = fontsize;
    }
    
    verline.height = heightver * horlines.length - 8;
    verline.y = texts[0].x + texts[0].size + 10;
}

function initcolors() {
    colors = [new $(), new $()];
    
    colors[DAY].title = "#222222";
    colors[DAY].bg = "#FFFFFF";
    colors[DAY].textaxes = "#96A2AA";
    colors[DAY].horline = "#ECF0F3";
    colors[DAY].verline = "#DFE6EB";
    colors[DAY].bgbox = "#F5F9FB";
    colors[DAY].border = "#DDEAF3";
    colors[DAY].text = "#43484B";
    colors[DAY].switch = "#108BE3";
    
    colors[NIGHT].title = "#FFFFFF";
    colors[NIGHT].bg = "#242F3E";
    colors[NIGHT].textaxes = "#546778";
    colors[NIGHT].horline = "#293544";
    colors[NIGHT].verline = "#3B4A5A";
    colors[NIGHT].bgbox = "#1F2A38";
    colors[NIGHT].border = "#40566B";
    colors[NIGHT].text = "#E8ECEE";
    colors[NIGHT].switch = "#36A8F1";
    
    textSwitch[DAY] = "Switch to Night Mode";
    textSwitch[NIGHT] = "Switch to Day Mode";
}

function inittexts() {    
    texts = [new outtext('Followers', colors[mode].title, 5, 10, 'left', 'bold')
        
        , new outtext(textSwitch[mode], colors[mode].switch, 
            canvas.width / 2, canvas.height - 20, 'center', '')
            
        , new outtext('Prev', colors[mode].title, 
            5, canvas.height - 20, 'left', '')

        , new outtext('Next', colors[mode].title, 
            canvas.width - 5, canvas.height - 20, 'right', '')
    ];  
    textdown = [new outtext('y1', colors[mode].title, 0, 0, 'left', '')        
        , new outtext('y2', colors[mode].title, 0, 0, 'left', '')
        , new outtext('y3', colors[mode].title, 0, 0, 'left', '')
        , new outtext('y4', colors[mode].title, 0, 0, 'left', '')
        , new outtext('y5', colors[mode].title, 0, 0, 'left', '')
        , new outtext('y6', colors[mode].title, 0, 0, 'left', '')
    ];  
    bannertitle = new outtext('Sat, Feb 24', colors[mode].title, 0, 0, 'left', '');
    for(var i = 0; i < MAXDOWN; i++) {
        bannerup[i] = new outtext('142', 'red', 0, 0, 'left', 'bold');
        bannerdown[i] = new outtext('y1', 'red', 0, 0, 'left', '');
    }
}

function initaxes() {
    var sy = 20;
    var dy = canvas.height * 180 / 2000;
    for(var i = 0; i < MAXLINES; i++) 
        horlines[i] = new rect(colors[mode].horline, 
            0, sy + dy * (i + 1), canvas.width, 1);

    for(var i = 0; i < MAXLINES; i++) {
        hortexts[i] = new outtext('' + 250 - i * 50, 
            colors[mode].textaxes, 5, horlines[i].y - 5 - fontsize, 'left', '');
//        hortexts[i].textbaseline = 'bottom';
    }
        
    var dx = canvas.width / 6;
    for(var i = 0; i < MAXLINES; i++) {
        vertexts[i] = new outtext('Jan' + (20 + i), colors[mode].textaxes, 
            6 + i * dx, horlines[horlines.length - 1].y + 6, 'left', '');
        vertexts[i].size = fontsize - 2;
    }
        
    screen = new rect(colors[mode].bg, 0, 0, canvas.width, canvas.height);
    box = new rect(colors[mode].bgbox, 0, 
        horlines[horlines.length - 1].y + 6 + fontsize*2, canvas.width, fontsize * 4);
    box1 = new rect(colors[mode].bg, canvas.width / 2, 
        horlines[horlines.length - 1].y + 6 + fontsize*2, canvas.width / 2, fontsize * 4);
        
    var dx = box1.width / 25;
    var dy = box1.height / 16;
    borders[0] = new rect(colors[mode].border, box1.x, box1.y, dx, box1.height);
    borders[1] = new rect(colors[mode].border, box1.x, box1.y, box1.width, dy);
    borders[2] = new rect(colors[mode].border, box1.x + box1.width - dx, box1.y, 
        dx, box1.height);
    borders[3] = new rect(colors[mode].border, box1.x, box1.y + box1.height - dy, 
        box1.width, dy);
    kx = box1.width / box1.x;
    
    mouserect = new rect(colors[mode].switch, 0, 0, mousesize, mousesize);
    mouserect.drawing = false;
    
    for(var i = 0; i < MAXDOWN; i++) {
        boxdown[i] = new rect(colors[mode].border, 0, 0, fontsize, fontsize);
        checkdown[i] = true;
        showdown[i] = true;
    }
    
    verline = new rect(colors[mode].horline, 0, 0, 1, 
        horlines[horlines.length - 1].y);
}

function toggleday() { 
    mode = (mode === DAY)? NIGHT : DAY;
    for(var i = 0; i < texts.length; i++) 
        texts[i].color = colors[mode].title;
    texts[1].color = colors[mode].switch;
    texts[1].text = textSwitch[mode];
    for(var i = 0; i < horlines.length; i++) 
        horlines[i].color = colors[mode].horline;
    for(var i = 0; i < hortexts.length; i++) 
        hortexts[i].color = colors[mode].textaxes;
    for(var i = 0; i < vertexts.length; i++) 
        vertexts[i].color = colors[mode].textaxes;
    screen.color = colors[mode].bg;
    box.color = colors[mode].bgbox;
    box1.color = colors[mode].bg;
    for(var i = 0; i < 4; i++) 
        borders[i].color = colors[mode].border;
    document.body.style.background = colors[mode].bg;    
    for(var i = 0; i < countdown; i++) {
        textdown[i].color = colors[mode].title;        
        if (checkdown[i])
            boxdown[i].color = myObj[curgraph].colors["y" + (i + 0)];
        else
            boxdown[i].color = colors[mode].border;
    }
    verline.color = colors[mode].horline;
}

// функция проверяет пересекаются ли переданные ей прямоугольные объекты
function collision(objA, objB) {
    if (objA.x + objA.width > objB.x 
                && objA.x < objB.x + objB.width 
                && objA.y + objA.height > objB.y 
                && objA.y < objB.y + objB.height) {
        return true;
    }
    else {
        return false;
    }
}

function start2(canvas1, flag){
/*
    canvas1.x = Math.round(canvas1.x);
    canvas1.y = Math.round(canvas1.y);
    canvas1.width = Math.round(canvas1.width);
    canvas1.height = Math.round(canvas1.height);
*/
    var y0 = canvas1.height;
    var x = 0, x1 = 0;
    var y = [];
    var y1 = [];
    var n = curgraph;
    var miny = 99999999, maxy = -1;
    var k = myObj[n].columns.length;
    countdown = k > MAXDOWN ? MAXDOWN : k - 1;
    for(var i = 0; i < countdown; i++) {
        showdown[i] = true;
        if (checkdown[i])
            boxdown[i].color = myObj[curgraph].colors["y" + (i + 0)];
        else
            boxdown[i].color = colors[mode].border;
    }
    
    if(flag) {
        var num = box.width / (myObj[n].columns[0].length - 1);
        var startj = 1 + box1.x / num;
        var endj = startj + (box1.width) / num - 1;
        startj = Math.round(startj);
        endj = Math.round(endj);
        if (endj >= myObj[n].columns[0].length)
            endj = myObj[n].columns[0].length - 1;
    } else {
        var startj = 1;
        var endj = myObj[n].columns[0].length - 1;
    }
//    console.log(k + ' ' + dy + ' ' + dx);

    for(var j = startj; j <= endj; ++j) {
        for(var i = 1; i < k; i++) 
            if (checkdown[i - 1]) {
                y1[i] = myObj[n].columns[i][j];
                if (miny > y1[i]) miny = y1[i];
                if (maxy < y1[i]) maxy = y1[i];
            }
    }    
    var dy = canvas1.height / (maxy - miny + 1);
    var dx = (canvas1.width - 1) / (endj - startj);
    for(var i = 0; i < hortexts.length; i++) 
        hortexts[i].text = Math.round(miny + (maxy - miny) / hortexts.length 
            * (hortexts.length - i));
    for(var i = 1; i < k; ++i) 
        y[i] = y0 - (myObj[n].columns[i][startj] - miny) * dy;
    var period = (endj - startj) / (vertexts.length - 1);
    for(var j = startj, i = 0; i < vertexts.length; j += period, i++) {
        var d = new Date(myObj[n].columns[0][Math.round(j)]);
        var mon = month_names_short[d.getMonth()];
        var day = d.getDate();
        vertexts[i].text = mon + ' ' + day;
    }
//    x = (canvas1.width - (endj - startj - 1) * dx) / 2 - 1;
//    x1 = x;
/*
    if (flag) console.log(startj + ' ' + endj);
    console.log("miny="+ miny+ " maxy="+ maxy+ " miny*dy="+ miny*dy+ " maxy*dy=" 
        +maxy*dy+ " dy="+ dy+ " dx="+ dx);
*/
    if (!flag) {
        ctx.globalAlpha = ALPHA;
        lineWidth = 1;
    } else lineWidth = LINEWIDTH;
    dot = [0, 0, 0, 0, 0, 0];
    dotflag = false;
    var last = false;
    var bannerj = endj;
    for(var j = startj; j <= endj; ++j) {
        for(var i = 1; i < k; ++i) {
            if (checkdown[i - 1]) {
                y1[i] = myObj[n].columns[i][j];
                y1[i] = (y1[i] - miny) * dy;
                y1[i] = y0 - y1[i];
                if (!flag) {
                    if (box1.x <= x)
                        if (box1.x + box1.width > x + 5)
                            ctx.globalAlpha = 1.0;
                        else
                            ctx.globalAlpha = ALPHA;
                }
                drawLine(ctx, x, y[i], x1, y1[i], myObj[n].colors["y" + (i - 1)]);
    /*
                drawLine(ctx, Math.round(x), Math.round(y[i]), Math.round(x1), 
                    Math.round(y1[i]), myObj[n].colors["y" + (i - 1)]);
    */
                if (!dotflag)
                    dot[i - 1] = y[i];
                y[i] = y1[i];
            }
        }
        if (flag && drawver && !dotflag && pos.length > 0)
            if(pos[pos.length - 1].x <= x +  dx / 2 || j === endj) {
                if (pos[pos.length - 1].x >= canvas.width) {
                    verline.x = canvas.width - 2;
                    last = true;
                    bannerj = endj;
                } else {
                    verline.x = x;
                    bannerj = j;
                }
                dotflag = !dotflag;
//                console.log(x + dx + ' ' + pos[pos.length - 1].x);
//                for(var i = 1; i < k; ++i)
//                    dot[i - 1] = y[i];
//                console.log(dot[0] + ' ' + dot[1]);
            }
        if (flag && last && j === endj) {
            for(var i = 1; i < k; ++i)
                dot[i - 1] = y[i];
//            console.log(dot[0] + ' ' + dot[1]);
        }
        x = x1;        
        x1 += dx;        
    }
    ctx.globalAlpha = 1.0; 
    if (flag && drawver && dotflag) {
        for(var i = 1; i < k; ++i) {
            if (checkdown[i - 1]) {
                drawArc(ctx, verline.x, dot[i - 1], 4, 
                    colors[mode].bg, true);
                drawArc(ctx, verline.x, dot[i - 1], 4, 
                    myObj[n].colors["y" + (i - 1)], false);
            }
        }
        drawbanner();
    }
    
    function drawbanner() {
        var bannerw = texts[0].lastwidth * 2;
        var bannerh = heightver * 2;
        var bannerd = 4;
        var rx = verline.x - bannerw / 2;
        if (rx < 5)
            rx = 5;
        if (rx + bannerw > canvas.width - 5)
            rx = canvas.width - bannerw - 5;
        drawRound(ctx, rx, 5, bannerw, bannerh, colors[mode].horline);
        
        bannertitle.x = canvas1.x + rx + bannerd;
        bannertitle.y = canvas1.y + bannerd;
        bannertitle.size = fontsize;
        bannertitle.color = colors[mode].textaxes;
        var d = new Date(myObj[n].columns[0][Math.round(bannerj)]);
        var mon = month_names_short[d.getMonth()];
        var day = d.getDate();
        bannertitle.text = weekday[d.getDay()] + ', ' + mon + ' ' + day;
        bannertitle.draw();
        var bannertitlew = bannertitle.lastwidth;
            
        var maxw = 0;
        var maxh = 0;
        var lasth = 0;
        var bannern = 0;
        for(var i = 0; i < countdown; ++i) {
            if (checkdown[i]) {
                bannern++;
                if (bannern === 3 || bannern === 5) {
                    maxw = 0;
                    maxh = maxh + lasth;
                }
                bannerup[i].x = bannertitle.x + maxw;
                bannerup[i].y = bannertitle.y + bannertitle.size + bannerd + maxh + 2;
                bannerup[i].size = fontsize + 2;
                bannerup[i].text = myObj[n].columns[i + 1][bannerj - 1];
                bannerup[i].color = boxdown[i].color;
                bannerup[i].draw();
                var w1 = bannerup[i].lastwidth;
                
                bannerdown[i].x = bannertitle.x + maxw;
                bannerdown[i].y = bannerup[i].y + bannerup[i].size + bannerd - 2;
                bannerdown[i].size = fontsize - 2;
                bannerdown[i].color = boxdown[i].color;
                bannerdown[i].text = textdown[i].text;
                bannerdown[i].draw();
                var w2 = bannerdown[i].lastwidth;
                maxw = bannertitlew;
                if (w1 + 20 > maxw) maxw = w1 + 10;
                if (w2 + 20 > maxw) maxw = w2 + 10;
                lasth = bannerup[i].size + bannerdown[i].size + bannerd * 2;
//                maxw = w1 > w2 ? w1 : w2;
//                console.log(w1 + ' ' + w2);
            }
        }
    }
         
    function drawLine(ctx, startX, startY, endX, endY, color) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
//        ctx.lineCap = "round";
//        ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.moveTo(canvas1.x + startX, canvas1.y + startY);
        ctx.lineTo(canvas1.x + endX, canvas1.y + endY);
        ctx.stroke();
        ctx.restore();
    }
          
    function drawArc(ctx, startX, startY, rad, color, fillflag) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
//        ctx.lineCap = "round";
//        ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.arc(canvas1.x + startX, canvas1.y + startY, rad, 0, Math.PI * 2);
        if (fillflag)
            ctx.fill();
        else
            ctx.stroke();
        ctx.restore();
    }
        
    function drawRound(ctx, startX, startY, endX, endY, color, bg) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(canvas1.x + startX, canvas1.y + startY, endX, endY);
        ctx.fillStyle = color;
        ctx.stroke();
        ctx.strokeStyle = color;
        ctx.lineJoin = 'round';
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.beginPath();
        ctx.rect(canvas1.x + startX + 2, canvas1.y + startY + 2, 
            endX - 4, endY - 4, colors[mode].bgbox);
        ctx.fillStyle = colors[mode].bgbox;
        ctx.fill();
        ctx.strokeStyle = colors[mode].bgbox;
        ctx.lineJoin = 'round';
        ctx.lineWidth = 10;
        ctx.stroke();        
        ctx.restore();
    }
  
}

init();
