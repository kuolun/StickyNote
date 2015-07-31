//思考:網頁上每個stickyNote，用產生時間來當key，把內容存到LocalStorage
//LocalStorage另外用一組array來紀錄所有的StickyNote的key



//視窗載入時，執行init函數
window.onload = init;

//起始函數，如果之前有輸入過(存在LocalStorage)，則把之前的Note帶出來
function init() {
    //幫addButton加上onclick事件
    var addButton = document.getElementById("add_button");
    addButton.onclick = createSticky;

    //幫clearButton加上onclick事件
    var clearButton = document.getElementById("clear_button");
    clearButton.onclick = clearSticky;

    //抓取要處理的stickiesArray，如果有東西就顯示出來
    //stickiesArray內的value當成是LocalStorage的key
    var stickiesArray = getStickiesArray();
    for (var i = 0; i < stickiesArray.length; i++) {

        //把array中的值取出當localStorage的key，來取得對應的值
        var key = stickiesArray[i];
        var value = localStorage[key];

        //把note加回網頁上
        addStickyDOM(key, value);
    }

}


//從localStorage把stickiesArray取出
//存放所有Note資訊的Key叫做stickiesArray
var getStickiesArray = function() {

    //stickiesArray是存在LocalStorage的值
    var stickiesArray = localStorage.getItem("stickiesArray");

    if (!stickiesArray) {
        //如果不存在就放一個空值存到變數，並存到localStorage
        //localStorage裡只能存放string，要把array轉string
        stickiesArray = [];
        localStorage.setItem("stickiesArray", JSON.stringify(stickiesArray));
    } else {
        //取出來時，要把string轉成array回傳
        stickiesArray = JSON.parse(stickiesArray);
    }
    return stickiesArray;
};

//建立StickyNode，依據產生時間建立一key值
//(1.存到localstorage 2.新增到DOM)
var createSticky = function() {
    //要處理的stickiesArray
    var stickiesArray = getStickiesArray();

    //取得目前Date物件
    var currentDate = new Date();

    //用時間建立key值
    var key = "sticky_" + currentDate.getTime();

    //把網頁上sticktNote內容取出當成是value
    //var value = document.getElementById("note_text").value;
    var value = " ";

    //把此stickyNote存入localStorage
    localStorage.setItem(key, value);

    //要處理的stickiesArray做個記錄,並存入localStorage
    stickiesArray.push(key);
    localStorage.setItem("stickiesArray", JSON.stringify(stickiesArray));

    //新增到DOM
    addStickyDOM(key, value);

};

//清除所有note(localstorage及畫面)
var clearSticky = function() {
    //點確認才清除
    if (confirm("Are you sure to clear all notes?") === true) {

        //清空localStorage
        localStorage.clear();
        //把ul底下的li都移除
        var ul = document.getElementById("stickies");
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
        }
    }
};

var addStickyDOM = function(key, value) {
    //取得ul的id(stickies)
    var stickies = document.getElementById("stickies");

    //建立li element,設定sticky的attribute(用key設定為id)
    var sticky = document.createElement("li");
    sticky.setAttribute("id", key);



    //建立div(.note)
    var note = document.createElement("div");
    note.setAttribute("class", "note");

    //建立div(.titleBar)
    var titleBar = document.createElement("div");
    titleBar.setAttribute("class", "titleBar");

    //建立titleBar內的add/delete 
    var addInBar = document.createElement("img");
    var deleteInBar = document.createElement("img");
    addInBar.setAttribute("class", "addInBar");
    deleteInBar.setAttribute("class", "deleteInBar");
    addInBar.setAttribute("src", "addInBar.png");
    deleteInBar.setAttribute("src", "deleteInBar.png");

    //建立 textArea ,設定text Area的placeholder
    var textArea = document.createElement("textArea");
    textArea.setAttribute("placeholder", value);

    //add/delete 加上onlick event
    addInBar.onclick = createSticky;
    deleteInBar.onclick = deleteSticky;

    //titleBar加入delete與add div
    titleBar.appendChild(addInBar);
    titleBar.appendChild(deleteInBar);

    //div.note加入titleBar與textArea
    note.appendChild(titleBar);
    note.appendChild(textArea);

    //li.sticky加入div.note
    sticky.appendChild(note);

    //ul#stickies加入li.sticky
    stickies.appendChild(sticky);

    //替note加上mousedoen listener
    document.getElementById(key).addEventListener("mousedown", mousedown, false);

    //替window加上mouseup listener

    document.body.addEventListener("mouseup", mouseup, false);

};


var deleteSticky = function(e) {
    //抓出被點的element的id(即key)
    //e.target代表發動event的那個element
    // var key = e.target.id;

    //?
    // if (e.target.tagName.toLowerCase() == "span")
    //     key = e.target.parentNode.id;
    if (confirm("Are you sure to delete this notes?") === true) {
        var key = e.target.parentNode.parentNode.parentNode.id;

        //從localStorage中移除該記錄
        localStorage.removeItem(key);

        //把localStorage的Array找出來刪掉該Note的紀錄,並從螢幕上移除該note
        var stickiesArray = getStickiesArray();
        if (stickiesArray) {
            for (var i = 0; i < stickiesArray.length; i++) {
                if (key == stickiesArray[i])
                //有找到就把array中的記錄移除
                    stickiesArray.splice(i, 1);
            }
            localStorage.setItem("stickiesArray", JSON.stringify(stickiesArray));
            removeStickyFromDOM(key);
        }
    }
};

var removeStickyFromDOM = function(key) {
    var item = document.getElementById(key);
    item.parentNode.removeChild(item);
};


var xinNote;
var yinNote;

//鼠標放開事件
var mouseup = function(e) {
    document.body.removeEventListener('mousemove', noteMove, true);
};


//鼠標按下事件
var mousedown = function(e) {
    //非textarea及img才計算位置
    console.log(e.target.nodeName);
    if (e.target.nodeName != "TEXTAREA" && e.target.nodeName != "IMG") {
        console.log(e.target);
        var key = e.target.parentNode.id;
        console.log(key);
        var li = document.getElementById(key);
        yinNote = e.clientY - parseInt(li.offsetTop);
        xinNote = e.clientX - parseInt(li.offsetLeft);
        document.body.addEventListener('mousemove', noteMove, true);
    }
};

//make the note moveable
var noteMove = function(e) {
    var key = e.target.parentNode.id;
    var li = document.getElementById(key);
    //設定移動後的top及left距離
    li.style.position = 'absolute';
    li.style.top = (e.clientY - yinNote) + 'px';
    li.style.left = (e.clientX - xinNote) + 'px';

};
