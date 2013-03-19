// Flickr Zoomer for RSS reader Forger
// version 0.8.4.1
// 2013-3-15
// Copyright (c) 2012, Eric Liu(musicxing@gmail.com)
// Thanks Semon Xue (semonxue@gmail.com)
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// --------------------------------------------------------------------
// ==UserScript==
// @name           Flickr Zoomer for RSS reader
// @namespace      http://diveintomark.org/projects/greasemonkey/
// @description    Flickr Zoomer for RSS Reader
// @include         http://reader.google.tld/reader/*
// @include         https://reader.google.tld/reader/*
// @include         http://www.google.tld/reader/*
// @include         https://www.google.tld/reader/*
// @include         https://xianguo.com/reader*
// @include         http://xianguo.com/reader*
// @include         http://reader.youdao.com/*
// ==/UserScript==
//
//Change Logs
//0.8.4.1 - [2013-3-15]Update the firefox version to have the same function as the chrome one. And add the ability of showing 800px images. Also set this option as the default option.
//0.8.2 - [2012-1-2]Update parse rules to fit flickr urls change.
//0.8	- [2009-12-15]Add copy links function and shortcuts to photo page and size page.
//0.7.1	- fix a bug on some zoomed photo not show unavailable
//		  know issue:photo will not show when the Medium size is the Original size.Need get secret.
//0.7   - Add compatibility functions to folder view.Now you can organise all your flickr RSS to a folder with keyword flickr.
//        - this code now can be run as well on Google Chrome dev.
//0.6	- Add auto scroll mode. Shortcuts :
//							 				Shift+1~5	- Change speeds(Slowest ~ Fastest);
//											Shift+z		- Switch between auto-scroll mode and manual-scroll mode;
//											Any Click to stop auto-scrolling;
//											
//0.5	- Increased URLs compatibility.  
//0.4	- Add support for Xianguo.com - a Chinese RSS reader like gReader. Update this script at Beijing airport.FOUR hours dely!
//		- Change name from 'Flickr Group Zoomer for Google Reader' to 'Flickr Zoomer for RSS reader'.
//0.3	- use mouse scroll event to replace click event,so you need not to waste clicks.

var _msgPanelId = 'scroll-info-panel-0';
var _msgPanelValue_mode = 'scroll-info-panel-mode';
var _msgPanelValue_speed = 'scroll-info-panel-speed';

var _panelCreated = false;

var _photoSizes = [
    {
        size:800,
        key:'_b'
    },
    {
        size:800,
        key:'_c'
    },
	{
		size:640,
		key:'_z'
	},
	{
		size:500,
		key:''
	}
];

var _photoSize = 0;

var _autoScrollBody;

var _flickerZoomerVersion = "0.8.4";


document.addEventListener('scroll', myScrollEventHandle, true);
document.addEventListener('keydown', myKeyDownEventHandle, true);

function myKeyDownEventHandle(event){
	
	//检测键盘输入，打开/关闭信息面板
	if(event.shiftKey && event.keyCode){
		switch(String.fromCharCode(event.keyCode)){
			case 's' :
			case 'S' :
				_photoSize = (_photoSize+1)%_photoSizes.length;
				showMsgPanel();
				break;
		}
	}
}

function myScrollEventHandle(e){
	//alert(checkFlickrRSS());
	if(checkFlickrRSS()){
		doReparseFlickr();
		
		showMsgPanel();
	}else{
		hideMsgPanel();	
	}
}

function checkFlickrRSS(){
    return true;

	// for Google Reader
	if(		checkString(top.location.href,"api\\.flickr\\.com") ||
			checkString(top.location.href,"flickr")){
		if(document.getElementById('entries')){
			_autoScrollBody = 	document.getElementById('entries');	
			return 'flickr'	;
		}
	}
	
	// for xianguo.com
	if(document.getElementById('itemList_header')){
		if(checkString(document.getElementById('itemList_header').innerHTML,"flickr\\.com")){
		_autoScrollBody = 	document.getElementById('context_itemList');
		return 'xianguo';
		}
	}
	
	return false;
}


function setMsg(k,v){
	if(document.getElementById(k)){
		document.getElementById(k).innerHTML = v;
	}else{
		return false;	
	}
}

