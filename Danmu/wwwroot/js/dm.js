//显示or隐藏URL 
var playlist_btn = document.getElementById("playlist-btn");
playlist_btn.onclick = function (e) {
    var urlbox = document.getElementById("urlbox");
    var idbox = document.getElementById("idbox");
    if (urlbox.style.display === 'block') {
        urlbox.style.display = 'none';
        idbox.style.display = 'none';
    }
    else {
        urlbox.style.display = 'block';
        idbox.style.display = 'block';
    }
}
//改变地址后，修改audio的地址
var urlinput = document.getElementById("urlinput");
var audioSrc = document.getElementById("audio");
var audioDuration = document.getElementById("mpsa");
audioSrc.addEventListener("canplay", function () {
    console.log("音频长度=>>>：", parseInt(audioSrc.duration) + '秒', '音频时分秒格式：', timeToMinute(parseInt(audioSrc
        .duration)));
    audioDuration.innerText = timeToMinute(parseInt(audioSrc.duration));

});

//每秒刷新一次
var mpsp = document.getElementById("mpsp");
var mpl = document.getElementById("mpl");
var timer = setInterval(() => {
    mpsp.innerText = timeToMinute(audioSrc.currentTime);
    mpl.style.width = (audioSrc.currentTime / audioSrc.duration * 100).toFixed(2) + "%";
}, (1000));

//播放按钮点击，暂停
var play = document.getElementById("mpi");
var screenItem = document.getElementById("screen");
var isplay = false;
var dmSpeed = 150;
var InitPlay = true;
//设置页面图片
//screenItem.style.backgroundImage = "../img/cover.jpg";
var playControl = function (source) {
    if (!InitPlay) {
        if (isplay && (source === "button" || (source === "screen" && !IsVisible(captionList)))) {
            audioSrc.pause();
            isplay = false;
            play.classList.remove("mpip");
            var x = document.querySelectorAll('.box,.bottomDm');
            if (x) {
                for (let i = 0; i < x.length; i++) {
                    x[i].style.animationPlayState = 'paused';
                }
            }
        }
        else {
            if (audioSrc.src !== "" && audioSrc.src.indexOf("dm.html") === -1) {
                audioSrc.play();
                isplay = true;
                play.classList.add("mpip");
                var x = document.querySelectorAll('.box,.bottomDm');
                if (x) {
                    for (let i = 0; i < x.length; i++) {
                        x[i].style.animationPlayState = '';
                    }
                }

            }
        }
    }
}

var playControlButton = function () {
    playControl('button');
}
var playControlScreen = function () {
    playControl('screen');
}
// 秒转换时分钟00:00:00格式
function timeToMinute(times) {
    var t;
    if (times > -1) {
        var hour = Math.floor(times / 3600);
        var min = Math.floor(times / 60) % 60;
        var sec = times % 60;
        if (hour < 10) {
            t = '0' + hour + ":";
        } else {
            t = hour + ":";
        }

        if (min < 10) {
            t += "0";
        }
        t += min + ":";
        if (sec < 10) {
            t += "0";
        }
        t += sec.toFixed(2);
    }
    t = t.substring(0, t.length - 3);
    return t;
}

// 00:00:00时分秒格式转化为秒
function timeEvent(e) {
    let time = e;
    var len = time.split(':');
    if (len.length == 3) {
        var hour = time.split(':')[0];
        var min = time.split(':')[1];
        var sec = time.split(':')[2];
        return Number(hour * 3600) + Number(min * 60) + Number(sec);
    }
    if (len.length == 2) {
        var min = time.split(':')[0];
        var sec = time.split(':')[1];
        return Number(min * 60) + Number(sec);
    }
    if (len.length == 1) {
        var sec = time.split(':')[0];
        return Number(sec);
    }
}

