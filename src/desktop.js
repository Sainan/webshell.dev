// Desktop Management

if(!navigator.userAgentData.mobile)
{
	document.querySelector("body").style.overflow = "hidden";
}

function desktop_getWidth()
{
	return document.querySelector(".desktop").clientWidth;
}

function desktop_getHeight()
{
	return document.querySelector(".desktop").clientHeight;
}

window.onresize = function()
{
	document.querySelectorAll(".window").forEach(wnd => {
		if(window_isMaximised(wnd))
		{
			window_fillScreen(wnd);
		}
		else
		{
			window_clamp(wnd);
		}
	});
};

function desktop_duelwield(a, b)
{
	if(desktop_getWidth() > desktop_getHeight())
	{
		let width = (desktop_getWidth() / 2);
		window_setRect(a, 0, 0, width, desktop_getHeight());
		window_setRect(b, width, 0, width, desktop_getHeight());
	}
	else
	{
		let height = (desktop_getHeight() / 2);
		window_setRect(a, 0, 0, desktop_getWidth(), height);
		window_setRect(b, 0, height, desktop_getWidth(), height);
	}
}

// Window Interactions

let dragWnd, dragX, dragY, resizeWnd, highz = 0;

function event_getClientX(e)
{
	return "changedTouches" in e
	? e.changedTouches[0].clientX
	: e.clientX
	;
}

function event_getClientY(e)
{
	return "changedTouches" in e
	? e.changedTouches[0].clientY
	: e.clientY
	;
}

function window_addEventListeners(wnd)
{
	wnd.onmousedown = wnd.ontouchstart = function(e)
	{
		window_bringToFront(this);
		if(!("changedTouches" in e) && e.which != 1)
		{
			return;
		}
		if(e.target.className == "window-head"
			|| e.target.className == "window-title"
			)
		{
			dragWnd = this;
			document.querySelector(".desktop").classList.add("drag");
			let rect = this.getBoundingClientRect();
			dragX = rect.x - event_getClientX(e);
			dragY = rect.y - event_getClientY(e);
			e.preventDefault();
		}
		else if(e.target.className == "window-resize")
		{
			resizeWnd = this;
			document.querySelector(".desktop").classList.add("drag");
			document.querySelector(".desktop").style.cursor = "se-resize";
			e.preventDefault();
		}
	};
	wnd.querySelector(".window-title").ondblclick = function()
	{
		window_toggleMaximise(wnd);
	};
	wnd.querySelector(".window-maximise").onclick = function()
	{
		window_toggleMaximise(wnd);
	};
	wnd.querySelector(".window-close").onclick = function()
	{
		window_close(wnd);
	};
}

window.onmousemove = window.ontouchmove = function(e)
{
	if(dragWnd)
	{
		if (window_isMaximised(dragWnd))
		{
			let rect = dragWnd.getBoundingClientRect();
			let perc_x = (event_getClientX(e) - rect.x) / rect.width;
			let perc_y = (event_getClientY(e) - rect.y) / rect.height;
			window_demaximise(dragWnd);
			rect = dragWnd.getBoundingClientRect();
			window_setX(dragWnd, event_getClientX(e) - (rect.width * perc_x));
			window_setY(dragWnd, event_getClientY(e) - (rect.height * perc_y));
			rect = dragWnd.getBoundingClientRect();
			dragX = rect.x - event_getClientX(e);
			dragY = rect.y - event_getClientY(e);
		}
		else
		{
			window_setPos(dragWnd, dragX + event_getClientX(e), dragY + event_getClientY(e));
		}
	}
	if(resizeWnd)
	{
		let rect = resizeWnd.getBoundingClientRect();
		window_setWidth(resizeWnd, event_getClientX(e) - rect.x + 1);
		window_setHeight(resizeWnd, event_getClientY(e) - rect.y + 1);
	}
};

window.onmouseup = window.ontouchend = function(e)
{
	if(dragWnd)
	{
		window_clamp(dragWnd);
		dragWnd = undefined;
		document.querySelector(".desktop").classList.remove("drag");
	}
	if(resizeWnd)
	{
		window_clamp(resizeWnd);
		resizeWnd = undefined;
		document.querySelector(".desktop").classList.remove("drag");
		document.querySelector(".desktop").style.cursor = "";
	}
};

// Window API

function window_bringToFront(wnd)
{
	if(document.querySelector(".topmost"))
	{
		document.querySelector(".topmost").classList.remove("topmost");
	}
	wnd.classList.add("topmost");
	wnd.style.zIndex = ++highz;
}