function createMsgPanel(){
	if(document.getElementById(_msgPanelId)){
		return true;
	}
	var div,desc;
	div = document.createElement('div');
	div.id = _msgPanelId;
	div.style.position			= 'fixed';
	div.style.right				= '260px';
	div.style.bottom			= '2px';
	div.style.border			= '0px';
	div.style.backgroundColor	= '#333333';
	div.style.color				= '#ffffff';
	div.style.margin			= '2px';
	div.style.padding			= '2px';
	div.style.width				= '30%';
	div.style.fontSize			= '7pt';
	div.style.display			= 'none';
	
	desc = '<div align="center"><strong>Flickr Zoomer </strong>(v'+_flickerZoomerVersion+')&nbsp;&nbsp;';
	desc += 'Active(Shift+Z) : <b><span id='+_msgPanelValue_mode+'>-</span></b>&nbsp;&nbsp;';
	desc += 'Speed(Shift+1~5) : <b><span id='+_msgPanelValue_speed+'>-</span></b>&nbsp;&nbsp;';
	desc +=	'';
	desc += '</div>';
	desc += '';
	div.innerHTML = desc;
	
	var addScript = document.createElement("script");
	addScript.type = "text/javascript";
	/* for chrome 
	addScript.text = "function createTextArea(value) {var txt = document.createElement('textarea');txt.style.position = 'absolute';txt.style.left = '-100%';if (value !== null)txt.value = value;document.body.appendChild(txt);return txt;};";
	addScript.text += "function copyIt(data) {if (data === null) return;var txt = createTextArea(data);txt.select();document.execCommand('Copy');document.body.removeChild(txt);alert('Content Copied : '+data);}";
	*/
	
	/* for firefox */
	addScript.text += "function copyIt(txt) {netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect'); var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard); if (!clip) return; var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable); if (!trans) return; trans.addDataFlavor('text/unicode'); var str = new Object(); var len = new Object(); var str = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString); var copytext=txt; str.data=copytext; trans.setTransferData('text/unicode',str,copytext.length*2); var clipid=Components.interfaces.nsIClipboard;if (!clip) return false;clip.setData(trans,null,clipid.kGlobalClipboard);alert('Content Copied : '+txt);}";
	
	
	document.addEventListener(
	    "load",
	   function() {
	        if(document.body.appendChild(div) && _panelCreated==false){
	        	setAutoScrollMode(false);
				setAutoScrollSpeed(1);
				_panelCreated = true;
				
				document.body.appendChild(addScript);
	        }
			
	    },
	    true);
	
}

function showMsgPanel(){
	if(!document.getElementById(_msgPanelId)){
		return false;	
	}
	if(checkFlickrRSS()){
		document.getElementById(_msgPanelId).style.display = 'block';
		//setTimeout(function(){hideMsgPanel();},5000);
	}
}

function hideMsgPanel(){
	if(document.getElementById(_msgPanelId)){
		document.getElementById(_msgPanelId).style.display = 'none';
	}
}

function doReparseFlickr(){
   	var allTextareas = document.getElementsByTagName('img');
	for (var i = 0; i < allTextareas.length; i++) {
		if(checkString(allTextareas[i].src,"staticflickr\\.com") && !allTextareas[i].hasAttribute("isReplaced")){
			allTextareas[i].removeAttribute("width");
			allTextareas[i].removeAttribute("height");
			allTextareas[i].setAttribute("style","border:#cccccc solid 4px");
			var tmpStr = allTextareas[i].src;
            if(checkString(tmpStr,"ydstatic\\.com")){
                var ydposs = tmpStr.indexOf("&w=");
                var ydpose = tmpStr.indexOf("&url=");
                tmpStr = tmpStr.substring(0, ydposs) + tmpStr.substring(ydpose);
            }
			var photoExt = tmpStr.substr(-3);
			var photoBodyPos = (tmpStr.indexOf("_", tmpStr.length - 10) > 0) ? tmpStr.indexOf("_", tmpStr.length - 10) : (tmpStr.length - 4);
			allTextareas[i].src = tmpStr.substring(0, photoBodyPos) + _photoSizes[_photoSize]['key'] +"." + photoExt;
            //if(_photoSizes[_photoSize]['key']=='_b'){
                //allTextareas[i].setAttribute("width",800);
            //}
			//allTextareas[i].src = tmpStr.substring(0,tmpStr.length-6)+"."+photoExt;
			//
			var photoLinkObj = allTextareas[i].parentNode;
			//
			var photoHolderObj = allTextareas[i].parentNode.parentNode;
			var photoActions = "<div style='border:#cccccc dashed 1px;padding:4px;'>";
			photoActions += "Link to : ";
			photoActions += "<a href='"+allTextareas[i].parentNode.href+"' target='_blank'>Page</a>&nbsp;";
			photoActions += "<a href='"+allTextareas[i].parentNode.href+"sizes/m/' target='_blank'>Sizes</a>&nbsp;<br/>";
			
			photoActions += "Copy : ";
			photoActions += "<a href='javascript:copyIt(\" "+allTextareas[i].parentNode.href+" \")'>Page url</a>&nbsp;";
			photoActions += "<a href='javascript:copyIt(\" <a href="+allTextareas[i].parentNode.href+"><img src="+allTextareas[i].src+" border=0 /></a> \")'>Link to page</a>&nbsp;";
			photoActions += "<a href='javascript:copyIt(\""+allTextareas[i].src+"\")'>Photo url</a>&nbsp;";
			photoActions += "<a href='javascript:copyIt(\"<img src="+allTextareas[i].src+" border=0/>\")'>&lt;IMG&gt;</a>&nbsp;";
			photoActions += "<a href='javascript:copyIt(\"[IMG]"+allTextareas[i].src+"[/IMG]\")'>[IMG]</a>&nbsp;<br/>";
			
			photoActions += "</div>";
			photoHolderObj.innerHTML += photoActions;
						
			allTextareas[i].setAttribute("isReplaced","true");
			}
		}
		
	}

function checkString(str,reg){
	if(str.length){
		var re = new RegExp(reg);
		var result = re.exec(str);
		return result ? result : false;

	}else{
		return false;
	}
}

createMsgPanel();