//拖动进度条
var mpb = document.getElementById("mpb");
var isDragProgressBar = false;
document.addEventListener('click', function (e) {
    //获取鼠标最新的坐标
    let actualtop = getElementPageTop(mpb);
    if (e.pageY > actualtop && e.pageY < (actualtop + mpb.clientHeight) && e.pageX > mpb.offsetLeft && e.pageX < (mpb.offsetLeft + mpb.clientWidth)) {
        audioSrc.currentTime = (e.pageX - mpb.offsetLeft) / mpb.clientWidth * audioSrc.duration;
        mpl.style.width = (audioSrc.currentTime / audioSrc.duration * 100).toFixed(2) + "%";
        isDragProgressBar = true;
    }
})

function getElementPageLeft(element) {
    var actualLeft = element.offsetLeft;
    var parent = element.offsetParent;
    while (parent != null) {
        actualLeft += parent.offsetLeft + parent.clientLeft;
        parent = parent.offsetParent;
    }
    return actualLeft;
}
function getElementPageTop(element) {
    var actualTop = element.offsetTop;
    var parent = element.offsetParent;
    while (parent != null) {
        actualTop += parent.offsetTop + parent.clientTop;
        parent = parent.offsetParent;
    }
    return actualTop;
}




function isFileExisted(url) {
    var isExists;
    $.ajax({
        url: url,
        async: false,
        type: 'HEAD',
        error: function () {
            isExists = 0;
        },
        success: function () {
            isExists = 1;
        }
    });
    if (isExists == 1) {
        return true;
    } else {
        return false;
    }
};
var alldm = [];
var getHexColor = function (e) {
    return "#" + ("000000" + e.toString(16)).slice(-6)
}
var processDanmu = function (data) {
    $.ajax({
        url: data,
        dataType: 'xml',
        type: 'GET',
        timeout: 2000,
        error: function (xml) {
            console.log("加载XML 文件出错！");
        },
        success: function (xml) {
            alldm = [];
            $(xml).find("d").each(function (i) {
                var l = $(this).attr("p").split(",");
                var value = $(this).text();
                alldm.push({
                    stime: parseFloat(l[0]),
                    mode: parseInt(l[1]),
                    size: parseInt(l[2]),
                    color: getHexColor(parseInt(l[3])),
                    date: parseInt(l[4]),
                    class: parseInt(l[5]),
                    uid: l[6],
                    dmid: String(l[7]),
                    text: String(value).replace(/(\n|\r\n)/g, "\r"),
                });

            });
            alldm.sort((x, y) => x.stime - y.stime);
            loaddm();
            tempdm = alldm.filter(x => (x.mode == 4)).sort((x, y) => x.stime - y.stime);
            loadCaptions(tempdm);
            captionList.style.display = "none";
        }
    });
}
var subLoaddmSI;
var loaddm = function () {
    let i = 1; k = 0;
    var subLoaddm = function () {
        let tempdm = [], tempbottomdm = [], numberOfDmOneTime = 15;
        if (isplay) {
            if (audioSrc.currentTime !== 0) {
                tempdm = alldm.filter(x => (x.stime >= audioSrc.currentTime && x.stime < audioSrc.currentTime + 1 && x.mode != 4)).sort((x, y) => x.stime - y.stime);
                k = 0;
                i = 1;
                if (isDragProgressBar) {
                    initializeShowDM();
                    initializeBottomDM();
                    isDragProgressBar = false;
                }
            }
            else {
                tempdm = alldm;
            }
            tempbottomdm = alldm.filter(x => (x.stime >= audioSrc.currentTime && x.stime < audioSrc.currentTime + 1 && x.mode == 4)).sort((x, y) => x.stime - y.stime);
        }
        if (k + 1 < tempdm.length) {
            let end = k + numberOfDmOneTime < tempdm.length ? i * numberOfDmOneTime : tempdm.length;
            let identifier = audioSrc.currentTime.toString();
            for (object of tempdm.slice((i - 1) * numberOfDmOneTime, end)) {
                let topResult = getTop(object.text, object.stime);
                if (topResult) {
                    var dm = document.createElement("div");
                    k++;
                    dm.innerText = object.text;
                    dm.classList.add("box");
                    dm.style.position = 'absolute';
                    dm.style.top = topResult.top + 'px';
                    dm.style.right = -topResult.calcWidth + "px";
                    dm.style.color = object.color;
                    dm.style.height = '34px';
                    let dragtime = object.stime - audioSrc.currentTime;
                    dm.style.animation = 'barrage ' + (topResult.calcWidth + 1918) / dmSpeed + 's linear ' + dragtime + 's';
                    dm.addEventListener("webkitAnimationEnd", function () {
                        //this.dataset.finishAnimation=true;
                        this.parentNode.removeChild(this);
                    }, false);
                    if (isplay)
                        dm.style.animationPlayState = '';
                    else {
                        dm.style.animationPlayState = 'paused';
                    }
                    dm.id = k + identifier;
                    $('#screen').append(dm);
                }
            }
            i++;
        }
        //载入底层弹幕
        for (object of tempbottomdm) {
            let bottom = getBottom(object.text, object.stime);
            if (bottom) {
                var dm = document.createElement("div");
                dm.innerText = object.text;
                dm.classList.add("bottomDm");
                dm.style.bottom = bottom + 'px';
                dm.style.color = object.color;
                let dragtime = object.stime - audioSrc.currentTime;
                dm.style.animation = 'bottomAnimation ' + object.text.length / 3 + 's linear ' + dragtime + 's';
                dm.dataset.finishAnimation = false;
                dm.addEventListener("webkitAnimationEnd", function () {
                    //this.dataset.finishAnimation=true;
                    this.parentNode.removeChild(this);
                }, false);
                if (isplay)
                    dm.style.animationPlayState = '';
                else {
                    dm.style.animationPlayState = 'paused';
                }
                $('#screen').append(dm);
            }
        }
    }
    subLoaddm();
    if (subLoaddmSI === undefined)
        subLoaddmSI = setInterval(subLoaddm, 1000);
}
var totalHeight = screen.height;
var margin = 5;
var fontsize = 20;
var totalLines = parseInt(totalHeight / (fontsize + 2 * margin)) - 2;
var bottomDm = [];
var allshowDm = [];
var initializeShowDM = function () {
    allshowDm = [];
    for (let i = 0; i < totalLines; i++) {
        allshowDm.push([]);
    }
};
var initializeBottomDM = function () {
    bottomDm = [];
    for (let i = 0; i < 8; i++) {
        bottomDm.push([]);
    }
}
initializeShowDM();
initializeBottomDM();
var getTop = function (text, delaytime) {
    let line = 0;
    let findline = false;
    var tempObj = document.createElement("span");
    tempObj.innerHTML = text;
    tempObj.style.fontSize = '20px';
    $('body').append(tempObj);
    let calcWidth = tempObj.offsetWidth;
    tempObj.parentNode.removeChild(tempObj);
    for (let i = 0; i < allshowDm.length; i++) {
        let currentRow = allshowDm[i];
        if (currentRow.length === 0) {
            currentRow.push([calcWidth, delaytime, text]);
            findline = true;
            line = i;
            break;
        } else {
            if (((currentRow[currentRow.length - 1][0] + 150) / dmSpeed) < (delaytime - currentRow[currentRow.length - 1][1])) {
                findline = true;
                currentRow.push([calcWidth, delaytime, text]);
                line = i;
                break;
            }
        }
    }
    if (findline) {
        return {
            top: line * (fontsize + margin) + 5,
            calcWidth: calcWidth
        };
    } else {
        return null;
    }
}
var getBottom = function (text, delaytime) {
    let line = 0;
    for (let i = 0; i < bottomDm.length; i++) {
        let currentRow = bottomDm[i];
        if (currentRow.length === 0) {
            currentRow.push([text.length, delaytime]);
            findline = true;
            line = i;
            break;
        } else {
            if (currentRow[currentRow.length - 1][0] / 3 < delaytime - currentRow[currentRow.length - 1][1]) {
                currentRow.push([text.length, delaytime]);
                findline = true;
                line = i;
                break;
            }
        }
    }
    if (findline) {
        return line * (fontsize + margin) + 5;
    } else {
        return null;
    }
}