function window_setRect(wnd, x, y, width, height)
{
	window_setX(wnd, x);
	window_setY(wnd, y);
	window_setWidth(wnd, width);
	window_setHeight(wnd, height);
}

function window_setPos(wnd, x, y)
{
	window_setX(wnd, x);
	window_setY(wnd, y);
}

function window_setX(wnd, x)
{
	wnd.style.left = x + "px";
}

function window_setY(wnd, y)
{
	wnd.style.top = y + "px";
}

function window_setWidth(wnd, width)
{
	if(width < 100)
	{
		width = 100;
	}
	wnd.style.width = width + "px";
}

function window_setHeight(wnd, height)
{
	if(height < 180)
	{
		height = 180;
	}
	wnd.style.height = height + "px";
}

function window_setPosToCenter(wnd)
{
	window_setX(wnd, (document.querySelector(".desktop").clientWidth - wnd.clientWidth) / 2);
	window_setY(wnd, (document.querySelector(".desktop").clientHeight - wnd.clientHeight) / 2);
}

function window_clamp(wnd)
{
	let rect = wnd.getBoundingClientRect();

	if(wnd.clientWidth > desktop_getWidth())
	{
		window_setX(wnd, 0);
		window_setWidth(wnd, desktop_getWidth());
	}
	else if(rect.x < 0)
	{
		window_setX(wnd, 0);
	}
	else if(rect.x + rect.width > desktop_getWidth())
	{
		window_setX(wnd, desktop_getWidth() - rect.width);
	}

	if(wnd.clientHeight > desktop_getHeight())
	{
		window_setY(wnd, 0);
		window_setHeight(wnd, desktop_getHeight());
	}
	else if(rect.y < 0)
	{
		window_setY(wnd, 0);
	}
	else if(rect.y + rect.height > desktop_getHeight())
	{
		window_setY(wnd, desktop_getHeight() - rect.height);
	}
}

function window_close(wnd)
{
	let topmost = wnd.classList.contains("topmost");
	wnd.parentNode.removeChild(wnd);
	if (topmost)
	{
		topmost = undefined;
		highest_z = 0;
		document.querySelectorAll(".window").forEach(wnd => {
			if(wnd.style.zIndex > highest_z)
			{
				topmost = wnd;
				highest_z = wnd.style.zIndex;
			}
		});
		if(topmost !== undefined)
		{
			topmost.classList.add("topmost");
		}
	}
}

function window_getTitle(wnd)
{
	return wnd.querySelector(".window-title").textContent;
}

function window_setTitle(wnd, title)
{
	wnd.querySelector(".window-title").textContent = title;
}

function window_fillScreen(wnd)
{
	window_setPos(wnd, 0, 0);
	window_setWidth(wnd, desktop_getWidth());
	window_setHeight(wnd, desktop_getHeight());
}

function window_toggleMaximise(wnd)
{
	if (window_isMaximised(wnd))
	{
		window_demaximise(wnd);
	}
	else
	{
		let rect = wnd.getBoundingClientRect();
		wnd.setAttribute("data-pre-maximise", [ rect.x, rect.y, rect.width, rect.height ].join(" "));
		window_fillScreen(wnd);
		wnd.querySelector(".window-maximise").textContent = "v";
		wnd.querySelector(".window-maximise").title = "Restore Down";
	}
}

function window_isMaximised(wnd)
{
	return wnd.hasAttribute("data-pre-maximise");
}

function window_demaximise(wnd)
{
	let arr = wnd.getAttribute("data-pre-maximise").split(" ");
	wnd.removeAttribute("data-pre-maximise");
	window_setPos(wnd, arr[0], arr[1]);
	window_setWidth(wnd, arr[2]);
	window_setHeight(wnd, arr[3]);
	window_clamp(wnd);
	wnd.querySelector(".window-maximise").textContent = "^";
	wnd.querySelector(".window-maximise").title = "Maximise";
}

function createWindow(_title, body)
{
	let wnd = document.createElement("div");
	wnd.className = "window";
	wnd.style.width = "900px";
	wnd.style.height = "500px";

	let head = document.createElement("div");
	head.className = "window-head";

	let title = document.createElement("span");
	title.className = "window-title";
	title.textContent = _title;
	head.appendChild(title);

	let maximise = document.createElement("span");
	maximise.className = "window-maximise";
	maximise.textContent = "^";
	maximise.title = "Maximise";
	head.appendChild(maximise);

	let close = document.createElement("span");
	close.className = "window-close";
	close.textContent = "X";
	close.title = "Close";
	head.appendChild(close);

	wnd.appendChild(head);

	body.classList.add("window-body");
	wnd.appendChild(body);

	let resize = document.createElement("div");
	resize.className = "window-resize";
	wnd.appendChild(resize);

	document.querySelector(".desktop").appendChild(wnd);

	window_setPosToCenter(wnd);
	window_clamp(wnd);
	window_bringToFront(wnd);
	window_addEventListeners(wnd);

	return wnd;
}

// Terminal

function createTerminal()
{
	let body = document.createElement("div");
	body.style.fontFamily = "monospace";

	let output = document.createElement("pre");
	output.id = "output";
	body.appendChild(output);

	body.innerHTML += '<form onsubmit="return executeCommand();"><pre id="input"><span id="input-prefix"></span> <input type="text" onkeydown="return terminal_onKeyDown(event);"></pre></form>';

	let wnd = createWindow("Terminal", body);

	addLine("Welcome to the web shell. Everything here is happening in your browser.");
	addLine('Use "help" to get a list of commands.');
	enableInput();

	return wnd;
}

// Web Browser

function createWebBrowser()
{
	let body = document.createElement("iframe");
	body.src = "/web/";
	createWindow("Web Browser", body);
}

// Editor

function createEditor(file)
{
	let id = "editor"+Math.random();

	let div = document.createElement("div");
	div.id = id;
	div.textContent = file.contents;

	let wnd = createWindow("Editor - " + file.getPath(), div);

	let editor = ace.edit(id);
	editor.setTheme("ace/theme/monokai");
	editor.session.setUseWorker(false);
	editor.session.setMode("ace/mode/lua");
	editor.session.on("change", function(delta)
	{
		editor_getFile(wnd).contents = editor.getValue();
		fsExport();
	});
	editor.focus();

	return wnd;
}

function editor_getPath(wnd)
{
	return window_getTitle(wnd).substr(9);
}

function editor_getFile(wnd)
{
	return fsRoot.resolveFileAndCreateIfNeeded(editor_getPath(wnd));
}

// Desktop Files

function desktop_addFile(file)
{
	let div = document.createElement("div");
	div.className = "file";
	div.textContent = file.name;
	div.onclick = function()
	{
		createEditor(file);
	};
	div.oncontextmenu = function(e)
	{
		let ctx = ctx_create(e);
		ctx_addOption(ctx, "<b>Open</b>", function()
		{
			createEditor(file);
		});
		ctx_addOption(ctx, "Delete", function()
		{
			file.parent.removeChild(file);
			fsExport();
		});
	};
	document.querySelector(".desktop").appendChild(div);
}

function desktop_removeFile(file)
{
	for(let i = 0; i != document.querySelector(".desktop").children.length; ++i)
	{
		let elm = document.querySelector(".desktop").children[i];
		if(elm.classList.contains("file")
			&& elm.textContent == file.name
			)
		{
			document.querySelector(".desktop").removeChild(elm);
			break;
		}
	}
}

// FS State Management

function fsImport(parent, desc)
{
	if (desc.type == 0)
	{
		fsImportDir(parent.addDir(desc.name), desc.children);
	}
	else if (desc.type == 1)
	{
		parent.addFile(desc.name, desc.contents);
	}
}

function fsImportDir(node, children)
{
	children.forEach(desc => fsImport(node, desc));
}

function fsExport()
{
	localStorage.setItem("fs", JSON.stringify(fsRoot.serialise().children));
}

window.fsRoot = new FsDir(undefined, "");
fsRoot.addDir("home").addDir("web_user").addDir("Desktop");
fsRoot.addDir("tmp");
if(localStorage.getItem("fs"))
{
	fsImportDir(fsRoot, JSON.parse(localStorage.getItem("fs")));
}

// Context Menu

function ctx_create(e)
{
	e.preventDefault();

	let div = document.createElement("div");
	div.className = "context-menu";
	div.style.left = e.clientX + "px";
	div.style.top = e.clientY + "px";
	return document.querySelector(".desktop").appendChild(div);
}

function ctx_addOption(ctx, title, onclick)
{
	let div = document.createElement("div");
	div.innerHTML = title;
	div.onclick = function(e)
	{
		onclick(e);
		ctx_close();
	};
	ctx.appendChild(div);
}

function ctx_close()
{
	let ctx = document.querySelector(".context-menu");
	if(ctx)
	{
		ctx.parentNode.removeChild(ctx);
	}
}

window.onmousedown = function(e)
{
	let elm = e.target;
	while (elm && elm.classList)
	{
		if(elm.classList.contains("context-menu"))
		{
			return;
		}
		elm = elm.parentNode;
	}
	ctx_close();
};