//载入弹幕
var audioid = document.getElementById("idinput");
var findxml = function () {
    if (urlinput.value !== "" && isFileExisted(urlinput.value.substring(0, urlinput.value.length - 4) + ".xml")) {
        processDanmu(urlinput.value.substring(0, urlinput.value.length - 4) + ".xml");
        //clearInterval(findxmlInterval);
    }
};
//var findxmlInterval = setInterval(findxml, (1000));
urlinput.onchange = function () {
    audioSrc.src = urlinput.value;
    if (subLoaddmSI !== undefined) {
        clearInterval(subLoaddmSI);
        subLoaddmSI = undefined;
        initializeShowDM();
        initializeBottomDM();
        isplay = false;
        play.classList.remove("mpip");
    }
    initializeCaptionList();
    findxml();
};
var getFiles = function () {
    $.ajax({
        url: "/Home/getFiles",
        async: false,
        error: function (ex) {
            console.log(ex);
        },
        success: function (data) {
            console.log('files', data);
            urlinput.options.length = 0;
            for (let index in data) {
                urlinput.options.add(new Option(data[index], '../files/' + data[index]));
                if (index === "0") {
                    audioSrc.src = '../files/' + data[index];
                }
            }
            findxml();
        }
    });
};
getFiles();
//点击getDM button
var getDMButton = document.getElementById("getDmBtn");
var idInput = document.getElementById("idinput");
getDMButton.onclick = function () {
    let index = urlinput.selectedIndex;
    if (idInput.value === "" || urlinput.options[index].text === "") {
        alert("id或url为空");
        return;
    }
    $.ajax({
        url: "/Home/GetBlobDownload?id=" + idInput.value + "&filename=" + urlinput.options[index].text,
        async: false,
        error: function (ex) {
            console.log(ex);
        },
        success: function (data) {
            alert("获取成功");
            findxml();
        }
    });
}
var captionList = document.getElementById("captionList");
function initializeCaptionList() {
    var allCaptions = document.querySelectorAll('.caption,.line');
    allCaptions.forEach(element => {
        captionList.removeChild(element);
    });
}
var loadCaptions = function (captions) {
    for (let i = 0; i < captions.length; i++) {
        let object = captions[i];
        var caption = document.createElement('div');
        var captionTime = document.createElement('span');
        var captionText = document.createElement('span');
        captionTime.innerHTML = timeToMinute(object.stime);
        captionText.innerHTML = object.text;
        caption.classList.add("caption");
        caption.style.color = object.color;
        captionText.style.display = 'inline-block';
        captionText.style.margin = '5px 20px';
        caption.append(captionTime);
        caption.append(captionText);

        caption.addEventListener('click', function () {
            audioSrc.currentTime = object.stime;
            mpl.style.width = (audioSrc.currentTime / audioSrc.duration * 100).toFixed(2) + "%";
            isDragProgressBar = true;
            audioSrc.play();
        });
        var line = document.createElement('div');
        line.classList.add("line");
        $('#captionList').append(caption);
        $('#captionList').append(line);

    }
}

var fullScreen = document.getElementById("fullScreen");
fullScreen.onclick = function () {
    if (captionList.style.display === 'none')
        captionList.style.display = "block";
    else
        captionList.style.display = "none";
}

function IsVisible(obj) {
    if (obj.style.display === 'none') return false;
    else return true;
}

play.onclick = playControlButton;
screenItem.onclick = playControlScreen;
InitPlay = false;